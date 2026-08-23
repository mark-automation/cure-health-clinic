# Cure Health — Booking Sheet Setup (3 minutes)

This connects the website's booking form to a Google Sheet **in your Gmail Drive**.
Every booking lands as a row in the sheet. No payment step — patients pay on visit.

## One-time setup

1. **Create the Sheet** — go to [sheets.new](https://sheets.new) (make sure you're
   logged into your Gmail). Rename it: `Cure Health — Bookings`.

2. **Open Apps Script** — in the sheet menu: **Extensions → Apps Script**.
   Delete whatever code is there and paste the contents of
   [`Code.gs`](./Code.gs) from this folder. Press **Ctrl+S** to save.

3. **Deploy it** — top-right button **Deploy → New deployment**:
   - Click the gear icon → choose **Web app**
   - Description: `bookings intake`
   - Execute as: **Me**
   - Who has access: **Anyone** ← important, this is what lets the website post
   - Click **Deploy** → **Authorize access** → pick your account →
     *Advanced → Go to … (unsafe)* → **Allow** (this is Google's standard warning
     for your own scripts)

4. **Copy the URL** — it looks like:
   `https://script.google.com/macros/s/AKfycb.../exec`

5. **Wire the website** — send that URL, and it gets pasted into
   `index.html` on line ~590:
   ```js
   var BOOKING_ENDPOINT = "https://script.google.com/macros/s/AKfycb.../exec";
   ```

6. **Test** — book a test appointment on the website. A row should appear in
   your sheet within a second.

## Seeing bookings day-to-day

- Open the sheet anytime at [sheets.google.com](https://sheets.google.com)
  or install the **Google Sheets app** on your phone for instant viewing.
- The **Status** column starts as `NEW` — change it to `CONFIRMED` or `DONE`
  as you handle each booking (add colored dropdowns via Data → Data validation).
- Optional: in the sheet, **Share** it with staff emails so they see bookings too.

## Troubleshooting

| Problem | Fix |
|---|---|
| Form says "send via SMS" fallback | Endpoint not set yet, or deployment access isn't "Anyone" — redeploy with correct access |
| Test row doesn't appear | Make sure you copied the URL ending in `/exec` (not `/dev`) |
| Want bookings also emailed | Ask Den — a 5-line addition can email you per booking |
