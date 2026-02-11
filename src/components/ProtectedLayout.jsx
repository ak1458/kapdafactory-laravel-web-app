'use client';

import Layout from '@/src/components/Layout';
import ProtectedRoute from '@/src/components/ProtectedRoute';

export default function ProtectedLayout({ children }) {
    return (
        <ProtectedRoute>
            <Layout>{children}</Layout>
        </ProtectedRoute>
    );
}
