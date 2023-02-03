import type {GoogleSpreadsheetRow} from 'google-spreadsheet';

export function getCurrentDateTime() {
    const date = new Date(1674844200000);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hour}:${minute}`;
}

export function formatRows(rows: GoogleSpreadsheetRow[]): string {
    return rows.map((row) => row._rawData.join('\t')).join('\n');
}
