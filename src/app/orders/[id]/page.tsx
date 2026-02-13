import { notFound, redirect } from 'next/navigation';
import ProtectedLayout from '@/src/components/ProtectedLayout';
import OrderDetail from '@/src/ui-pages/OrderDetail';
import { getSerializedOrderDetail } from '@/src/server/order-detail';
import { getCurrentUser } from '@/src/server/auth';

export default async function OrderDetailPage(props: { params: Promise<{ id: string }> }) {
    const user = await getCurrentUser();
    if (!user) {
        redirect('/login');
    }

    const params = await props.params;
    const orderId = Number(params.id);

    if (isNaN(orderId)) {
        notFound();
    }

    const order = await getSerializedOrderDetail(orderId, { mode: 'full' });

    if (!order) {
        notFound();
    }

    return (
        <ProtectedLayout>
            <OrderDetail initialOrder={order} />
        </ProtectedLayout>
    );
}
