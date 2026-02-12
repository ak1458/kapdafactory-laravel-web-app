import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { spawn } from 'node:child_process';

const DEFAULT_PORT = 3000;
const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_MAX_OLD_SPACE_MB = '1024';
const DEFAULT_BUNDLER = 'turbopack';

function readCliOptions() {
    const argv = process.argv.slice(2);
    const options = {};

    for (let i = 0; i < argv.length; i += 1) {
        const arg = argv[i];
        if ((arg === '--port' || arg === '-p') && argv[i + 1]) {
            options.port = argv[i + 1];
            i += 1;
            continue;
        }
        if ((arg === '--hostname' || arg === '-H') && argv[i + 1]) {
            options.host = argv[i + 1];
            i += 1;
            continue;
        }
        if (arg === '--webpack') {
            options.bundler = 'webpack';
            continue;
        }
        if (arg === '--turbopack') {
            options.bundler = 'turbopack';
        }
    }

    return options;
}

function resolvePort(cliPort) {
    const rawPort = String(cliPort || process.env.PORT || DEFAULT_PORT).trim();
    const parsed = Number.parseInt(rawPort, 10);
    if (!Number.isInteger(parsed) || parsed <= 0 || parsed > 65535) {
        throw new Error(`Invalid PORT value "${rawPort}". Use a number between 1 and 65535.`);
    }
    return parsed;
}

function isPortInUse(port, host) {
    return new Promise((resolve) => {
        const socket = net.createConnection({ port, host });
        let settled = false;

        const settle = (value) => {
            if (settled) return;
            settled = true;
            socket.destroy();
            resolve(value);
        };

        socket.once('connect', () => settle(true));
        socket.once('error', () => settle(false));
        socket.setTimeout(800, () => settle(false));
    });
}

function cleanupStaleLock() {
    const lockFile = path.join(process.cwd(), '.next', 'dev', 'lock');
    if (fs.existsSync(lockFile)) {
        fs.rmSync(lockFile, { force: true });
        console.log('[dev] Removed stale .next/dev/lock file.');
    }
}

async function main() {
    const cliOptions = readCliOptions();
    const host = String(cliOptions.host || process.env.HOST || DEFAULT_HOST).trim() || DEFAULT_HOST;
    const port = resolvePort(cliOptions.port);
    const bundlerInput = String(cliOptions.bundler || process.env.KF_DEV_BUNDLER || DEFAULT_BUNDLER).trim().toLowerCase();
    const bundler = bundlerInput === 'webpack' ? 'webpack' : 'turbopack';

    if (await isPortInUse(port, host)) {
        console.error(
            `[dev] Port ${port} is already in use on ${host}. Stop the old server or set a different PORT.`,
        );
        process.exit(1);
    }

    cleanupStaleLock();

    const nextBin = path.join(process.cwd(), 'node_modules', 'next', 'dist', 'bin', 'next');
    const nodeOptions = String(process.env.NODE_OPTIONS || '').trim();
    const maxOldSpaceMb = String(
        process.env.KF_DEV_MAX_OLD_SPACE_MB || DEFAULT_MAX_OLD_SPACE_MB,
    ).trim();

    const env = {
        ...process.env,
        NEXT_TELEMETRY_DISABLED: process.env.NEXT_TELEMETRY_DISABLED || '1',
        NODE_OPTIONS:
            nodeOptions.includes('--max-old-space-size=')
                ? nodeOptions
                : `${nodeOptions} --max-old-space-size=${maxOldSpaceMb}`.trim(),
    };

    const args = [nextBin, 'dev', `--${bundler}`, '--hostname', host, '--port', String(port)];
    console.log(`[dev] Starting Next.js (${bundler}) at http://${host}:${port}`);

    const child = spawn(process.execPath, args, { stdio: 'inherit', env });

    for (const signal of ['SIGINT', 'SIGTERM']) {
        process.on(signal, () => {
            if (!child.killed) child.kill(signal);
        });
    }

    child.on('exit', (code, signal) => {
        if (signal) {
            process.kill(process.pid, signal);
            return;
        }
        process.exit(code ?? 0);
    });
}

main().catch((error) => {
    console.error(`[dev] ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
});
