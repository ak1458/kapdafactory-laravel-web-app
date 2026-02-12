import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

function parseEnvLine(line) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return null;

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex < 1) return null;

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
    ) {
        value = value.slice(1, -1);
    }

    return { key, value };
}

export function parseEnvFile(filePath) {
    if (!existsSync(filePath)) return {};

    const content = readFileSync(filePath, 'utf8');
    const parsed = {};

    for (const line of content.split(/\r?\n/u)) {
        const entry = parseEnvLine(line);
        if (entry) {
            parsed[entry.key] = entry.value;
        }
    }

    return parsed;
}

export function loadMergedEnv() {
    const cwd = process.cwd();
    const candidates = ['.env', '.env.local', '.env.production.local'];

    const merged = {};
    for (const candidate of candidates) {
        const filePath = path.join(cwd, candidate);
        Object.assign(merged, parseEnvFile(filePath));
    }

    return {
        ...merged,
        ...process.env,
    };
}

export function resolveDatabaseUrl(env) {
    return (
        env.KF_DB_URL ||
        env.DATABASE_URL ||
        env.POSTGRES_PRISMA_URL ||
        env.POSTGRES_URL ||
        null
    );
}

export function isoDateStamp(date = new Date()) {
    return date.toISOString().slice(0, 10);
}

export function isoTimestampForFile(date = new Date()) {
    return date.toISOString().replace(/[:.]/gu, '-');
}
