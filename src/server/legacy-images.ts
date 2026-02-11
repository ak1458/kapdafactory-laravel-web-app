import { readdir } from 'fs/promises';
import path from 'path';
import { normalizeStoredRelativePath } from '@/src/server/files';

const STORAGE_ROOT = path.join(process.cwd(), 'public', 'storage');
const VALID_IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.svg', '.avif']);

function isImageFilename(filename: string) {
    const ext = path.extname(filename).toLowerCase();
    return VALID_IMAGE_EXTENSIONS.has(ext);
}

function getMimeFromFilename(filename: string) {
    const ext = path.extname(filename).toLowerCase();
    if (ext === '.png') return 'image/png';
    if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
    if (ext === '.webp') return 'image/webp';
    if (ext === '.gif') return 'image/gif';
    if (ext === '.svg') return 'image/svg+xml';
    if (ext === '.bmp') return 'image/bmp';
    if (ext === '.avif') return 'image/avif';
    return null;
}

function toLegacyImage(orderId: number, filename: string, index: number) {
    const relativePath = normalizeStoredRelativePath(path.join('uploads', 'orders', String(orderId), filename));
    return {
        id: `legacy-${orderId}-${index}`,
        order_id: orderId,
        filename: relativePath,
        mime: getMimeFromFilename(filename),
        size: null,
        created_at: null,
        updated_at: null,
        url: `/api/storage/${relativePath}`,
        is_legacy: true,
    };
}

export async function getLegacyImagesForOrder(orderId: number, limit = 1) {
    if (!orderId || limit <= 0) return [];

    const orderDir = path.join(STORAGE_ROOT, 'uploads', 'orders', String(orderId));
    const files = await readdir(orderDir).catch(() => [] as string[]);
    if (!files.length) return [];

    const imageFiles = files.filter(isImageFilename).sort();
    return imageFiles.slice(0, limit).map((filename, index) => toLegacyImage(orderId, filename, index));
}

export async function getLegacyImageMap(orderIds: number[], limit = 1) {
    const map = new Map<number, Awaited<ReturnType<typeof getLegacyImagesForOrder>>>();
    if (!orderIds.length || limit <= 0) return map;

    await Promise.all(
        orderIds.map(async (orderId) => {
            const images = await getLegacyImagesForOrder(orderId, limit);
            if (images.length) {
                map.set(orderId, images);
            }
        })
    );

    return map;
}
