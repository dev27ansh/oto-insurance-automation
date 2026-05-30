# 📊 Column Mapping Reference

## How Column Mapping Works

The script matches columns **by header name**, not by position.
This means even if columns are reordered in the source sheet, the script still finds the right data.

If a column exists in one sheet but not the other, that cell is left **blank** — the script never crashes.

---

## Alias Map (Different Names, Same Data)

These columns have different names in `b2c` vs `renewal` — the script automatically maps them to one unified output column:

| b2c Header | renewal Header | Output Column Name |
|---|---|---|
| `Plate Number / CS` | `Vehicle Plate Number` | `Plate Number / CS` |
| `Commissons %` | `Commisons %` | `Commissons %` |
| `QR Code amount` | `QR Amount` | `QR Code amount` |
| `QR Alias Amount` | `Alias Amount` | `QR Alias Amount` |
| `DATE` | `DATE ` (trailing space) | `DATE` |

---

## Full Output Column List (Merged_Data)

These are all the columns written into `Merged_Data` in this order:

| # | Column Name | Source |
|---|---|---|
| 1 | Source Sheet | Synthetic (added by script) |
| 2 | Channel | Both |
| 3 | INS Policy Code | Both |
| 4 | Insurance ID | Both |
| 5 | UM | Both |
| 6 | SA/SSA | Both |
| 7 | Product | Both |
| 8 | Case Received Date | Both |
| 9 | Policy Issuance Date | Both |
| 10 | Policy Number | Both |
| 11 | Assured's Name | Both |
| 12 | Provider | Both |
| 13 | Lead Source | Both |
| 14 | Category | Both |
| 15 | External Partner/Referrer | Both |
| 16 | Policy Status | Both |
| 17 | Status Date/ Cancellation Date | Both |
| 18 | Mobile Number | Both |
| 19 | Email Address | Both |
| 20 | Vehicle Type | Both |
| 21 | Car Brand | Both |
| 22 | Car Year | Both |
| 23 | Car Model | Both |
| 24 | Plate Number / CS | Both (aliased) |
| 25 | Mortgagee | Both |
| 26 | Effectivity Date | Both |
| 27 | Payment Status | Both |
| 28 | CANCELLATION DUE | Both |
| 29 | TOTAL Payment Received | Both |
| 30 | TOTAL Balance Due | Both |
| ... | *(all remaining columns)* | Both |

---

## Red Flag Output Columns

These 15 columns are extracted into the `redflag` and `Cancellation Followup` sheets:

1. Channel
2. INS Policy Code
3. SA/SSA
4. Policy Number
5. Assured's Name
6. Provider
7. Mobile Number
8. Email Address
9. Plate Number / CS
10. Payment Status
11. Remaining Terms
12. TOTAL Payment Received
13. TOTAL Balance Due
14. CANCELLATION DUE
15. Credit Period

---

## Payment Status Logic

### ✅ Included (processed by red flag script)
- Pending Payment
- 1st Payment Received
- 2nd Payment Received
- 3rd Payment Received
- 4th Payment Received
- 5th Payment Received

### ❌ Excluded (ignored completely)
- Anything containing: `full payment`
- Anything containing: `cancel` (cancelled, cancellation, etc.)
- Anything containing: `reinstat` (reinstated, reinstate, etc.)
- Blank rows
