'use client';

import ProtectedLayout from '@/src/components/ProtectedLayout';
import DailyCollections from '@/src/ui-pages/DailyCollections';

export default function CollectionsPage() {
    return (
        <ProtectedLayout>
            <DailyCollections />
        </ProtectedLayout>
    );
}

