/**
 * ADEN-CHASE Strategies: private assessment receiver (Google Apps Script, bound to a Google Sheet).
 *
 * The website's server POSTs each submission here with a shared secret. Each assessment gets its own
 * tab (named by its ID, e.g. "portfolio-001"), one row per submission. Setup: README.md (same folder).
 *
 * Script properties (Project Settings -> Script properties):
 *   SECRET  the same value as ASSESSMENT_SHEETS_SECRET in Vercel
 */
function doPost(e) {
  var secret = PropertiesService.getScriptProperties().getProperty("SECRET");
  var data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return reply({ ok: false, error: "bad-request" });
  }
  if (!secret || !data || data.secret !== secret) return reply({ ok: false, error: "unauthorized" });
  if (!/^[a-z0-9-]{1,64}$/.test(String(data.assessmentId)) || !Array.isArray(data.answers) || !Array.isArray(data.questions)) {
    return reply({ ok: false, error: "bad-request" });
  }

  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var book = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = book.getSheetByName(data.assessmentId);
    if (!sheet) {
      sheet = book.insertSheet(data.assessmentId);
      sheet.appendRow(["Received (UTC)", "Assessment ID", "Submission ID"].concat(data.questions).map(asText));
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, sheet.getLastColumn()).setFontWeight("bold");
    }
    // The same submission (a retry or a double click) is stored once.
    var rows = sheet.getLastRow() - 1;
    if (rows > 0) {
      var ids = sheet.getRange(2, 3, rows, 1).getValues();
      for (var i = 0; i < ids.length; i++) if (ids[i][0] === data.submissionId) return reply({ ok: true, duplicate: true });
    }
    sheet.appendRow([data.submittedAt, data.assessmentId, data.submissionId].concat(data.answers).map(asText));
    var last = sheet.getLastRow();
    sheet.getRange(last, 1, 1, sheet.getLastColumn()).setWrap(true).setVerticalAlignment("top");
    return reply({ ok: true, duplicate: false });
  } finally {
    lock.releaseLock();
  }
}

/** Stores every value as plain text, so an answer starting with "=" can never run as a formula. */
function asText(v) {
  var s = v === null || v === undefined ? "" : String(v);
  return /^[=+\-@\t\r]/.test(s) ? "'" + s : s;
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
