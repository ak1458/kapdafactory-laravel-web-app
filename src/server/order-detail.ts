import { prisma } from '@/src/server/prisma';
import { serializeOrder } from '@/src/server/serializers';
import { getLegacyImagesForOrder, shouldUseLegacyImageFallback } from '@/src/server/legacy-images';

type OrderDetailMode = 'full' | 'lite';
type OrderDetailOptions = {
    mode?: OrderDetailMode;
};

function parseLimitFromEnv(raw: string | undefined, fallback: number, max: number) {
    const parsed = Number.parseInt(String(raw || '').trim(), 10);
    if (!Number.isSafeInteger(parsed) || parsed < 1) {
        return fallback;
    }
    return Math.min(parsed, max);
}

export const ORDER_DETAIL_LITE_IMAGES_LIMIT = parseLimitFromEnv(
    process.env.KF_ORDER_DETAIL_LITE_IMAGES_LIMIT,
    6,
    20
);
export const ORDER_DETAIL_IMAGES_LIMIT = parseLimitFromEnv(
    process.env.KF_ORDER_DETAIL_IMAGES_LIMIT,
    24,
    300
);
export const ORDER_DETAIL_PAYMENTS_LIMIT = parseLimitFromEnv(
    process.env.KF_ORDER_DETAIL_PAYMENTS_LIMIT,
    40,
    400
);
export const ORDER_DETAIL_LOGS_LIMIT = parseLimitFromEnv(
    process.env.KF_ORDER_DETAIL_LOGS_LIMIT,
    80,
    500
);

function clampWithTruncation<T>(items: T[], limit: number) {
    if (items.length <= limit) {
        return { items, truncated: false };
    }
    return {
        items: items.slice(0, limit),
        truncated: true,
    };
}

export async function getSerializedOrderDetail(orderId: number, options: OrderDetailOptions = {}) {
    const mode: OrderDetailMode = options.mode === 'lite' ? 'lite' : 'full';
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: {
            id: true,
            token: true,
            billNumber: true,
            customerName: true,
            totalAmount: true,
            measurements: true,
            deliveryDate: true,
            entryDate: true,
            actualDeliveryDate: true,
            status: true,
            remarks: true,
            createdBy: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    if (!order) {
        return null;
    }

    const imageLimit = mode === 'lite' ? ORDER_DETAIL_LITE_IMAGES_LIMIT : ORDER_DETAIL_IMAGES_LIMIT;

    if (mode === 'lite') {
        // In lite mode, we only need the user-facing basics fast.
        // We fetch 1 image just for a thumbnail if needed, and skip payments/logs.
        const [images] = await Promise.all([
            prisma.orderImage.findMany({
                where: { orderId },
                select: {
                    id: true,
                    orderId: true,
                    filename: true,
                    mime: true,
                    size: true,
                    createdAt: true,
                    updatedAt: true,
                },
                orderBy: { createdAt: 'desc' },
                take: 1, // Reduced from imageLimit to 1 for faster list view/initial load
            }),
        ]);

        const serialized = serializeOrder({
            ...order,
            images,
            payments: [],
            logs: [],
        }) as any;

        // Defer payment calculation for the full fetch to avoid aggregate overhead on every list item
        const totalAmount = Number(order.totalAmount);
        serialized.paid_amount = 0; // Placeholder
        serialized.balance = totalAmount; // Placeholder, client should rely on full fetch for accurate balance

        serialized.meta = {
            mode: 'lite',
            history_deferred: true,
            images_returned: images.length,
            images_truncated: true,
            payments_returned: 0,
            payments_truncated: true,
            logs_returned: 0,
            logs_truncated: true,
        };

        if (
            shouldUseLegacyImageFallback(order.id) &&
            (!Array.isArray(serialized.images) || serialized.images.length === 0)
        ) {
            serialized.images = await getLegacyImagesForOrder(order.id, 1);
        }

        return serialized;
    }

    const [rawImages, rawPayments, rawLogs, paymentTotals] = await Promise.all([
        prisma.orderImage.findMany({
            where: { orderId },
            select: {
                id: true,
                orderId: true,
                filename: true,
                mime: true,
                size: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: { createdAt: 'desc' },
            take: ORDER_DETAIL_IMAGES_LIMIT + 1,
        }),
        prisma.payment.findMany({
            where: { orderId },
            select: {
                id: true,
                orderId: true,
                amount: true,
                paymentDate: true,
                paymentMethod: true,
                note: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: [{ paymentDate: 'desc' }, { id: 'desc' }],
            take: ORDER_DETAIL_PAYMENTS_LIMIT + 1,
        }),
        prisma.orderLog.findMany({
            where: {
                orderId,
                action: {
                    startsWith: 'status_changed:',
                },
            },
            select: {
                id: true,
                orderId: true,
                userId: true,
                action: true,
                note: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
            take: ORDER_DETAIL_LOGS_LIMIT + 1,
        }),
        prisma.payment.aggregate({
            where: { orderId },
            _sum: { amount: true },
        }),
    ]);

    const { items: images, truncated: imagesTruncated } = clampWithTruncation(rawImages, ORDER_DETAIL_IMAGES_LIMIT);
    const { items: payments, truncated: paymentsTruncated } = clampWithTruncation(rawPayments, ORDER_DETAIL_PAYMENTS_LIMIT);
    const { items: logs, truncated: logsTruncated } = clampWithTruncation(rawLogs, ORDER_DETAIL_LOGS_LIMIT);

    const serialized = serializeOrder({
        ...order,
        images,
        payments,
        logs,
    }) as any;
    const paidAmount = Number(paymentTotals._sum.amount || 0);
    const totalAmount = Number(order.totalAmount);

    serialized.paid_amount = paidAmount;
    serialized.balance = Math.max(0, totalAmount - paidAmount);
    serialized.meta = {
        mode: 'full',
        history_deferred: false,
        images_returned: images.length,
        images_truncated: imagesTruncated,
        payments_returned: payments.length,
        payments_truncated: paymentsTruncated,
        logs_returned: logs.length,
        logs_truncated: logsTruncated,
    };

    if (
        shouldUseLegacyImageFallback(order.id) &&
        (!Array.isArray(serialized.images) || serialized.images.length === 0)
    ) {
        serialized.images = await getLegacyImagesForOrder(order.id, Math.min(8, ORDER_DETAIL_IMAGES_LIMIT));
    }

    return serialized;
}
