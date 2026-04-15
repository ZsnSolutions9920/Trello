import { google } from "googleapis";

type ServiceAccountKey = {
  client_email?: string;
  private_key?: string;
  [key: string]: unknown;
};

function parseServiceAccountKey(raw: string): ServiceAccountKey {
  // Accept either plain JSON or base64-encoded JSON.
  const candidates = [raw, Buffer.from(raw, "base64").toString("utf8")];

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate) as ServiceAccountKey;
      if (parsed.private_key) {
        parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
      }
      return parsed;
    } catch {
      // Try next candidate format
    }
  }

  throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY must be valid JSON or base64-encoded JSON");
}

function getAuth() {
  const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!credentials) throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY not set");

  const key = parseServiceAccountKey(credentials);
  return new google.auth.GoogleAuth({
    credentials: key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

function getSheetId() {
  const id = process.env.GOOGLE_SHEET_ID;
  if (!id) throw new Error("GOOGLE_SHEET_ID not set");
  return id;
}

let cachedSheetTabName: string | null = null;

function quoteSheetTabName(sheetTabName: string): string {
  return `'${sheetTabName.replace(/'/g, "''")}'`;
}

async function resolveSheetTabName(
  sheets: ReturnType<typeof google.sheets>,
  spreadsheetId: string,
): Promise<string> {
  const configured = process.env.GOOGLE_SHEET_TAB_NAME?.trim();
  if (configured) return configured;

  if (cachedSheetTabName) return cachedSheetTabName;

  const meta = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets.properties.title",
  });

  const firstTabName = meta.data.sheets?.[0]?.properties?.title;
  if (!firstTabName) {
    throw new Error("No sheet tab found in GOOGLE_SHEET_ID");
  }

  cachedSheetTabName = firstTabName;
  return firstTabName;
}

// Append a new row: Date | Name | Clock In | Clock Out | Total Hours
export async function appendAttendanceRow(date: string, name: string, clockIn: string) {
  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheetId = getSheetId();
  const sheetTabName = await resolveSheetTabName(sheets, spreadsheetId);

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${quoteSheetTabName(sheetTabName)}!A:E`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [[date, name, clockIn, "", ""]],
    },
  });
}

// Find the row for this user+date and update Clock Out + Total Hours
export async function updateAttendanceRow(date: string, name: string, clockOut: string, totalHours: string) {
  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheetId = getSheetId();
  const sheetTabName = await resolveSheetTabName(sheets, spreadsheetId);

  // Read all rows to find the matching one
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${quoteSheetTabName(sheetTabName)}!A:E`,
  });

  const rows = res.data.values || [];

  // Find the row index where Date matches and Name matches and Clock Out is empty
  let rowIndex = -1;
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (row[0] === date && row[1] === name && (!row[3] || row[3] === "")) {
      rowIndex = i + 1; // Sheets is 1-indexed
      break;
    }
  }

  if (rowIndex === -1) {
    // Fallback: append a new row if we can't find the sign-in row
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${quoteSheetTabName(sheetTabName)}!A:E`,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [[date, name, "", clockOut, totalHours]],
      },
    });
    return;
  }

  // Update columns D (Clock Out) and E (Total Hours) in the found row
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${quoteSheetTabName(sheetTabName)}!D${rowIndex}:E${rowIndex}`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[clockOut, totalHours]],
    },
  });
}
