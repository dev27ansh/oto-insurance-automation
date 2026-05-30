# 🚗 OTO Insurance — Live Policy Tracker & Cancellation Automation

> A Google Apps Script automation that merges insurance policy data from multiple sheets, tracks payment statuses, flags policies at risk of cancellation, and generates automated follow-up reports — all inside Google Sheets.

---

## 📌 Problem Statement

OTO Insurance manages hundreds of motor insurance policies across two separate sales channels — **B2C (direct sales)** and **Renewals**. Policy data for both channels is maintained in separate sheets inside a source workbook by the operations team.

### The Problems Before This Solution

| # | Problem |
|---|---|
| 1 | Data from `b2c` and `renewal` sheets lived in two separate places — there was no single unified view of all policies |
| 2 | Teams had to manually copy-paste data from both sheets into a master report — time-consuming and error-prone |
| 3 | No automated way to track which policies were approaching their **cancellation due date** |
| 4 | Policies with partial payments (1st, 2nd, 3rd... installments received) that were nearing cancellation were identified manually — often too late |
| 5 | The source workbook was managed by a separate team — no one had permission to add automation scripts to it |
| 6 | Different column names across sheets (`Plate Number / CS` in b2c vs `Vehicle Plate Number` in renewals) caused confusion during manual merges |

### What This Solution Does

- ✅ **Automatically merges** `b2c` and `renewal` sheets into one clean `Merged_Data` sheet every 5 minutes
- ✅ **Flags policies at risk** — identifies cases where payment has been partially received but cancellation is due in 8–14 days
- ✅ **Excludes noise** — automatically skips fully paid, cancelled, and reinstated policies
- ✅ **Runs entirely from the destination workbook** — no access to the source sheet required
- ✅ **Zero manual effort** — once set up, everything runs automatically

---

## 🗂️ Project Structure

```
oto-insurance-automation/
│
├── README.md                        ← You are here
├── FULL_DESTINATION_SCRIPT.gs       ← Main script (paste into destination sheet)
├── docs/
│   ├── SETUP_GUIDE.md               ← Step-by-step setup instructions
│   ├── COLUMN_MAPPING.md            ← How columns are mapped across sheets
│   └── TROUBLESHOOTING.md           ← Common errors and fixes
└── .gitignore
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│           SOURCE WORKBOOK               │
│  (Read-only — no script access needed)  │
│                                         │
│   ┌──────────┐     ┌──────────────┐     │
│   │   b2c    │     │   renewal    │     │
│   │  sheet   │     │   sheet      │     │
│   └────┬─────┘     └──────┬───────┘     │
└────────┼──────────────────┼─────────────┘
         │                  │
         │   Reads every    │
         │    5 minutes     │
         ▼                  ▼
┌─────────────────────────────────────────┐
│         DESTINATION WORKBOOK            │
│      (All scripts live here)            │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │          Merged_Data            │   │
│   │  (All policies — unified view)  │   │
│   └───────────────┬─────────────────┘   │
│                   │                     │
│         ┌─────────┴──────────┐          │
│         ▼                    ▼          │
│   ┌───────────┐     ┌──────────────┐    │
│   │  redflag  │     │ Cancellation │    │
│   │   sheet   │     │  Followup    │    │
│   └───────────┘     └──────────────┘    │
└─────────────────────────────────────────┘
```

---

## ⚙️ Features

### 1. 🔄 Auto Merge (every 5 minutes)
- Pulls all rows from `b2c` and `renewal` in the source workbook
- Maps columns dynamically by **header name** — not column position
- Handles different column names across sheets using an alias map
- Skips blank rows automatically
- Adds a `Source Sheet` column so you always know where each row came from
- Writes everything in one batch operation (fast, even for large datasets)

### 2. 🔴 Red Flag Extraction
- Scans `Merged_Data` for policies matching these payment statuses:
  - 1st Payment Received
  - 2nd Payment Received
  - 3rd Payment Received
  - 4th Payment Received
  - 5th Payment Received
- Further filters to only include policies where `CANCELLATION DUE` is **8 to 14 days from today**
- Automatically **excludes** policies marked as: Full Payment, Cancelled, Reinstated
- Outputs results to a dedicated `redflag` sheet with red header formatting

