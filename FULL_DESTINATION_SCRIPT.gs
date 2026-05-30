// ============================================================
//  COMPLETE SCRIPT — PASTE EVERYTHING IN DESTINATION SHEET
//  Destination Sheet: 1S3oKkVVVi1zrmOxmQRYjvxrBl1ft4XDiH844zl_LdJQ
//
//  CONTAINS:
//  1. mergeSheets()         — pulls b2c + renewal into Merged_Data
//  2. setupTrigger()        — auto sync every 5 min
//  3. extractRedFlag()      — button to extract red flag cases
//  4. runCancellationFollowup() — cancellation followup from Merged_Data
//
//  HOW TO DEPLOY:
//  1. Open Destination Sheet → Extensions → Apps Script
//  2. Delete ALL existing code
//  3. Paste this entire file
//  4. Save (Ctrl+S)
//  5. Run mergeSheets() first (manually, approve permissions)
//  6. Run setupTrigger() once (enables auto sync every 5 min)
//  7. Reload the destination sheet — menu "🔔 Cancellation Tools" appears
// ============================================================

// ============================================================
//  SECTION 1 — CONFIGURATION
// ============================================================

var SOURCE_ID      = "1YC7z2msZSbzo2T4lIGJrDodB7--QgaigZL2VpjuWljQ";
var DESTINATION_ID = "1S3oKkVVVi1zrmOxmQRYjvxrBl1ft4XDiH844zl_LdJQ";
var SOURCE_SHEETS  = ["b2c", "renewal"];
var DEST_SHEET     = "Merged_Data";
var SYNC_EVERY_MIN = 5;

// All columns pulled from source into Merged_Data
var FINAL_COLUMNS = [
  "Source Sheet",
  "Channel",
  "INS Policy Code",
  "Insurance ID",
  "UM",
  "SA/SSA",
  "Product",
  "Case Received Date",
  "Policy Issuance Date",
  "Policy Number",
  "Assured's Name",
  "Provider",
  "Lead Source",
  "Category",
  "External Partner/Referrer",
  "Policy Status",
  "Status Date/ Cancellation Date",
  "Mobile Number",
  "Email Address",
  "Vehicle Type",
  "Car Brand",
  "Car Year",
  "Car Model",
  "Plate Number / CS",
  "Mortgagee",
  "Effectivity Date",
  "AON",
  "FMV/Coverage",
  "APA",
  "BI/PD",
  "Issue Rate",
  "FMV Premium",
  "BI",
  "PD",
  "AUTO PA",
  "RSCC",
  "Net_Premium",
  "DST",
  "VAT",
  "Other fee",
  "FST",
  "LGT",
  "Road Side Assistance",
  "Gross Premium",
  "Discount/CWT",
  "Subagent Incentive (Payout)",
  "Dealer's Mark Up",
  "Premium Agreed w/ Client",
  "Commission DC (Less to Premium)",
  "Commision Share % (Agent/Agency)",
  "Commission Share",
  "Withholding Tax (10%)",
  "Commission payout",
  "Payment Mode",
  "Terms",
  "1st Due Date",
  "1st Due Amount",
  "2nd Due Date",
  "2nd Due Amount",
  "3rd Due date",
  "3rd Due Amount",
  "4th Due Date",
  "4th Due Amount",
  "5th Due Date",
  "5th Due Amount",
  "6th Due Date",
  "6th Due Amount",
  "Payment Status",
  "Remaining Terms",
  "TOTAL Payment Received",
  "TOTAL Balance Due",
  "Payment Date_1",
  "1st Payment",
  "Payment Channel_1",
  "Payment Date_2",
  "2nd Payment",
  "Payment Channel_2",
  "Payment Date_3",
  "3rd Payment",
  "Payment Channel_3",
  "Payment Date_4",
  "4th Payment",
  "Payment Channel_4",
  "Payment Date_5",
  "5th Payment",
  "Payment Channel_5",
  "Payment Date_6",
  "6th Payment",
  "Payment Channel_6",
  "Total Paid to Partner",
  "Total Paid to OTO",
  "Vehicle Age",
  "Commision/Net Rate(Ops)",
  "Commission/Net Rate",
  "BI comms",
  "PD comms",
  "Commissons %",
  "OTO's Commission (Vat Exclusive)",
  "OTO's Commission (Vat Inclusive)",
  "Sub-Channel",
  "VAT2",
  "Withholding Tax2",
  "Net Commision (Partner-OTO)",
  "MIS_Revenue",
  "COGS",
  "Gross_Margin",
  "Recognition date",
  "TOTAL Remmitance (OTO-Partner) Ex Comms",
  "Total Premium Remmited (OTO-Partner)",
  "Pending Remmitance",
  "Remmittance Amount 1",
  "Remmittance Date 1",
  "Remmittance Amount 2",
  "Remmittance Date 2",
  "Remmittance Amount 3",
  "Remmittance Date 3",
  "Remmittance Amount 4",
  "Remmittance Date 4",
  "Remmittance Amount 5",
  "Remmittance Date 5",
  "Remmittance Amount 6",
  "Remmittance Date 6",
  "Commission Received (Partner-OTO)",
  "Date of Receipt",
  "Comms PAID to Agent",
  "DATE",
  "CANCELLATION/ RED FLAG DATE",
  "CANCELLATION DUE",
  "REMARKS (OPS)",
  "QR Code",
  "QR Code Alias",
  "QR Code amount",
  "QR Alias Amount",
  "QR Variance",
  "QR Alias Variance",
  "Credit Period"
];

