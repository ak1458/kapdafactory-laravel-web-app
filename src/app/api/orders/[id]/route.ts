import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/src/server/auth';
import { parseDateValue } from '@/src/server/dates';
import { deleteStoredImage } from '@/src/server/files';
import { getSerializedOrderDetail } from '@/src/server/order-detail';
import { prisma } from '@/src/server/prisma';
import { getRouteParams, getSingleParam } from '@/src/server/route-params';
import { parsePositiveInt } from '@/src/server/validators';

export async function GET(request: NextRequest, context: any) {
    const authUser = await getAuthUser(request);
    if (!authUser) {
        return NextResponse.json({ message: 'Unauthenticated.' }, { status: 401 });
    }

    const params = await getRouteParams(context);
    const id = parsePositiveInt(getSingleParam(params.id));
    if (!id) {
        return NextResponse.json({ message: 'Invalid order id.' }, { status: 400 });
    }

    const mode = request.nextUrl.searchParams.get('lite') === '1' ? 'lite' : 'full';
    const order = await getSerializedOrderDetail(id, { mode });
    if (!order) {
        return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
    }

    return NextResponse.json(order);
}

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
    if (!body) {
        return NextResponse.json({ message: 'Invalid payload.' }, { status: 400 });
    }

    const updateData: Prisma.OrderUpdateInput = {};

    const hasBillNumber = Object.prototype.hasOwnProperty.call(body, 'bill_number');
    const hasToken = Object.prototype.hasOwnProperty.call(body, 'token');
    if (hasBillNumber || hasToken) {
        const billInput = hasBillNumber ? String(body.bill_number || '').trim() : '';
        const tokenInput = hasToken ? String(body.token || '').trim() : '';
        const orderNumber = tokenInput || billInput;

        if (!orderNumber) {
            return NextResponse.json({ message: 'Bill / Token number is required.' }, { status: 422 });
        }
        if (billInput && tokenInput && billInput !== tokenInput) {
            return NextResponse.json({ message: 'Bill / Token values must match.' }, { status: 422 });
        }

        updateData.token = orderNumber;
        updateData.billNumber = orderNumber;
    }

    if (Object.prototype.hasOwnProperty.call(body, 'customer_name')) {
        const customer = String(body.customer_name || '').trim();
        updateData.customerName = customer || null;
    }

    if (Object.prototype.hasOwnProperty.call(body, 'delivery_date')) {
        const deliveryDateRaw = String(body.delivery_date || '').trim();
        const deliveryDate = parseDateValue(deliveryDateRaw);
        if (deliveryDateRaw && !deliveryDate) {
            return NextResponse.json({ message: 'Invalid delivery date.' }, { status: 422 });
        }
        updateData.deliveryDate = deliveryDate;
    }

    if (Object.prototype.hasOwnProperty.call(body, 'entry_date')) {
        const entryDateRaw = String(body.entry_date || '').trim();
        const entryDate = parseDateValue(entryDateRaw);
        if (entryDateRaw && !entryDate) {
            return NextResponse.json({ message: 'Invalid entry date.' }, { status: 422 });
        }
        updateData.entryDate = entryDate;
    }

    if (Object.prototype.hasOwnProperty.call(body, 'remarks')) {
        const remarks = String(body.remarks || '').trim();
        updateData.remarks = remarks || null;
    }

    if (Object.prototype.hasOwnProperty.call(body, 'measurements')) {
        updateData.measurements = (body.measurements || {}) as Prisma.InputJsonValue;
    }

    if (Object.prototype.hasOwnProperty.call(body, 'total_amount')) {
        const totalAmount = Number(body.total_amount);
        if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
            return NextResponse.json({ message: 'Total amount must be greater than 0.' }, { status: 422 });
        }
        updateData.totalAmount = totalAmount;
    }

    try {
        await prisma.order.update({
            where: { id },
            data: updateData,
        });
        const updatedOrder = await getSerializedOrderDetail(id);
        if (!updatedOrder) {
            return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
        }
        return NextResponse.json(updatedOrder);
    } catch (error: any) {
        if (error?.code === 'P2025') {
            return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
        }
        if (error?.code === 'P2002') {
            return NextResponse.json({ message: 'Bill / Token number already exists.' }, { status: 422 });
        }
        return NextResponse.json({ message: 'Failed to update order.' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, context: any) {
    const authUser = await getAuthUser(request);
    if (!authUser) {
        return NextResponse.json({ message: 'Unauthenticated.' }, { status: 401 });
    }

    const params = await getRouteParams(context);
    const id = parsePositiveInt(getSingleParam(params.id));
    if (!id) {
        return NextResponse.json({ message: 'Invalid order id.' }, { status: 400 });
    }

    const images = await prisma.orderImage.findMany({ where: { orderId: id }, select: { filename: true } });

    try {
        await prisma.order.delete({ where: { id } });
    } catch (error: any) {
        if (error?.code === 'P2025') {
            return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
        }
        return NextResponse.json({ message: 'Failed to delete order.' }, { status: 500 });
    }

    await Promise.all(images.map((image) => deleteStoredImage(image.filename)));

    return NextResponse.json({ message: 'Order deleted' });
}
