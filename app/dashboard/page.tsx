'use client';

import ProtectedLayout from '@/src/components/ProtectedLayout';
import OrderList from '@/src/ui-pages/OrderList';

export default function DashboardPage() {
    return (
        <ProtectedLayout>
            <OrderList />
        </ProtectedLayout>
    );
}