// Columns with different names in renewal vs b2c — mapped to one output name
var ALIASES = {
  "Vehicle Plate Number" : "Plate Number / CS",
  "Commisons %"          : "Commissons %",
  "QR Amount"            : "QR Code amount",
  "Alias Amount"         : "QR Alias Amount",
  "DATE "                : "DATE"
};

// Cancellation script config
var CANCEL_CONFIG = {
  SOURCE_SHEET_NAME:        "Merged_Data",   // reads from Merged_Data in THIS workbook
  OUTPUT_SHEET_NAME:        "Cancellation Followup",
  DAYS_UNTIL_CANCELLATION:  14,
  FOLLOWUP_WINDOW_START:    8,
  FOLLOWUP_WINDOW_END:      14,

  TRIGGER_KEYWORDS: [
    "Pending Payment",
    "1st Payment Received",
    "2nd Payment Received",
    "3rd Payment Received",
    "4th Payment Received",
    "5th Payment Received"
  ],

  // Columns shown in Cancellation Followup sheet
  OUTPUT_COLUMNS: [
    "Channel",
    "INS Policy Code",
    "SA/SSA",
    "Policy Number",
    "Assured's Name",
    "Provider",
    "Mobile Number",
    "Email Address",
    "Plate Number / CS",
    "Payment Status",
    "Remaining Terms",
    "TOTAL Payment Received",
    "TOTAL Balance Due",
    "CANCELLATION DUE",
    "Credit Period"
  ],

  OUTPUT_HEADER_COLOR:      "#FF4444",
  OUTPUT_HEADER_FONT_COLOR: "#ffffff"
};

// Red flag config
var REDFLAG_SHEET_NAME = "redflag";

var REDFLAG_COLUMNS = [
  "Channel",
  "INS Policy Code",
  "SA/SSA",
  "Policy Number",
  "Assured's Name",
  "Provider",
  "Mobile Number",
  "Email Address",
  "Plate Number / CS",
  "Payment Status",
  "Remaining Terms",
  "TOTAL Payment Received",
  "TOTAL Balance Due",
  "CANCELLATION DUE",
  "Credit Period"
];

var REDFLAG_INCLUDE_STATUSES = [
  "1st payment received",
  "2nd payment received",
  "3rd payment received",
  "4th payment received",
  "5th payment received"
];

var REDFLAG_EXCLUDE_KEYWORDS = [
  "full payment",
  "cancel",
  "reinstat"
];


