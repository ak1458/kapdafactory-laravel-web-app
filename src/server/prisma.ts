import { PrismaClient } from '@prisma/client';

declare global {
    var __prisma__: PrismaClient | undefined;
}

function normalizeDatabaseUrl() {
    const configured = (process.env.DATABASE_URL || '').trim();
    const fallback = (process.env.POSTGRES_URL || '').trim();

    let resolved = configured || fallback;

    if (resolved.includes('${POSTGRES_URL}') && fallback) {
        resolved = resolved.replaceAll('${POSTGRES_URL}', fallback);
    }

    if (!resolved) {
        return null;
    }

    try {
        const parsed = new URL(resolved);
        const hostname = parsed.hostname.toLowerCase();
        const isLocalHost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';

        // Local Postgres commonly runs without TLS; forcing disable avoids handshake failures.
        if (isLocalHost && process.env.LOCAL_DB_SSL !== 'true') {
            parsed.searchParams.set('sslmode', 'disable');
        }

        if (!parsed.searchParams.has('connection_limit')) {
            parsed.searchParams.set('connection_limit', process.env.PRISMA_CONNECTION_LIMIT || '5');
        }

        if (!parsed.searchParams.has('pool_timeout')) {
            parsed.searchParams.set('pool_timeout', process.env.PRISMA_POOL_TIMEOUT || '20');
        }

        return parsed.toString();
    } catch {
        return resolved;
    }
}

const normalizedUrl = normalizeDatabaseUrl();
if (normalizedUrl) {
    process.env.DATABASE_URL = normalizedUrl;
}

export const prisma = global.__prisma__ ?? new PrismaClient({
    errorFormat: 'minimal',
});

if (process.env.NODE_ENV !== 'production') {
    global.__prisma__ = prisma;
}
