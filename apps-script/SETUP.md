# Cure Health — Booking Setup (Sheet + Google Calendar, ~3 minutes)

This connects the website's booking form to **your Gmail Drive**: every booking
becomes a row in a Google Sheet **and** an event on a dedicated Google Calendar.
No payment step — patients pay on visit.

## One-time setup

1. **Create the Sheet** — go to [sheets.new](https://sheets.new) (logged into your
   Gmail). Rename it: `Cure Health — Bookings`.

2. **Set the timezone** (important for correct calendar times) — in the sheet:
   **File → Settings → Time zone → GMT+08:00 Manila → Save**.

3. **Open Apps Script** — menu: **Extensions → Apps Script**. Delete the sample
   code, paste all of [`Code.gs`](./Code.gs), press **Ctrl+S**.

4. *(Recommended)* Set script timezone: in Apps Script,
   **Project Settings ⚙️ → check "Show appsscript.json"**, then add
   `"timeZone": "Asia/Manila"` inside the JSON file, save.

5. **Deploy** — top-right **Deploy → New deployment**:
   - gear icon → **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone** ← required so the website can post
   - **Deploy** → **Authorize access** → your account →
     *Advanced → Go to … (unsafe)* → **Allow**
     (Google's standard warning for your own script; it needs Sheets + Calendar rights)

6. **Copy the URL** ending in `/exec` and send it over — it gets pasted into
   `index.html` (`var BOOKING_ENDPOINT = "…";`) and pushed live.

7. **Test** — book once on the website. You should see:
   - a new row in the **Bookings** tab
   - an event on the **"Cure Health Bookings"** calendar (appears in your
     Google Calendar sidebar under "Other calendars")

## Day-to-day

- **See bookings:** open [calendar.google.com](https://calendar.google.com) or
  the Sheets app — every request is on the calendar with ref #, name, service
  and phone number in the event description.
- **Confirm:** text the patient their exact time; then mark the sheet row's
  **Status** column `CONFIRMED` / `DONE`.
- **Staff access:** Share the sheet + calendar with staff emails if others
  handle bookings.

## Troubleshooting

| Problem | Fix |
|---|---|
| Form shows the SMS fallback | Endpoint not set yet, or deployment access isn't "Anyone" |
| Row appears but no calendar event | Re-authorize: in Apps Script run `setupBookingsTab` once and allow Calendar permission |
| Event at wrong hour | Check both timezones from steps 2 & 4 are Manila |
| Want bookings emailed too | Ask Den — 5-line addition |