// ============================================================
//  SECTION 2 — MERGE SCRIPT
//  Reads b2c + renewal from source, writes into Merged_Data
// ============================================================

function mergeSheets() {
  var start = Date.now();
  Logger.log("▶ mergeSheets() started — " + new Date().toISOString());

  try {
    var srcWb    = SpreadsheetApp.openById(SOURCE_ID);
    var dstWb    = SpreadsheetApp.openById(DESTINATION_ID);
    var dstSheet = dstWb.getSheetByName(DEST_SHEET) || dstWb.insertSheet(DEST_SHEET);

    var allRows = [];
    for (var s = 0; s < SOURCE_SHEETS.length; s++) {
      var sheetName = SOURCE_SHEETS[s];
      var sheet = srcWb.getSheetByName(sheetName);
      if (!sheet) { Logger.log("⚠ Sheet '" + sheetName + "' not found — skipped."); continue; }
      var rows = getRowsFromSheet(sheet, sheetName);
      Logger.log("  " + sheetName + " → " + rows.length + " rows");
      for (var r = 0; r < rows.length; r++) allRows.push(rows[r]);
    }

    Logger.log("Total rows: " + allRows.length);
    dstSheet.clearContents();
    var output = [FINAL_COLUMNS].concat(allRows);
    dstSheet.getRange(1, 1, output.length, FINAL_COLUMNS.length).setValues(output);
    if (dstSheet.getFrozenRows() < 1) dstSheet.setFrozenRows(1);
    dstSheet.getRange(1, 1, 1, FINAL_COLUMNS.length).setFontWeight("bold");

    Logger.log("✅ mergeSheets() done in " + ((Date.now() - start) / 1000).toFixed(1) + "s");

  } catch (err) {
    Logger.log("❌ ERROR in mergeSheets(): " + err.message + "\n" + err.stack);
    throw err;
  }
}

function getRowsFromSheet(sheet, sheetLabel) {
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow < 2 || lastCol < 1) return [];

  var raw = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  var srcHeaders = raw[0].map(function(h){ return String(h).trim(); });

  var colMap = {};
  for (var c = 0; c < FINAL_COLUMNS.length; c++) {
    var colName = FINAL_COLUMNS[c];
    colMap[colName] = -1;
    if (colName === "Source Sheet") continue;

    var idx = srcHeaders.indexOf(colName);
    if (idx !== -1) { colMap[colName] = idx; continue; }

    for (var alias in ALIASES) {
      if (ALIASES[alias] === colName) {
        var ai = srcHeaders.indexOf(alias);
        if (ai !== -1) { colMap[colName] = ai; break; }
      }
    }
  }

  var outputRows = [];
  for (var r = 1; r < raw.length; r++) {
    var srcRow = raw[r];
    var isBlank = true;
    for (var ci = 0; ci < srcRow.length; ci++) {
      if (srcRow[ci] !== "" && srcRow[ci] !== null && srcRow[ci] !== undefined) { isBlank = false; break; }
    }
    if (isBlank) continue;

    var outRow = new Array(FINAL_COLUMNS.length).fill("");
    for (var col = 0; col < FINAL_COLUMNS.length; col++) {
      var name = FINAL_COLUMNS[col];
      if (name === "Source Sheet") { outRow[col] = sheetLabel; continue; }
      var si = colMap[name];
      if (si !== -1 && si < srcRow.length) outRow[col] = srcRow[si];
    }
    outputRows.push(outRow);
  }
  return outputRows;
}

// ── Trigger functions ────────────────────────────────────────

function setupTrigger() {
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === "mergeSheets") ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger("mergeSheets").timeBased().everyMinutes(SYNC_EVERY_MIN).create();
  Logger.log("✅ Auto-sync ON — runs every " + SYNC_EVERY_MIN + " minutes.");
}

function stopTrigger() {
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === "mergeSheets") ScriptApp.deleteTrigger(t);
  });
  Logger.log("⏹ Auto-sync OFF.");
}


// ============================================================
//  SECTION 3 — RED FLAG EXTRACTOR
//  Button in sheet calls extractRedFlag()
// ============================================================

