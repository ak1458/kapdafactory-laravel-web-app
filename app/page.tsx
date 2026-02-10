'use client';

import ProtectedLayout from '@/src/components/ProtectedLayout';
import CreateOrder from '@/src/ui-pages/CreateOrder';

export default function HomePage() {
    return (
        <ProtectedLayout>
            <CreateOrder />
        </ProtectedLayout>
    );
}

