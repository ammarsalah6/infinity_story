/**
 * ============================================================================
 * INFINITY | انفنتي — Google Apps Script Web App API
 * ============================================================================
 * This script reads data from your Google Sheet and returns it as JSON, so
 * the static website can use Google Sheets as its product database without
 * exposing your Sheet or any secret key in the frontend.
 *
 * Endpoints (all via GET, using a "route" query parameter):
 *   ?route=products    -> all rows from the "Products" sheet
 *   ?route=categories  -> all rows from the "Categories" sheet
 *   ?route=offers      -> Products rows where offer = true
 *   ?route=settings    -> the "Settings" sheet, converted to a single object
 *   ?route=reviews     -> all rows from the "Reviews" sheet
 *
 * SETUP — see README.md section "Google Sheets Setup" for full step-by-step
 * instructions (creating the sheet, publishing this script as a Web App,
 * and where to paste the resulting URL in the frontend).
 * ============================================================================
 */

// ---- 1. Paste your Google Sheet ID here (from its URL) -------------------
// Example: https://docs.google.com/spreadsheets/d/THIS_IS_THE_ID/edit
const SHEET_ID = "PASTE_YOUR_GOOGLE_SHEET_ID_HERE";

// ---- 2. Sheet (tab) names — must match exactly what you name your tabs ---
const SHEETS = {
  products: "Products",
  categories: "Categories",
  settings: "Settings",
  reviews: "Reviews"
};

/** Entry point Google calls for every GET request to the deployed Web App */
function doGet(e) {
  const route = (e.parameter.route || "").toLowerCase();

  try {
    let data;
    switch (route) {
      case "products":
        data = sheetToObjects(SHEETS.products);
        break;
      case "categories":
        data = sheetToObjects(SHEETS.categories);
        break;
      case "offers":
        data = sheetToObjects(SHEETS.products).filter(row => isTruthy(row.offer));
        break;
      case "reviews":
        data = sheetToObjects(SHEETS.reviews);
        break;
      case "settings":
        data = settingsSheetToObject(SHEETS.settings);
        break;
      default:
        return jsonResponse({ error: "Unknown route. Use products, categories, offers, settings, or reviews." }, 400);
    }
    return jsonResponse(data, 200);
  } catch (err) {
    return jsonResponse({ error: String(err) }, 500);
  }
}

/** Converts a sheet with a header row into an array of objects, one per row */
function sheetToObjects(sheetName) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(sheetName);
  if (!sheet) throw new Error(`Sheet "${sheetName}" not found`);

  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(h => String(h).trim());
  const rows = values.slice(1);

  return rows
    .filter(row => row.some(cell => cell !== "" && cell !== null)) // skip empty rows
    .map(row => {
      const obj = {};
      headers.forEach((header, i) => {
        obj[header] = row[i];
      });
      return obj;
    });
}

/** The Settings sheet is laid out as key/value pairs (column A = key, column
 *  B = value) rather than a table, so it's converted differently. */
function settingsSheetToObject(sheetName) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(sheetName);
  if (!sheet) throw new Error(`Sheet "${sheetName}" not found`);

  const values = sheet.getDataRange().getValues();
  const settings = {};
  values.forEach(row => {
    const key = String(row[0] || "").trim();
    if (key) settings[key] = row[1];
  });
  return settings;
}

function isTruthy(value) {
  return value === true || String(value).toLowerCase() === "true" || value === 1;
}

/** Wraps data as a JSON HTTP response with the right content type */
function jsonResponse(data, statusCode) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
  // Note: Apps Script Web Apps cannot set a custom HTTP status code on
  // ContentService responses; the "statusCode" argument is kept here only
  // for readability/future use (e.g. if you add an error field the
  // frontend checks instead of relying on the HTTP status).
}