function extractRedFlag() {
  var start = Date.now();
  Logger.log("▶ extractRedFlag() started");

  try {
    var ss          = SpreadsheetApp.getActiveSpreadsheet();
    var mergedSheet = ss.getSheetByName(DEST_SHEET);

    if (!mergedSheet) {
      SpreadsheetApp.getUi().alert("❌ Merged_Data sheet not found. Run mergeSheets() first.");
      return;
    }

    var redSheet = ss.getSheetByName(REDFLAG_SHEET_NAME) || ss.insertSheet(REDFLAG_SHEET_NAME);

    var lastRow = mergedSheet.getLastRow();
    var lastCol = mergedSheet.getLastColumn();
    if (lastRow < 2) {
      SpreadsheetApp.getUi().alert("Merged_Data is empty. Run mergeSheets() first.");
      return;
    }

    var raw = mergedSheet.getRange(1, 1, lastRow, lastCol).getValues();
    var mergedHeaders = raw[0].map(function(h){ return String(h).trim(); });
    var headerMap = {};
    for (var i = 0; i < mergedHeaders.length; i++) headerMap[mergedHeaders[i]] = i;

    var paymentStatusIdx = headerMap["Payment Status"];
    var cancellationIdx  = headerMap["CANCELLATION DUE"];

    if (paymentStatusIdx === undefined) {
      SpreadsheetApp.getUi().alert("❌ 'Payment Status' column not found in Merged_Data.");
      return;
    }
    if (cancellationIdx === undefined) {
      SpreadsheetApp.getUi().alert("❌ 'CANCELLATION DUE' column not found in Merged_Data.");
      return;
    }

    var outputColIndexes = REDFLAG_COLUMNS.map(function(col) {
      return headerMap[col] !== undefined ? headerMap[col] : -1;
    });

    var today = new Date(); today.setHours(0, 0, 0, 0);
    var day8  = new Date(today); day8.setDate(today.getDate() + 8);
    var day14 = new Date(today); day14.setDate(today.getDate() + 14);

    var matchedRows = [];
    for (var r = 1; r < raw.length; r++) {
      var row = raw[r];

      // Skip blank rows
      var isBlank = true;
      for (var ci = 0; ci < row.length; ci++) {
        if (row[ci] !== "" && row[ci] !== null && row[ci] !== undefined) { isBlank = false; break; }
      }
      if (isBlank) continue;

      // Check payment status — exclude first
      var status = String(row[paymentStatusIdx] || "").trim().toLowerCase();
      var shouldExclude = REDFLAG_EXCLUDE_KEYWORDS.some(function(kw){ return status.indexOf(kw) !== -1; });
      if (shouldExclude) continue;

      // Check include
      var shouldInclude = REDFLAG_INCLUDE_STATUSES.some(function(inc){ return status === inc; });
      if (!shouldInclude) continue;

      // Check cancellation date window
      var cancVal = row[cancellationIdx];
      if (!cancVal) continue;
      var cancDate = new Date(cancVal); cancDate.setHours(0, 0, 0, 0);
      if (isNaN(cancDate.getTime())) continue;
      if (cancDate < day8 || cancDate > day14) continue;

      var outRow = REDFLAG_COLUMNS.map(function(col, idx) {
        var si = outputColIndexes[idx];
        return (si !== -1 && si < row.length) ? row[si] : "";
      });
      matchedRows.push(outRow);
    }

    redSheet.clearContents();
    var output = [REDFLAG_COLUMNS].concat(matchedRows);
    redSheet.getRange(1, 1, output.length, REDFLAG_COLUMNS.length).setValues(output);
    if (redSheet.getFrozenRows() < 1) redSheet.setFrozenRows(1);
    var hdr = redSheet.getRange(1, 1, 1, REDFLAG_COLUMNS.length);
    hdr.setFontWeight("bold").setBackground("#FF4444").setFontColor("#FFFFFF");

    ss.setActiveSheet(redSheet);

    SpreadsheetApp.getUi().alert(
      "✅ Red Flag Extract Done!\n\n" +
      matchedRows.length + " record(s) found\n" +
      "Date window: " + day8.toDateString() + " → " + day14.toDateString()
    );

    Logger.log("✅ extractRedFlag() done in " + ((Date.now() - start) / 1000).toFixed(1) + "s");

  } catch (err) {
    Logger.log("❌ ERROR in extractRedFlag(): " + err.message);
    SpreadsheetApp.getUi().alert("❌ Error: " + err.message);
    throw err;
  }
}


