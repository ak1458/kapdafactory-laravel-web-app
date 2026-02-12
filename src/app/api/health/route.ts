
import { NextResponse } from 'next/server';
import { prisma } from '@/src/server/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    const start = performance.now();
    try {
        // Simple DB query to check latency
        await prisma.$queryRaw`SELECT 1`;
        const dbLatency = performance.now() - start;

        return NextResponse.json({
            status: 'ok',
            version: '1.2.0-perf-fix', // Manually bumped version
            timestamp: new Date().toISOString(),
            db_latency_ms: dbLatency,
            environment: process.env.NODE_ENV,
        });
    } catch (error: any) {
        return NextResponse.json({
            status: 'error',
            error: error.message,
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}
