'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../src/context/AuthContext';

export default function Providers({ children }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 30_000,
                        gcTime: 5 * 60_000,
                        retry: 1,
                        refetchOnWindowFocus: false,
                        refetchOnReconnect: false,
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>{children}</AuthProvider>
        </QueryClientProvider>
    );
}