// ============================================================
//  SECTION 4 — CANCELLATION FOLLOWUP
//  Reads from Merged_Data (same destination workbook)
//  Writes into "Cancellation Followup" sheet
// ============================================================

function runCancellationFollowup() {
  try {
    Logger.log("▶ runCancellationFollowup() started");

    var ss           = SpreadsheetApp.getActiveSpreadsheet();
    var masterSheet  = ss.getSheetByName(CANCEL_CONFIG.SOURCE_SHEET_NAME);

    if (!masterSheet) {
      SpreadsheetApp.getUi().alert(
        "❌ Sheet 'Merged_Data' not found.\nPlease run mergeSheets() first."
      );
      return;
    }

    var lastRow = masterSheet.getLastRow();
    var lastCol = masterSheet.getLastColumn();
    if (lastRow < 2) {
      SpreadsheetApp.getUi().alert("Merged_Data is empty. Run mergeSheets() first.");
      return;
    }

    // Batch read Merged_Data
    var allValues = masterSheet.getRange(1, 1, lastRow, lastCol).getValues();
    var headers   = allValues[0].map(function(h){ return h.toString().trim(); });
    var dataRows  = allValues.slice(1);

    // Build header → index map
    var colIndex = {};
    headers.forEach(function(h, i){ if (h) colIndex[h] = i; });

    // Validate required columns exist
    var required = ["Payment Status", "CANCELLATION DUE", "INS Policy Code", "Assured's Name", "Mobile Number"];
    var missing  = required.filter(function(col){ return !(col in colIndex); });
    if (missing.length > 0) {
      SpreadsheetApp.getUi().alert(
        "❌ Missing columns in Merged_Data:\n• " + missing.join("\n• ") +
        "\n\nRun mergeSheets() to refresh the data first."
      );
      return;
    }

    var today = new Date(); today.setHours(0, 0, 0, 0);

    // ── Set CANCELLATION DUE dates in Merged_Data ──────────
    // NOTE: We write back into Merged_Data in the DESTINATION sheet
    // This does NOT touch the source sheet at all
    var statusCol       = colIndex["Payment Status"];
    var cancDueCol      = colIndex["CANCELLATION DUE"];
    var cancDueSheetCol = cancDueCol + 1; // 1-based
    var targetDate      = cancelAddDays(today, CANCEL_CONFIG.DAYS_UNTIL_CANCELLATION);
    var updatedCount    = 0;
    var updates         = [];

    dataRows.forEach(function(row, i) {
      if (cancelIsBlankRow(row)) return;
      var status = row[statusCol] ? row[statusCol].toString().trim() : "";
      if (!cancelIsTriggerStatus(status)) return;

      var existingDue = row[cancDueCol];
      var isEmpty = !existingDue || existingDue.toString().trim() === "";
      if (isEmpty) {
        updates.push({ rowNum: i + 2, value: targetDate }); // +2: row 1 is header, rows are 1-indexed
        row[cancDueCol] = targetDate;
        updatedCount++;
      }
    });

    if (updates.length > 0) {
      updates.forEach(function(u) {
        masterSheet.getRange(u.rowNum, cancDueSheetCol)
          .setValue(u.value)
          .setNumberFormat("MM/DD/YYYY");
      });
      SpreadsheetApp.flush();
    }

    Logger.log("✔ Updated CANCELLATION DUE for " + updatedCount + " rows in Merged_Data.");

    // ── Extract rows within Day 8–14 window ────────────────
    var windowStart = cancelAddDays(today, CANCEL_CONFIG.FOLLOWUP_WINDOW_START);
    var windowEnd   = cancelAddDays(today, CANCEL_CONFIG.FOLLOWUP_WINDOW_END);
    windowStart.setHours(0, 0, 0, 0);
    windowEnd.setHours(23, 59, 59, 999);

    var followupRows = [];

    dataRows.forEach(function(row) {
      if (cancelIsBlankRow(row)) return;
      var status = row[statusCol] ? row[statusCol].toString().trim() : "";
      if (!cancelIsTriggerStatus(status)) return;

      var rawDate = row[cancDueCol];
      if (!rawDate) return;
      var cancDate = cancelParseToDate(rawDate);
      if (!cancDate) return;
      cancDate.setHours(0, 0, 0, 0);
      if (cancDate < windowStart || cancDate > windowEnd) return;

      var extracted = {};
      CANCEL_CONFIG.OUTPUT_COLUMNS.forEach(function(colName) {
        var idx = colIndex[colName];
        extracted[colName] = (idx !== undefined) ? row[idx] : "";
      });
      followupRows.push(extracted);
    });

    // Sort by cancellation date ascending
    followupRows.sort(function(a, b) {
      var da = cancelParseToDate(a["CANCELLATION DUE"]);
      var db = cancelParseToDate(b["CANCELLATION DUE"]);
      return (da || 0) - (db || 0);
    });

    Logger.log("✔ Found " + followupRows.length + " follow-up rows.");

    // ── Write to Cancellation Followup sheet ───────────────
    var outputSheet = ss.getSheetByName(CANCEL_CONFIG.OUTPUT_SHEET_NAME)
                     || ss.insertSheet(CANCEL_CONFIG.OUTPUT_SHEET_NAME);
    outputSheet.clearContents();
    outputSheet.clearFormats();

    var outHeaders  = CANCEL_CONFIG.OUTPUT_COLUMNS;
    var headerRange = outputSheet.getRange(1, 1, 1, outHeaders.length);
    headerRange.setValues([outHeaders])
      .setBackground(CANCEL_CONFIG.OUTPUT_HEADER_COLOR)
      .setFontColor(CANCEL_CONFIG.OUTPUT_HEADER_FONT_COLOR)
      .setFontWeight("bold")
      .setHorizontalAlignment("center");
    outputSheet.setFrozenRows(1);

    if (followupRows.length === 0) {
      outputSheet.getRange(2, 1).setValue(
        "No cases found due between Day " +
        CANCEL_CONFIG.FOLLOWUP_WINDOW_START + " and Day " +
        CANCEL_CONFIG.FOLLOWUP_WINDOW_END + "."
      );
    } else {
      var outputData = followupRows.map(function(row) {
        return CANCEL_CONFIG.OUTPUT_COLUMNS.map(function(col) {
          var val = row[col];
          if (col === "CANCELLATION DUE" && val instanceof Date) {
            return Utilities.formatDate(val, Session.getScriptTimeZone(), "MM/dd/yyyy");
          }
          return (val !== undefined && val !== null) ? val : "";
        });
      });

      outputSheet.getRange(2, 1, outputData.length, outHeaders.length).setValues(outputData);

      // Alternating row colors
      for (var r = 2; r <= outputData.length + 1; r++) {
        var color = r % 2 === 0 ? "#ffe8e8" : "#ffffff";
        outputSheet.getRange(r, 1, 1, outHeaders.length).setBackground(color);
      }

      outputSheet.getRange(2, 1, outputData.length, 1).setFontWeight("bold");
      outputSheet.autoResizeColumns(1, outHeaders.length);

      // Footer summary
      var summaryRow = outputData.length + 3;
      outputSheet.getRange(summaryRow, 1, 1, outHeaders.length).merge()
        .setValue(
          "Last updated: " +
          Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "MM/dd/yyyy HH:mm:ss") +
          "   |   Total follow-up cases: " + outputData.length +
          "   |   Statuses tracked: " + CANCEL_CONFIG.TRIGGER_KEYWORDS.join(", ")
        )
        .setFontColor("#888888")
        .setFontStyle("italic");
    }

    ss.setActiveSheet(outputSheet);

    SpreadsheetApp.getUi().alert(
      "✅ Cancellation Followup Done!\n\n" +
      "• CANCELLATION DUE dates set : " + updatedCount + "\n" +
      "• Follow-up cases (Day 8–14) : " + followupRows.length + "\n\n" +
      "Statuses tracked:\n" +
      CANCEL_CONFIG.TRIGGER_KEYWORDS.map(function(k){ return "  • " + k; }).join("\n")
    );

    Logger.log("✅ runCancellationFollowup() done.");

  } catch (err) {
    Logger.log("❌ ERROR in runCancellationFollowup(): " + err.message);
    SpreadsheetApp.getUi().alert("❌ Error: " + err.message);
    throw err;
  }
}

