import { randomUUID } from 'crypto';
import { createWriteStream } from 'fs';
import { mkdir, unlink } from 'fs/promises';
import path from 'path';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';

const storageRoot = path.join(process.cwd(), 'public', 'storage');

export function normalizeStoredRelativePath(value: string) {
    return String(value || '')
        .trim()
        .replace(/\\/g, '/')
        .replace(/^\/+/, '')
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
    const relativePath = normalizeStoredRelativePath(
        path.join('uploads', 'orders', String(orderId), imageName).replaceAll('\\', '/')
    );
    const absolutePath = path.join(storageRoot, relativePath);

    await mkdir(path.dirname(absolutePath), { recursive: true });
    const readable = Readable.fromWeb(file.stream() as any);
    await pipeline(readable, createWriteStream(absolutePath));

    return relativePath;
}

export async function deleteStoredImage(relativePath: string) {
    const absolutePath = path.join(storageRoot, normalizeStoredRelativePath(relativePath));
    try {
        await unlink(absolutePath);
    } catch {
        // Ignore missing files.
    }
}
