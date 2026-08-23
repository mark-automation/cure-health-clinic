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

## Google Calendar — bookings land here automatically

Once the web app is deployed, every booking **also creates an event on your
Google Calendar** — no need to watch the sheet. Event title:
`[REF] Service — Name`. Details carry the patient's phone number and notes;
the location is set to the branch address. Events block the patient's
preferred time window (morning / midday / afternoon) for 1 hour — adjust the
time when you confirm by SMS.

**One calendar per branch (optional but recommended):**

1. At [calendar.google.com](https://calendar.google.com) create two calendars:
   `Cure Health Imus` and `Cure Health Kawit`.
2. For each: ⚙️ Settings → select the calendar → **Integrate calendar** →
   copy the **Calendar ID** (looks like `abc123@group.calendar.google.com`).
3. Paste them at the top of the script in [`Code.gs`](./Code.gs):
   ```js
   var CALENDAR_IDS = { 'Imus': 'imus-id@group.calendar.google.com',
                        'Kawit': 'kawit-id@group.calendar.google.com' };
   ```
   Leave an ID blank (or skip this whole section) and bookings go to your
   main Google Calendar instead.

The first deploy authorization also covers Calendar — that's expected.

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