function debugCancelPaymentStatuses() {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CANCEL_CONFIG.SOURCE_SHEET_NAME);
  if (!sheet) {
    SpreadsheetApp.getUi().alert("Run mergeSheets() first to create Merged_Data.");
    return;
  }

  var headers        = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var statusColIndex = -1;
  for (var i = 0; i < headers.length; i++) {
    if (headers[i].toString().trim() === "Payment Status") { statusColIndex = i; break; }
  }
  if (statusColIndex === -1) {
    SpreadsheetApp.getUi().alert('"Payment Status" column not found in Merged_Data.');
    return;
  }

  var data   = sheet.getRange(2, statusColIndex + 1, sheet.getLastRow() - 1, 1).getValues();
  var counts = {};
  data.forEach(function(row) {
    var val = row[0] ? row[0].toString().trim() : "(blank)";
    counts[val] = (counts[val] || 0) + 1;
  });

  var report = "📋 PAYMENT STATUS VALUES IN Merged_Data:\n";
  report    += "✅ = Will be processed | ❌ = Will be ignored\n";
  report    += "─────────────────────────────────────────\n";

  Object.entries(counts).sort(function(a, b){ return b[1] - a[1]; }).forEach(function(entry) {
    var mark = cancelIsTriggerStatus(entry[0]) ? "✅" : "❌";
    report += mark + "  \"" + entry[0] + "\"  →  " + entry[1] + " row(s)\n";
  });

  Logger.log(report);
  SpreadsheetApp.getUi().alert(report);
}


