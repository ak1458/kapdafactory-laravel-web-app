import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/src/server/auth';
import { parseDateValue } from '@/src/server/dates';
import { prisma } from '@/src/server/prisma';
import { getRouteParams, getSingleParam } from '@/src/server/route-params';
import { serializeOrder } from '@/src/server/serializers';
import { parseOrderStatus, parsePaymentMethod, parsePositiveInt } from '@/src/server/validators';

export async function PUT(request: NextRequest, context: any) {
    const authUser = await getAuthUser(request);
    if (!authUser) {
        return NextResponse.json({ message: 'Unauthenticated.' }, { status: 401 });
    }

    const params = await getRouteParams(context);
    const id = parsePositiveInt(getSingleParam(params.id));
    if (!id) {
        return NextResponse.json({ message: 'Invalid order id.' }, { status: 400 });
    }

    const body = await request.json().catch(() => null);
    const status = typeof body?.status === 'string' ? parseOrderStatus(body.status) : null;

    if (!status) {
        return NextResponse.json({ message: 'Invalid status value.' }, { status: 422 });
    }

    const note = typeof body?.note === 'string' ? body.note.trim() : '';
    const paymentAmount = Number(body?.payment_amount ?? 0);
    if (!Number.isFinite(paymentAmount) || paymentAmount < 0) {
        return NextResponse.json({ message: 'Payment amount must be a valid number.' }, { status: 422 });
    }

    const paymentMethod = parsePaymentMethod(body?.payment_method);

    const actualDeliveryDateRaw = String(body?.actual_delivery_date || '').trim();
    const actualDeliveryDate = parseDateValue(actualDeliveryDateRaw);
    if (actualDeliveryDateRaw && !actualDeliveryDate) {
        return NextResponse.json({ message: 'Invalid delivery date.' }, { status: 422 });
    }

    const fallbackToday = parseDateValue(new Date().toISOString().slice(0, 10));
    const resolvedDeliveryDate = status === 'delivered' ? actualDeliveryDate || fallbackToday : null;

    const order = await prisma.order.findUnique({
        where: { id },
        include: {
            payments: true,
        },
    });

    if (!order) {
        return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
    }

    await prisma.order.update({
        where: { id },
        data: {
            status,
            ...(status === 'delivered' && resolvedDeliveryDate ? { actualDeliveryDate: resolvedDeliveryDate } : {}),
        },
    });

    if (paymentAmount > 0) {
        await prisma.payment.create({
            data: {
                orderId: id,
                amount: paymentAmount,
                paymentDate: resolvedDeliveryDate || new Date(),
                paymentMethod,
                note: 'Delivery Payment',
            },
        });
    }

    const refreshed = await prisma.order.findUniqueOrThrow({
        where: { id },
        include: {
            payments: true,
        },
    });

    const paid = refreshed.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
    const balance = Math.max(0, Number(refreshed.totalAmount) - paid);

    let paymentNote = '';
    if (status === 'delivered') {
        paymentNote = balance === 0 ? 'Paid in full' : `${balance} pending`;
    }

    const logNote = [note, paymentNote].filter(Boolean).join('. ');

    await prisma.orderLog.create({
        data: {
            orderId: id,
            action: `status_changed:${status}`,
            note: logNote || null,
            userId: authUser.id,
        },
    });

    const finalOrder = await prisma.order.findUniqueOrThrow({
        where: { id },
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

    return NextResponse.json(serializeOrder(finalOrder));
}
