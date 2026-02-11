import { randomUUID } from 'crypto';
import { createWriteStream } from 'fs';
import { mkdir, unlink } from 'fs/promises';
import path from 'path';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import { put, del } from '@vercel/blob';

const storageRoot = path.join(process.cwd(), 'public', 'storage');

export function normalizeStoredRelativePath(value: string) {
    return String(value || '')
        .trim()
        .replace(/\\/g, '/')
        .replace(/^\/+/, '')
        // We do typically strip 'public/' or 'storage/' for local paths,
        // but if it's a full URL (Blob), we leave it alone or handle it downstream.
        .replace(/^public\//i, '')
        .replace(/^storage\//i, '');
}

function normalizeExt(filename: string, mime: string | null) {
    const extFromName = path.extname(filename).toLowerCase();
    if (extFromName) {
        return extFromName;
    }

    if (!mime) {
        return '.jpg';
    }

    if (mime.includes('png')) return '.png';
    if (mime.includes('webp')) return '.webp';
    if (mime.includes('gif')) return '.gif';
    return '.jpg';
}

export async function storeOrderImage(orderId: number, file: File) {
    const ext = normalizeExt(file.name, file.type || null);
    const imageName = `${randomUUID()}${ext}`;

    // 1. Cloud Storage (Vercel Blob) - ONLY if token is present
    if (process.env.BLOB_READ_WRITE_TOKEN) {
        // Blob store path: orders/{id}/{filename}
        const blobPath = `orders/${orderId}/${imageName}`;
        const blob = await put(blobPath, file, {
            access: 'public',
        });
        // Return the full public URL
        return blob.url;
    }

    // 2. Local Filesystem (Fallback)
    const relativePath = normalizeStoredRelativePath(
        path.join('uploads', 'orders', String(orderId), imageName).replaceAll('\\', '/')
    );
    const absolutePath = path.join(storageRoot, relativePath);

    await mkdir(path.dirname(absolutePath), { recursive: true });
    const readable = Readable.fromWeb(file.stream() as any);
    await pipeline(readable, createWriteStream(absolutePath));

    return relativePath;
}

export async function deleteStoredImage(pathOrUrl: string) {
    // 1. Cloud Storage (Vercel Blob)
    if (pathOrUrl.startsWith('http')) {
        if (process.env.BLOB_READ_WRITE_TOKEN) {
            try {
                await del(pathOrUrl);
            } catch (err) {
                console.error('Failed to delete blob:', err);
            }
        }
        return;
    }

    // 2. Local Filesystem
    const absolutePath = path.join(storageRoot, normalizeStoredRelativePath(pathOrUrl));
    try {
        await unlink(absolutePath);
    } catch {
        // Ignore missing files.
    }
}
