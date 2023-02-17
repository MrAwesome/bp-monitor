export function getFormattedDateTime(date: Date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const hour = date.getHours().toString().padStart(2, "0");
    const minute = date.getMinutes().toString().padStart(2, "0");
    return `${year}-${month}-${day} ${hour}:${minute}`;
}

export function formatRows(rows: Record<string, any>[]): string {
    const fixedRows = rows.map((row) => {
        const printableDate = getFormattedDateTime(new Date(row.Date));
        const newRow = [
            printableDate,
            row.Systolic,
            row.Diastolic,
            row.HR,
            row.Notes,
        ];
        return newRow;
    });
    return fixedRows.map((row) => row.join("\t")).join("\n");
}
