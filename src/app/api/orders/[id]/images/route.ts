import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/src/server/auth';
import { storeOrderImage } from '@/src/server/files';
import { prisma } from '@/src/server/prisma';
import { getRouteParams, getSingleParam } from '@/src/server/route-params';
import { serializeImage } from '@/src/server/serializers';
import { parsePositiveInt } from '@/src/server/validators';

const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024;

export async function POST(request: NextRequest, context: any) {
    const authUser = await getAuthUser(request);
    if (!authUser) {
        return NextResponse.json({ message: 'Unauthenticated.' }, { status: 401 });
    }

    const params = await getRouteParams(context);
    const orderId = parsePositiveInt(getSingleParam(params.id));
    if (!orderId) {
        return NextResponse.json({ message: 'Invalid order id.' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
        return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
    }

    const formData = await request.formData();
    const image = formData.get('image');

    if (!(image instanceof File) || image.size === 0) {
        return NextResponse.json({ message: 'Image is required.' }, { status: 422 });
    }

    if (!image.type.startsWith('image/')) {
        return NextResponse.json({ message: 'Only image files are allowed.' }, { status: 422 });
    }

    if (image.size > MAX_IMAGE_SIZE_BYTES) {
        return NextResponse.json({ message: 'Image must be smaller than 8MB.' }, { status: 422 });
    }

    const path = await storeOrderImage(orderId, image);
    const saved = await prisma.orderImage.create({
        data: {
            orderId,
            filename: path,
            mime: image.type || null,
            size: image.size,
        },
    });

    return NextResponse.json(serializeImage(saved), { status: 201 });
}
