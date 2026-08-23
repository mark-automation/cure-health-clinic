/**
 * CURE HEALTH — BOOKINGS INTAKE (Sheet + Google Calendar)
 * =======================================================
 * Receives bookings from the clinic website and:
 *   1. Appends each booking as a row in the "Bookings" tab of THIS spreadsheet
 *   2. Creates an event on the "Cure Health Bookings" Google Calendar
 *      (auto-created on first booking; shows up in your Google Calendar sidebar)
 *
 * No payment involved — patients pay on visit.
 * Setup guide: apps-script/SETUP.md (~3 minutes)
 */

var SHEET_NAME = 'Bookings';
var CAL_NAME   = 'Cure Health Bookings';
var HEADERS = ['Timestamp', 'Ref', 'Status', 'Branch', 'Service',
               'Preferred Date', 'Preferred Time', 'Name', 'Phone', 'Notes', 'Source'];

// Time buckets on the form → concrete event hours (Asia/Manila)
// NOTE: keys must match the <option> text in index.html exactly.
var TIME_SLOTS = {
  'Morning (8 – 11 AM)':   ['08', '09'],
  'Midday (11 AM – 2 PM)': ['11', '12'],
  'Afternoon (2 – 5 PM)':  ['14', '15']
};

// Health check — open the URL in a browser: {"ok":true,...}
function doGet() {
  return json_({ ok: true, service: 'Cure Health Bookings', time: new Date().toISOString() });
}

// Website bookings arrive here
function doPost(e) {
  var lock = LockService.getScriptLock();
  try { lock.waitLock(20000); } catch (err) { return json_({ ok: false, error: 'busy' }); }
  try {
    var d = {};
    if (e && e.postData && e.postData.contents) {
      try { d = JSON.parse(e.postData.contents); } catch (_) { d = e.parameter || {}; }
    } else {
      d = (e && e.parameter) || {};
    }
    if (!d.name || !d.phone) return json_({ ok: false, error: 'missing name or phone' });

    var sh = ensureSheet_();
    sh.appendRow([
      new Date(),
      d.ref   || '',
      'NEW',
      d.branch || '',
      d.service || '',
      d.date || '',
      d.time || '',
      d.name,
      d.phone,
      d.notes || '',
      d.source || 'website'
    ]);

    // Also place the booking on the clinic's Google Calendar
    var calResult = 'skipped';
    try { createEvent_(d); calResult = 'created'; }
    catch (err) { calResult = 'failed: ' + err; }

    return json_({ ok: true, calendar: calResult });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/** Optional: run once from the editor to pre-create both tab and calendar. */
function setupBookingsTab() {
  ensureSheet_();
  ensureCalendar_();
  SpreadsheetApp.getActiveSpreadsheet().toast('Bookings tab + calendar ready!', 'Cure Health', 5);
}

/* ---------- internals ---------- */

function ensureSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
    var h = sh.getRange(1, 1, 1, HEADERS.length);
    h.setFontWeight('bold').setBackground('#0a3560').setFontColor('#ffffff');
    sh.setFrozenRows(1);
    sh.setColumnWidth(1, 150);  // Timestamp
    sh.setColumnWidth(2, 130);  // Ref
    sh.setColumnWidth(10, 260); // Notes
  }
  return sh;
}

function ensureCalendar_() {
  var cals = CalendarApp.getCalendarsByName(CAL_NAME);
  if (cals.length) return cals[0];
  return CalendarApp.createCalendar(CAL_NAME, {
    color: CalendarApp.Color.BLUE,
    summary: 'Bookings auto-created from the clinic website',
    timeZone: 'Asia/Manila'
  });
}

function createEvent_(d) {
  if (!d.date) return null;
  var slot = TIME_SLOTS[d.time] || ['08', '09']; // "Any time" → morning placeholder
  var p = String(d.date).split('-');             // yyyy-mm-dd
  var start = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]), Number(slot[0]), 0, 0);
  var end   = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]), Number(slot[1]), 0, 0);

  var title = (d.ref || 'BOOKING') + ' · ' + d.name +
              ' (' + (d.branch || '') + ')' + (d.time ? '' : ' · confirm time');
  var desc = 'Service: ' + (d.service || '—') +
             '\nPhone: ' + (d.phone || '—') +
             '\nPreferred time: ' + (d.time || 'any') +
             '\nNotes: ' + (d.notes || '—') +
             '\nRef: ' + (d.ref || '—') +
             '\n\nConfirm by SMS. Pay on visit — no prepayment.';

  return ensureCalendar_().createEvent(title, start, end, { description: desc });
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o))
                       .setMimeType(ContentService.MimeType.JSON);
}