// ============================================================
//  SECTION 5 — SHARED UTILITY FUNCTIONS
// ============================================================

function cancelIsTriggerStatus(status) {
  if (!status || status.toString().trim() === "") return false;
  var cleaned = status.toString().trim().toLowerCase();
  return CANCEL_CONFIG.TRIGGER_KEYWORDS.some(function(keyword) {
    return keyword.toLowerCase() === cleaned;
  });
}

function cancelIsBlankRow(row) {
  return row.every(function(cell) {
    return cell === null || cell === undefined || cell.toString().trim() === "";
  });
}

function cancelAddDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function cancelParseToDate(value) {
  if (!value) return null;
  if (value instanceof Date) return new Date(value);
  if (typeof value === "number") return new Date((value - 25569) * 86400 * 1000);
  var parsed = new Date(value);
  return isNaN(parsed.getTime()) ? null : parsed;
}


// ============================================================
//  SECTION 6 — MENU (appears when destination sheet loads)
// ============================================================

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("🔔 OTO Tools")
    .addItem("🔄 Sync Merged Data Now",          "mergeSheets")
    .addItem("⏱ Enable Auto Sync (every 5 min)", "setupTrigger")
    .addItem("⏹ Stop Auto Sync",                 "stopTrigger")
    .addSeparator()
    .addItem("🚩 Run Cancellation Followup",      "runCancellationFollowup")
    .addItem("🔴 Extract Red Flag Data",          "extractRedFlag")
    .addSeparator()
    .addItem("🔍 Debug Payment Statuses",         "debugCancelPaymentStatuses")
    .addToUi();
}
