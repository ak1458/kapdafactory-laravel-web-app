'use client';

import ProtectedLayout from '@/src/components/ProtectedLayout';
import EditOrder from '@/src/ui-pages/EditOrder';

export default function EditOrderPage() {
    return (
        <ProtectedLayout>
            <EditOrder />
        </ProtectedLayout>
    );
}
