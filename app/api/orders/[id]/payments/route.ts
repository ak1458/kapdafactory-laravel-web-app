import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/src/server/auth';
import { parseDateValue } from '@/src/server/dates';
import { prisma } from '@/src/server/prisma';
import { getRouteParams, getSingleParam } from '@/src/server/route-params';
import { serializeOrder } from '@/src/server/serializers';
import { parsePaymentMethod, parsePositiveInt } from '@/src/server/validators';

export async function POST(request: NextRequest, context: any) {
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
    const amount = Number(body?.amount ?? 0);

    if (!Number.isFinite(amount) || amount < 1) {
        return NextResponse.json({ message: 'Amount must be at least 1.' }, { status: 422 });
    }

    const paymentDateRaw = String(body?.payment_date || '').trim();
    const parsedPaymentDate = parseDateValue(paymentDateRaw);
    if (paymentDateRaw && !parsedPaymentDate) {
        return NextResponse.json({ message: 'Invalid payment date.' }, { status: 422 });
    }

    const paymentDate = parsedPaymentDate || new Date();
    const paymentMethod = parsePaymentMethod(body?.payment_method);

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
        return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
    }

    await prisma.payment.create({
        data: {
            orderId: id,
            amount,
            paymentDate,
            paymentMethod,
            note: typeof body?.note === 'string' && body.note.trim() ? body.note.trim() : null,
        },
    });

    const updated = await prisma.order.findUniqueOrThrow({
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

    return NextResponse.json(serializeOrder(updated));
}
