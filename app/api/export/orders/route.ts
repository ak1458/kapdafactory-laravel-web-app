import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/src/server/auth';
import { parseDateValue, toDateOnly, toIso } from '@/src/server/dates';
import { prisma } from '@/src/server/prisma';
import { toCsv } from '@/src/server/csv';
import { parseOrderStatus } from '@/src/server/validators';

const MAX_EXPORT_ROWS = 20000;

function endOfUtcDay(date: Date) {
    const d = new Date(date);
    d.setUTCHours(23, 59, 59, 999);
    return d;
}

function capitalize(text: string) {
    return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
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
    const dateFrom = parseDateValue(dateFromRaw);
    const dateTo = parseDateValue(dateToRaw);

    if (dateFromRaw && !dateFrom) {
        return NextResponse.json({ message: 'Invalid date_from value.' }, { status: 422 });
    }
    if (dateToRaw && !dateTo) {
        return NextResponse.json({ message: 'Invalid date_to value.' }, { status: 422 });
    }

    const where: Prisma.OrderWhereInput = {
        ...(status ? { status } : {}),
        ...(dateFrom || dateTo
            ? {
                  createdAt: {
                      ...(dateFrom ? { gte: dateFrom } : {}),
                      ...(dateTo ? { lte: endOfUtcDay(dateTo) } : {}),
                  },
              }
            : {}),
    };

    const totalRows = await prisma.order.count({ where });
    if (totalRows > MAX_EXPORT_ROWS) {
        return NextResponse.json(
            { message: `Export too large (${totalRows} rows). Please filter to ${MAX_EXPORT_ROWS} rows or fewer.` },
            { status: 422 }
        );
    }

    const orders = await prisma.order.findMany({
        where,
        select: {
            id: true,
            token: true,
            entryDate: true,
            createdAt: true,
            customerName: true,
            deliveryDate: true,
            status: true,
            totalAmount: true,
            remarks: true,
            payments: {
                select: {
                    amount: true,
                    paymentMethod: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    const rows: unknown[][] = [
        [
            'Order ID',
            'Token',
            'Entry Date',
            'Customer Name',
            'Delivery Date',
            'Status',
            'Total Amount',
            'Paid Amount',
            'Balance',
            'Payment Methods',
            'Remarks',
            'Created At',
        ],
    ];

    for (const order of orders) {
        const paidAmount = order.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
        const totalAmount = Number(order.totalAmount);
        const balance = Math.max(0, totalAmount - paidAmount);

        const groupedPayments = order.payments.reduce<Record<string, number>>((acc, payment) => {
            const method = payment.paymentMethod || 'cash';
            acc[method] = (acc[method] || 0) + Number(payment.amount);
            return acc;
        }, {});

        const paymentMethods = Object.entries(groupedPayments)
            .map(([method, amount]) => `${capitalize(method)}: ${amount}`)
            .join(', ');

        rows.push([
            order.id,
            order.token,
            toDateOnly(order.entryDate) || toDateOnly(order.createdAt),
            order.customerName || 'N/A',
            toDateOnly(order.deliveryDate) || 'N/A',
            capitalize(order.status),
            totalAmount,
            paidAmount,
            balance,
            paymentMethods || 'No payments',
            order.remarks || '',
            toIso(order.createdAt) || '',
        ]);
    }

    const csv = toCsv(rows);
    const dateLabel = new Date().toISOString().slice(0, 10);

    return new Response(csv, {
        status: 200,
        headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="orders_export_${dateLabel}.csv"`,
            Pragma: 'no-cache',
            'Cache-Control': 'must-revalidate, post-check=0, pre-check=0',
            Expires: '0',
        },
    });
}
