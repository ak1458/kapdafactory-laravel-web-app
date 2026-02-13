export function parseDateValue(value: string | null | undefined) {
    if (!value) return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
    if (!match) return null;

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);

    const d = new Date(Date.UTC(year, month - 1, day));

    if (
        d.getUTCFullYear() !== year ||
        d.getUTCMonth() !== month - 1 ||
        d.getUTCDate() !== day
    ) {
        return null;
    }

    return d;
}

export function toDateOnly(value: Date | string | null | undefined) {
    if (!value) return null;
    const d = typeof value === 'string' ? new Date(value) : value;
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString().slice(0, 10);
}

export function toIso(value: Date | string | null | undefined) {
    if (!value) return null;
    const d = typeof value === 'string' ? new Date(value) : value;
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString();
}

export function startOfMonthUtc() {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}
