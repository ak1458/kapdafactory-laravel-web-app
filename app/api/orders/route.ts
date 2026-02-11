import { OrderStatus, Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/src/server/auth';
import { parseDateValue, toDateOnly, toIso } from '@/src/server/dates';
import { getLegacyImageMap } from '@/src/server/legacy-images';
import { storeOrderImage } from '@/src/server/files';
import { prisma } from '@/src/server/prisma';
import { serializeImage, serializeOrder } from '@/src/server/serializers';
import { parseOrderStatus, parsePositiveInt } from '@/src/server/validators';

const MAX_IMAGES_PER_ORDER = 8;
const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024;

function endOfUtcDay(date: Date) {
    const d = new Date(date);
    d.setUTCHours(23, 59, 59, 999);
    return d;
}

function nextUtcDay(date: Date) {
    const d = new Date(date);
    d.setUTCDate(d.getUTCDate() + 1);
    return d;
}

function asSortOrder(value: string | null) {
    return value === 'asc' ? 'asc' : 'desc';
}

function buildOrderFilters(
    params: URLSearchParams,
    status: OrderStatus | null,
    dateFrom: Date | null,
    dateTo: Date | null,
    exactDate: Date | null
): Prisma.OrderWhereInput {
    const where: Prisma.OrderWhereInput = {};

    const search = params.get('search')?.trim();

    if (search) {
        const or: Prisma.OrderWhereInput[] = [
            { token: { contains: search, mode: 'insensitive' } },
            { billNumber: { contains: search, mode: 'insensitive' } },
            { customerName: { contains: search, mode: 'insensitive' } },
        ];

        const searchDate = parseDateValue(search);
        if (searchDate) {
            or.push({
                deliveryDate: {
                    gte: searchDate,
                    lt: nextUtcDay(searchDate),
                },
            });
        }

        where.OR = or;
    }

    if (status) {
        where.status = status;
    }

    if (exactDate) {
        where.deliveryDate = {
            gte: exactDate,
            lt: nextUtcDay(exactDate),
        };
    } else if (dateFrom || dateTo) {
        where.deliveryDate = {
            ...(dateFrom ? { gte: dateFrom } : {}),
            ...(dateTo ? { lte: endOfUtcDay(dateTo) } : {}),
        };
    }

    return where;
}

export async function GET(request: NextRequest) {
    const authUser = await getAuthUser(request);
    if (!authUser) {
        return NextResponse.json({ message: 'Unauthenticated.' }, { status: 401 });
    }

    const params = request.nextUrl.searchParams;
    const statusRaw = params.get('status');
    const status = parseOrderStatus(statusRaw);
    if (statusRaw && statusRaw !== 'all' && !status) {
        return NextResponse.json({ message: 'Invalid status value.' }, { status: 422 });
    }

    const dateFromRaw = params.get('date_from');
    const dateToRaw = params.get('date_to');
    const dateRaw = params.get('date');

    const dateFrom = parseDateValue(dateFromRaw);
    const dateTo = parseDateValue(dateToRaw);
    const exactDate = parseDateValue(dateRaw);

    if (dateFromRaw && !dateFrom) {
        return NextResponse.json({ message: 'Invalid date_from value.' }, { status: 422 });
    }
    if (dateToRaw && !dateTo) {
        return NextResponse.json({ message: 'Invalid date_to value.' }, { status: 422 });
    }
    if (dateRaw && !exactDate) {
        return NextResponse.json({ message: 'Invalid date value.' }, { status: 422 });
    }

    const where = buildOrderFilters(params, status, dateFrom, dateTo, exactDate);

    const page = parsePositiveInt(params.get('page')) ?? 1;
    const perPage = Math.min(60, parsePositiveInt(params.get('per_page')) ?? 30);
    const sortBy = params.get('sort_by') || 'created_at';
    const sortOrder = asSortOrder(params.get('sort_order'));

    const orderBy: Prisma.OrderOrderByWithRelationInput[] =
        sortBy === 'delivery_date'
            ? [{ deliveryDate: sortOrder }, { createdAt: 'desc' }]
            : [{ createdAt: sortOrder }];

    const [total, orders] = await prisma.$transaction([
        prisma.order.count({ where }),
        prisma.order.findMany({
            where,
            select: {
                id: true,
                token: true,
                billNumber: true,
                customerName: true,
                totalAmount: true,
                deliveryDate: true,
                entryDate: true,
                actualDeliveryDate: true,
                status: true,
                remarks: true,
                createdBy: true,
                createdAt: true,
                updatedAt: true,
                images: {
                    select: {
                        id: true,
                        orderId: true,
                        filename: true,
                        mime: true,
                        size: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                    orderBy: {
                        createdAt: 'asc',
                    },
                    take: 1,
                },
            },
            orderBy,
            skip: (page - 1) * perPage,
            take: perPage,
        }),
    ]);

    const orderIds = orders.map((order) => order.id);
    const paymentTotals = orderIds.length
        ? await prisma.payment.groupBy({
            by: ['orderId'],
            where: {
                orderId: {
                    in: orderIds,
                },
            },
            _sum: {
                amount: true,
            },
        })
        : [];

    const paidByOrderId = new Map(paymentTotals.map((item) => [item.orderId, Number(item._sum.amount || 0)]));
    const missingImageOrderIds = orders.filter((order) => order.images.length === 0).map((order) => order.id);
    const legacyImagesByOrderId = await getLegacyImageMap(missingImageOrderIds, 1);

    const serializedOrders = orders.map((order) => {
        const totalAmount = Number(order.totalAmount);
        const paidAmount = paidByOrderId.get(order.id) || 0;
        const dbImages = order.images.map(serializeImage);
        const fallbackImages = legacyImagesByOrderId.get(order.id) || [];

        return {
            id: order.id,
            token: order.token,
            bill_number: order.billNumber,
            customer_name: order.customerName,
            total_amount: totalAmount,
            measurements: {},
            delivery_date: toDateOnly(order.deliveryDate),
            entry_date: toDateOnly(order.entryDate),
            actual_delivery_date: toDateOnly(order.actualDeliveryDate),
            status: order.status,
            remarks: order.remarks,
            created_by: order.createdBy,
            created_at: toIso(order.createdAt),
            updated_at: toIso(order.updatedAt),
            paid_amount: paidAmount,
            balance: Math.max(0, totalAmount - paidAmount),
            images: dbImages.length ? dbImages : fallbackImages,
            payments: [],
            logs: [],
        };
    });

    const response: Record<string, unknown> = {
        current_page: page,
        data: serializedOrders,
        from: total === 0 ? null : (page - 1) * perPage + 1,
        last_page: Math.max(1, Math.ceil(total / perPage)),
        per_page: perPage,
        to: total === 0 ? null : Math.min(page * perPage, total),
        total,
    };

    if (params.get('date')) {
        const statsOrders = await prisma.order.findMany({
            where,
            select: {
                id: true,
                status: true,
                totalAmount: true,
            },
        });

        const statsOrderIds = statsOrders.map((order) => order.id);
        const statsPayments = statsOrderIds.length
            ? await prisma.payment.groupBy({
                by: ['orderId'],
                where: {
                    orderId: {
                        in: statsOrderIds,
                    },
                },
                _sum: {
                    amount: true,
                },
            })
            : [];

        const paidByStatsOrderId = new Map(statsPayments.map((item) => [item.orderId, Number(item._sum.amount || 0)]));

        const totalOrders = statsOrders.length;
        const totalCollection = statsOrders
            .filter((order) => order.status === 'delivered')
            .reduce((sum, order) => sum + Number(order.totalAmount), 0);

        const totalPending = statsOrders
            .filter((order) => order.status !== 'delivered' && order.status !== 'transferred')
            .reduce((sum, order) => sum + Number(order.totalAmount), 0);

        const duesCleared = statsOrders.reduce((count, order) => {
            const paid = paidByStatsOrderId.get(order.id) || 0;
            const balance = Number(order.totalAmount) - paid;
            return balance <= 0 ? count + 1 : count;
        }, 0);

        const partialPayments = statsOrders.reduce((count, order) => {
            const paid = paidByStatsOrderId.get(order.id) || 0;
            const balance = Number(order.totalAmount) - paid;
            return paid > 0 && balance > 0 ? count + 1 : count;
        }, 0);

        response.total_collection = totalCollection;
        response.total_pending = totalPending;
        response.total_orders = totalOrders;
        response.dues_cleared = duesCleared;
        response.partial_payments = partialPayments;
        response.full_payments = duesCleared;
    }

    return NextResponse.json(response);
}

export async function POST(request: NextRequest) {
    const authUser = await getAuthUser(request);
    if (!authUser) {
        return NextResponse.json({ message: 'Unauthenticated.' }, { status: 401 });
    }

    const formData = await request.formData();

    const token = String(formData.get('token') || '').trim();
    if (!token) {
        return NextResponse.json({ message: 'Token is required.' }, { status: 422 });
    }

    const billNumberInput = String(formData.get('bill_number') || '').trim();
    const customerName = String(formData.get('customer_name') || '').trim() || null;
    const deliveryDateRaw = String(formData.get('delivery_date') || '').trim();
    const deliveryDate = parseDateValue(deliveryDateRaw);
    if (deliveryDateRaw && !deliveryDate) {
        return NextResponse.json({ message: 'Invalid delivery date.' }, { status: 422 });
    }

    const entryDateRaw = String(formData.get('entry_date') || '').trim();
    const parsedEntryDate = parseDateValue(entryDateRaw);
    if (entryDateRaw && !parsedEntryDate) {
        return NextResponse.json({ message: 'Invalid entry date.' }, { status: 422 });
    }
    const entryDate = parsedEntryDate || parseDateValue(new Date().toISOString().slice(0, 10));

    const remarks = String(formData.get('remarks') || '').trim() || null;
    const totalAmountValue = Number(formData.get('total_amount') || 0);
    if (!Number.isFinite(totalAmountValue) || totalAmountValue < 0) {
        return NextResponse.json({ message: 'Total amount must be a valid number.' }, { status: 422 });
    }
    const totalAmount = totalAmountValue;

    const measurementsRaw = formData.get('measurements');
    let measurements: Prisma.InputJsonValue = {};
    if (typeof measurementsRaw === 'string' && measurementsRaw.trim()) {
        try {
            measurements = JSON.parse(measurementsRaw);
        } catch {
            measurements = {};
        }
    }

    const files = [...formData.getAll('images[]'), ...formData.getAll('images')].filter(
        (item): item is File => item instanceof File && item.size > 0
    );

    if (files.length > MAX_IMAGES_PER_ORDER) {
        return NextResponse.json(
            { message: `Maximum ${MAX_IMAGES_PER_ORDER} images are allowed per order.` },
            { status: 422 }
        );
    }

    const invalidType = files.find((file) => !file.type.startsWith('image/'));
    if (invalidType) {
        return NextResponse.json({ message: `Unsupported file type: ${invalidType.name}.` }, { status: 422 });
    }

    const tooLarge = files.find((file) => file.size > MAX_IMAGE_SIZE_BYTES);
    if (tooLarge) {
        return NextResponse.json({ message: `File ${tooLarge.name} is too large.` }, { status: 422 });
    }

    try {
        const order = await prisma.order.create({
            data: {
                token,
                billNumber: billNumberInput || token,
                customerName,
                deliveryDate,
                entryDate,
                measurements,
                remarks,
                status: 'pending',
                createdBy: authUser.id,
                totalAmount,
            },
        });

        for (const file of files) {
            const path = await storeOrderImage(order.id, file);
            await prisma.orderImage.create({
                data: {
                    orderId: order.id,
                    filename: path,
                    mime: file.type || null,
                    size: file.size,
                },
            });
        }

        const createdOrder = await prisma.order.findUniqueOrThrow({
            where: { id: order.id },
            include: {
                images: true,
                payments: true,
                logs: {
                    include: {
                        user: true,
                    },
                },
            },
        });

        return NextResponse.json(serializeOrder(createdOrder), { status: 201 });
    } catch (error: any) {
        if (error?.code === 'P2002') {
            const target = Array.isArray(error?.meta?.target) ? error.meta.target.join(',') : '';
            if (target.includes('bill_number') || target.includes('billNumber')) {
                return NextResponse.json({ message: 'Bill number already exists.' }, { status: 422 });
            }
            return NextResponse.json({ message: 'Token already exists.' }, { status: 422 });
        }

        return NextResponse.json({ message: 'Failed to create order.' }, { status: 500 });
    }
}
