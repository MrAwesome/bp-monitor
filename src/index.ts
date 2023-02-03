import { GoogleSpreadsheet } from "google-spreadsheet";
import dotenv from "dotenv";

import {getCurrentDateTime, formatRows} from "./utils";

dotenv.config();

async function main() {
    const { argv } = process;
    const args = argv.slice(2);

    if (args.length > 3 || args.length == 2) {
        throw new Error(
            `
            Required usage: 
                ${argv[0]} ${argv[1]}
                ${argv[0]} ${argv[1]} delete_last
                ${argv[0]} ${argv[1]} get_link
                ${argv[0]} ${argv[1]} <Systolic> <Diastolic> <HR>

            (If no args are given, will print recent data and exit.)
            `
        );
    }

    const [GOOGLE_SHEET_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY] =
        [
            process.env.GOOGLE_SHEET_ID,
            process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            process.env.GOOGLE_PRIVATE_KEY,
        ];

    if (
        !GOOGLE_SHEET_ID ||
        !GOOGLE_SERVICE_ACCOUNT_EMAIL ||
        !GOOGLE_PRIVATE_KEY
    ) {
        throw new Error(
            "GOOGLE_SHEET_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY must be set"
        );
    }

    if (args.length === 1) {
        if (args[0] === "get_link") {
            console.log("https://docs.google.com/spreadsheets/d/" + process.env.GOOGLE_SHEET_ID);
            return;
        }
    }

    const doc = new GoogleSpreadsheet(GOOGLE_SHEET_ID);

    await doc.useServiceAccountAuth({
        client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: GOOGLE_PRIVATE_KEY,
    });
    await doc.loadInfo();

    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();

    const [Systolic, Diastolic, HR] = args;

    if (args.length === 0) {
        const output = formatRows(rows);
        console.log(output);
        return;
    }


    if (args.length === 1) {
        if (args[0] === "delete_last") {
            if (rows.length === 0) {
                console.log("No rows to delete!");
                return;
            }
            const delRow = rows[rows.length - 1];
            const delRowText = formatRows([delRow]);
            delRow.delete();

            const output = formatRows(rows.slice(0, rows.length - 1));
            console.log(output);
            process.stderr.write(`Deleted last row:\n${delRowText}\n`);
            return;
        }

        console.log("Unknown command: " + args[0]);
        process.exit(1);
    }

    if (args.length === 3) {
        const res = await sheet.addRow({
            Date: getCurrentDateTime(),
            Systolic,
            Diastolic,
            HR,
        });

        if ("_rawData" in res) {
            const output = formatRows([...rows, res]);
            console.log(output);
        } else {
            console.log(res);
            console.log("Unknown response from Google Sheets!");
        }
    }
}

if (require.main === module) {
    main();
}
