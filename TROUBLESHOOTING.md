# 🔧 Troubleshooting

## Common Issues & Fixes

---

### ❌ "Sheet 'renewal' not found in source — skipped"

**Cause:** The sheet name in the source workbook doesn't match exactly.

**Fix:** Open the source workbook and check the exact tab name.
- If it's `Renewals` (capital R) → update `SOURCE_SHEETS` in the script
- If it's `renewal` → already correct
- If it's `Renewal` → change `"renewal"` to `"Renewal"` in the script

```javascript
// Find this line and fix the name
var SOURCE_SHEETS = ["b2c", "renewal"];  // ← check exact spelling
```

---

### ❌ "Cannot open Source workbook"

**Cause:** The script's Google account doesn't have access to the source sheet.

**Fix:** Share the source sheet with your Google account.
1. Open source sheet → Click **Share**
2. Add your email → Set permission to **Viewer**
3. Click **Send**

---

### ❌ Merged_Data is empty after running mergeSheets()

**Cause:** Either the source sheets are empty, or all rows are blank.

**Fix:**
1. Open the source sheet — confirm `b2c` and `renewal` tabs have data
2. Check that row 1 is the header row (not empty)
3. Run `debugCancelPaymentStatuses()` from the menu to verify data exists

---

### ❌ Red Flag sheet shows 0 records

**Cause 1:** No policies have `CANCELLATION DUE` dates in the 8–14 day window.

**Fix:** Run **🚩 Cancellation Followup** first — this auto-fills blank `CANCELLATION DUE` dates, then run **🔴 Extract Red Flag** again.

**Cause 2:** Payment Status values don't exactly match the trigger keywords.

**Fix:** Run **🔍 Debug Payment Statuses** from the menu. Check if your statuses show as ✅ or ❌. If they show ❌, the exact text in your sheet doesn't match. Common issues:
- Extra spaces: `"1st Payment Received "` (trailing space)
- Different capitalisation: `"1st payment received"` vs `"1st Payment Received"`
- Different wording: `"First Payment Received"` instead of `"1st Payment Received"`

To fix, update `TRIGGER_KEYWORDS` in the script to match your exact values.

---

### ❌ Trigger not running automatically

**Cause:** The trigger was never set up, or it got deleted.

**Fix:**
1. Go to Apps Script
2. Click the **clock icon** (Triggers) on the left sidebar
3. If no trigger exists → run `setupTrigger()` from the editor
4. If trigger exists but isn't firing → delete it and run `setupTrigger()` again

---

### ❌ Some columns are blank in Merged_Data

**Cause:** That column name in the source sheet doesn't match the expected name in the script.

**Fix:**
1. Open the source sheet and check the exact header spelling in row 1
2. Compare with `FINAL_COLUMNS` array in the script
3. If there's a mismatch, either:
   - Fix the header in the source sheet, OR
   - Add an alias in the `ALIASES` object in the script:
```javascript
var ALIASES = {
  "Actual Name In Sheet" : "Name In FINAL_COLUMNS",
  // add your mapping here
};
```

---

### ❌ Script times out on large datasets

**Cause:** Google Apps Script has a 6-minute execution limit.

**Fix:** The script already uses batch operations (`getValues`/`setValues`) which are the fastest approach. If you still hit the limit:
- Reduce `FINAL_COLUMNS` to only the columns you actually need
- Consider splitting b2c and renewal into separate sync functions

---

## Still stuck?

Run `debugCancelPaymentStatuses()` from the **🔔 OTO Tools** menu and check:
- Are your payment statuses being detected correctly?
- How many rows exist in Merged_Data?

Check **View → Logs** in Apps Script after any function run to see detailed execution logs.
