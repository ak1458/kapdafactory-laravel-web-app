import type { Metadata } from 'next';
import './globals.css';
import Providers from './providers';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
    title: 'KapdaFactory Admin',
    description: 'KapdaFactory order management app migrated to Next.js',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="antialiased" suppressHydrationWarning={true}>
                <Providers>{children}</Providers>
                <Toaster position="top-right" />
            </body>
        </html>
    );
}
