# 📖 Setup Guide

## Step 1 — Get the Sheet IDs

Your two Google Sheet IDs are already configured in the script:

| Sheet | ID |
|---|---|
| Source (b2c + renewal data) | `1YC7z2msZSbzo2T4lIGJrDodB7--QgaigZL2VpjuWljQ` |
| Destination (master output) | `1S3oKkVVVi1zrmOxmQRYjvxrBl1ft4XDiH844zl_LdJQ` |

> To find a Sheet ID: look at the URL → `docs.google.com/spreadsheets/d/**ID_IS_HERE**/edit`

---

## Step 2 — Open Apps Script in Destination Sheet

1. Open the **Destination Sheet**
2. Click **Extensions** in the top menu
3. Click **Apps Script**
4. A new tab opens with a code editor

---

## Step 3 — Paste the Script

1. In the code editor, press **Ctrl+A** to select all existing code
2. Press **Delete**
3. Open `FULL_DESTINATION_SCRIPT.gs` from this repo
4. Copy everything → Paste into the editor
5. Press **Ctrl+S** to save
6. Name the project anything (e.g. "OTO Automation") → Click OK

---

## Step 4 — Run Initial Merge

1. In the function dropdown (top center of editor), select **`mergeSheets`**
2. Click ▶ **Run**
3. A popup will ask for permissions — click **Review Permissions**
4. Choose your Google account → Click **Allow**
5. Wait for it to finish (check the Execution Log at the bottom)
6. Go back to your destination sheet — you'll see `Merged_Data` tab created

---

## Step 5 — Enable Auto Sync

1. In the function dropdown, select **`setupTrigger`**
2. Click ▶ **Run**
3. Done — the merge will now run automatically every 5 minutes

---

## Step 6 — Add the Red Flag Button (Optional)

1. Go to your destination sheet
2. Click **Insert → Drawing**
3. Draw a rectangle shape
4. Type **"🔴 Extract Red Flag"** inside it
5. Click **Save & Close**
6. Click the **⋮ (3 dots)** on the drawing → **Assign Script**
7. Type: `extractRedFlag` → Click **OK**

---

## Step 7 — Reload the Sheet

Close the Apps Script tab and **reload** your destination sheet.
You'll see a new **🔔 OTO Tools** menu in the top menu bar.

---

## Verify Everything Works

Run these checks:

| Check | How |
|---|---|
| Merged_Data has data | Open Merged_Data tab — should have rows from both b2c and renewal |
| Source Sheet column | First column should say "b2c" or "renewal" for each row |
| Auto sync is running | Go to Apps Script → Triggers (clock icon on left) — should see a trigger |
| Red Flag works | Click 🔴 Extract Red Flag from menu — should create redflag tab |
