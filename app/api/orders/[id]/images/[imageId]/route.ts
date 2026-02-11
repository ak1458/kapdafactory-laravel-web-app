import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/src/server/auth';
import { deleteStoredImage } from '@/src/server/files';
import { prisma } from '@/src/server/prisma';
import { getRouteParams, getSingleParam } from '@/src/server/route-params';
import { parsePositiveInt } from '@/src/server/validators';

export async function DELETE(request: NextRequest, context: any) {
    const authUser = await getAuthUser(request);
    if (!authUser) {
        return NextResponse.json({ message: 'Unauthenticated.' }, { status: 401 });
    }

    const params = await getRouteParams(context);
    const orderId = parsePositiveInt(getSingleParam(params.id));
    const imageId = parsePositiveInt(getSingleParam(params.imageId));

    if (!orderId || !imageId) {
        return NextResponse.json({ message: 'Invalid identifier.' }, { status: 400 });
    }

    const image = await prisma.orderImage.findFirst({
        where: {
            id: imageId,
            orderId,
        },
    });

    if (!image) {
        return NextResponse.json({ message: 'Image not found.' }, { status: 404 });
    }

    await prisma.orderImage.delete({ where: { id: image.id } });
    await deleteStoredImage(image.filename);

    return NextResponse.json({ message: 'Image deleted' });
}
