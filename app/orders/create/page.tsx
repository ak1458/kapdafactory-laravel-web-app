'use client';

import ProtectedLayout from '@/src/components/ProtectedLayout';
import CreateOrder from '@/src/ui-pages/CreateOrder';

export default function CreateOrderPage() {
    return (
        <ProtectedLayout>
            <CreateOrder />
        </ProtectedLayout>
    );
}

