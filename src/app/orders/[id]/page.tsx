'use client';

import ProtectedLayout from '@/src/components/ProtectedLayout';
import OrderDetail from '@/src/ui-pages/OrderDetail';

export default function OrderDetailPage() {
    return (
        <ProtectedLayout>
            <OrderDetail />
        </ProtectedLayout>
    );
}
