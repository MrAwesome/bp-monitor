import {GoogleSpreadsheet} from "google-spreadsheet";
import commander from "commander";
import dotenv from "dotenv";

import {getCurrentDateTime, formatRows} from "./utils";

dotenv.config();

type BPCommandContext =
    | {
          cmd: "add";
          args: {
              Systolic: number;
              Diastolic: number;
              HR: number;
              Notes: string;
          };
      }
    | {cmd: "print"; args: {}}
    | {cmd: "delete_last"; args: {}}
    | {cmd: "get_link"; args: {}};

async function main() {
    const {argv} = process;

    let preCtx: BPCommandContext = {cmd: "print", args: {}};

    const program = new commander.Command();
    program
        .command("add <Systolic> <Diastolic> <HR> [Notes...]")
        .description("Add a row to the Google Sheet")
        .action((Systolic, Diastolic, HR, Notes) => {
            const concatenatedNotes = Notes.join(" ");
            preCtx = {
                cmd: "add",
                args: {Systolic, Diastolic, HR, Notes: concatenatedNotes},
            };
        });
    program
        .command("print")
        .description("Print out the contents of the Google Sheet")
        .action(() => {
            preCtx = {cmd: "print", args: {}};
        });
    program
        .command("delete_last")
        .description("Delete the last row from the Google Sheet")
        .action(() => {
            preCtx = {cmd: "delete_last", args: {}};
        });
    program
        .command("get_link")
        .description("Get the link to the Google Sheet")
        .action(() => {
            preCtx = {cmd: "get_link", args: {}};
        });

    program.parse(argv);

    const ctx = preCtx as BPCommandContext;

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

    if (ctx.cmd === "get_link") {
        console.log(
            "https://docs.google.com/spreadsheets/d/" +
                process.env.GOOGLE_SHEET_ID
        );
        return;
    }

    const doc = new GoogleSpreadsheet(GOOGLE_SHEET_ID);

    await doc.useServiceAccountAuth({
        client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: GOOGLE_PRIVATE_KEY,
    });
    await doc.loadInfo();

    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();

    //const [Systolic, Diastolic, HR] = args;

    if (ctx.cmd === "print") {
        const output = formatRows(rows);
        console.log(output);
        return;
    }

    if (ctx.cmd === "delete_last") {
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

    if (ctx.cmd === "add") {
        const {Systolic, Diastolic, HR, Notes} = ctx.args;

        const res = await sheet.addRow({
            Date: getCurrentDateTime(),
            Systolic,
            Diastolic,
            HR,
            Notes,
        });

        if ("_rawData" in res) {
            const output = formatRows([...rows, res]);
            console.log(output);
        } else {
            console.log(res);
            console.log("Unknown response from Google Sheets!");
        }
        return;
    }

    console.log(
        "Unknown command! This is an error, the script should not have reached this point. Context: ",
        ctx
    );
    process.exit(1);
}

if (require.main === module) {
    main();
}