### 3. 🚩 Cancellation Followup
- Same filtering logic as Red Flag
- Additionally **auto-fills** blank `CANCELLATION DUE` dates (sets to Today + 14 days)
- Outputs to `Cancellation Followup` sheet with alternating row colors and a summary footer

### 4. 🔍 Debug Payment Statuses
- Shows all unique Payment Status values found in Merged_Data
- Marks each one ✅ (will be processed) or ❌ (will be ignored)
- Useful for diagnosing why a row isn't appearing in the red flag output

---

## 🚀 Quick Start

### Prerequisites
- A Google account with access to both source and destination Google Sheets
- The source sheet must be **shared** with your Google account (Viewer access is enough)

### Setup in 6 Steps

**1.** Open your [Destination Google Sheet](https://docs.google.com/spreadsheets/d/1S3oKkVVVi1zrmOxmQRYjvxrBl1ft4XDiH844zl_LdJQ)

**2.** Click **Extensions → Apps Script**

**3.** Delete all existing code → Paste the contents of `FULL_DESTINATION_SCRIPT.gs` → **Ctrl+S**

**4.** In the function dropdown, select `mergeSheets` → Click ▶ **Run** → Approve permissions

**5.** Select `setupTrigger` → Click ▶ **Run** (enables auto-sync every 5 minutes)

**6.** Close Apps Script → **Reload** the destination sheet → You'll see the **🔔 OTO Tools** menu

> Full details in [docs/SETUP_GUIDE.md](docs/SETUP_GUIDE.md)

---

## 📋 Menu Options

Once deployed, a **🔔 OTO Tools** menu appears in the destination sheet:

| Menu Item | Function | Description |
|---|---|---|
| 🔄 Sync Merged Data Now | `mergeSheets()` | Manually trigger an immediate merge |
| ⏱ Enable Auto Sync | `setupTrigger()` | Start auto-sync every 5 minutes |
| ⏹ Stop Auto Sync | `stopTrigger()` | Pause the auto-sync |
| 🚩 Run Cancellation Followup | `runCancellationFollowup()` | Set due dates + extract 8–14 day cases |
| 🔴 Extract Red Flag Data | `extractRedFlag()` | Extract policies at risk of cancellation |
| 🔍 Debug Payment Statuses | `debugCancelPaymentStatuses()` | Inspect all payment status values |

---

## 🗃️ Column Alias Mapping

Some columns have different names in `b2c` vs `renewal`. The script handles this automatically:

| renewal Column Name | Maps To (b2c / Output Name) |
|---|---|
| `Vehicle Plate Number` | `Plate Number / CS` |
| `Commisons %` | `Commissons %` |
| `QR Amount` | `QR Code amount` |
| `Alias Amount` | `QR Alias Amount` |
| `DATE ` (trailing space) | `DATE` |

---

## 🛠️ Configuration

All settings are at the top of `FULL_DESTINATION_SCRIPT.gs`:

```javascript
var SOURCE_ID      = "your-source-sheet-id";
var DESTINATION_ID = "your-destination-sheet-id";
var SOURCE_SHEETS  = ["b2c", "renewal"];
var SYNC_EVERY_MIN = 5;   // change to 1, 10, 15, 30 as needed
```

To add/remove output columns, edit `FINAL_COLUMNS` array.
To add/remove tracked payment statuses, edit `CANCEL_CONFIG.TRIGGER_KEYWORDS`.

---

## 📊 Output Sheets

| Sheet Name | Created By | Contents |
|---|---|---|
| `Merged_Data` | Auto (every 5 min) | All policies from b2c + renewal merged |
| `redflag` | Manual button click | Policies 8–14 days from cancellation |
| `Cancellation Followup` | Manual button click | Same as redflag + auto-filled due dates |

---

## 🔒 Permissions & Security

- The script only **reads** from the source workbook — it never writes to it
- All writes happen only in the destination workbook
- Google OAuth permissions required: Google Sheets (read/write), Script triggers
- No external APIs used — everything runs within Google's ecosystem

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

## 👤 Author

Built for OTO Insurance operations team to automate policy tracking and cancellation followups.
