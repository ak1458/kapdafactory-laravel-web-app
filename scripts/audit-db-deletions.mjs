import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import { isoDateStamp, loadMergedEnv, resolveDatabaseUrl } from './_env-utils.mjs';

function toPositiveIntList(value, fallback) {
    if (!value || typeof value !== 'string') return fallback;
    const parsed = value
        .split(',')
        .map((part) => Number(part.trim()))
        .filter((part) => Number.isSafeInteger(part) && part > 0);
    return parsed.length ? parsed : fallback;
}

async function main() {
    const env = loadMergedEnv();
    const databaseUrl = resolveDatabaseUrl(env);
    const targetOrderIds = toPositiveIntList(env.KF_AUDIT_ORDER_IDS, [1, 3]);

    if (!databaseUrl) {
        throw new Error('No database URL found. Set KF_DB_URL or DATABASE_URL/POSTGRES_PRISMA_URL.');
    }

    process.env.DATABASE_URL = databaseUrl;
    const prisma = new PrismaClient({ errorFormat: 'minimal' });

    try {
        const orders = await prisma.order.findMany({
            where: { id: { in: targetOrderIds } },
            select: {
                id: true,
                token: true,
                billNumber: true,
                status: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: { id: 'asc' },
        });

        const [imageCounts, paymentCounts, logCounts] = await Promise.all([
            prisma.orderImage.groupBy({
                by: ['orderId'],
                where: { orderId: { in: targetOrderIds } },
                _count: { _all: true },
            }),
            prisma.payment.groupBy({
                by: ['orderId'],
                where: { orderId: { in: targetOrderIds } },
                _count: { _all: true },
            }),
            prisma.orderLog.groupBy({
                by: ['orderId'],
                where: { orderId: { in: targetOrderIds } },
                _count: { _all: true },
            }),
        ]);

        const [orphanImagesRows, orphanPaymentsRows, orphanLogsRows] = await Promise.all([
            prisma.$queryRawUnsafe(`
                SELECT COUNT(*)::int AS count
                FROM order_images oi
                LEFT JOIN orders o ON o.id = oi.order_id
                WHERE o.id IS NULL;
            `),
            prisma.$queryRawUnsafe(`
                SELECT COUNT(*)::int AS count
                FROM payments p
                LEFT JOIN orders o ON o.id = p.order_id
                WHERE o.id IS NULL;
            `),
            prisma.$queryRawUnsafe(`
                SELECT COUNT(*)::int AS count
                FROM order_logs l
                LEFT JOIN orders o ON o.id = l.order_id
                WHERE o.id IS NULL;
            `),
        ]);

        const existingIds = new Set(orders.map((order) => order.id));
        const report = {
            generated_at: new Date().toISOString(),
            audited_order_ids: targetOrderIds,
            found_orders: orders,
            missing_order_ids: targetOrderIds.filter((id) => !existingIds.has(id)),
            child_counts_for_audited_ids: {
                order_images: imageCounts,
                payments: paymentCounts,
                order_logs: logCounts,
            },
            global_orphan_counts: {
                order_images: Number(orphanImagesRows?.[0]?.count || 0),
                payments: Number(orphanPaymentsRows?.[0]?.count || 0),
                order_logs: Number(orphanLogsRows?.[0]?.count || 0),
            },
        };

        const outputDir = path.join(process.cwd(), 'reports');
        await mkdir(outputDir, { recursive: true });
        const outputPath =
            env.KF_AUDIT_OUTPUT ||
            path.join(outputDir, `db-deletion-audit-${isoDateStamp()}.json`);
        await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

        console.log(JSON.stringify({ ok: true, output_path: outputPath, report }, null, 2));
    } finally {
        await prisma.$disconnect();
    }
}

main().catch((error) => {
    console.error(JSON.stringify({ ok: false, error: error.message }, null, 2));
    process.exitCode = 1;
});
