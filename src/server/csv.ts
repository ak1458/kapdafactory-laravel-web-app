function escapeCsv(value: unknown) {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replaceAll('"', '""')}"`;
    }
    return str;
}

export function toCsv(rows: unknown[][]) {
    const csvRows = rows.map((row) => row.map(escapeCsv).join(','));
    return `\uFEFF${csvRows.join('\n')}`;
}
