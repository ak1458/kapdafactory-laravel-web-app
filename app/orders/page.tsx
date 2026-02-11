'use client';

import ProtectedLayout from '@/src/components/ProtectedLayout';
import OrderList from '@/src/ui-pages/OrderList';

export default function OrdersPage() {
    return (
        <ProtectedLayout>
            <OrderList />
        </ProtectedLayout>
    );
}

