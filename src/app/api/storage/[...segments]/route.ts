import { readFile } from 'fs/promises';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { getRouteParams } from '@/src/server/route-params';
import { normalizeStoredRelativePath } from '@/src/server/files';

export const runtime = 'nodejs';

const STORAGE_ROOT = path.join(process.cwd(), 'public', 'storage');

function getMimeType(filePath: string) {
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.png') return 'image/png';
    if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
    if (ext === '.webp') return 'image/webp';
    if (ext === '.gif') return 'image/gif';
    if (ext === '.svg') return 'image/svg+xml';
    if (ext === '.bmp') return 'image/bmp';
    return 'application/octet-stream';
}

function toRelativePath(segments: unknown) {
    if (!segments) return '';
    if (Array.isArray(segments)) {
        return normalizeStoredRelativePath(segments.join('/'));
    }
    return normalizeStoredRelativePath(String(segments));
}

export async function GET(_request: NextRequest, context: any) {
    const params = await getRouteParams(context);
    const relativePath = toRelativePath(params.segments);
    if (!relativePath || relativePath.includes('..')) {
        return NextResponse.json({ message: 'Invalid file path.' }, { status: 400 });
    }

    // If the path looks like a full URL (Vercel Blob), redirect to it
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
        return NextResponse.redirect(relativePath, { status: 302 });
    }

    // Ensure consistent path separators for Windows
    const normalizedRelativePath = relativePath.split('/').join(path.sep);
    const absolutePath = path.join(STORAGE_ROOT, normalizedRelativePath);
    if (!absolutePath.startsWith(STORAGE_ROOT)) {
        return NextResponse.json({ message: 'Invalid file path.' }, { status: 400 });
    }

    try {
        const fileBuffer = await readFile(absolutePath);
        return new NextResponse(new Uint8Array(fileBuffer), {
            status: 200,
            headers: {
                'Content-Type': getMimeType(absolutePath),
                // Images are content-addressed (UUID filenames) — safe to cache long
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch {
        return NextResponse.json({ message: 'Image not found.' }, { status: 404 });
    }
}
