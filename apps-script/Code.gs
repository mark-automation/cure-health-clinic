/**
 * CURE HEALTH — BOOKINGS INTAKE
 * =============================
 * Paste this into Apps Script attached to your Google Sheet.
 * It receives bookings from the clinic website and appends each one
 * as a row in the "Bookings" tab. No payment involved — pay on visit.
 *
 * Setup guide: see apps-script/SETUP.md (3 minutes)
 */

var SHEET_NAME = 'Bookings';
var HEADERS = ['Timestamp', 'Ref', 'Status', 'Branch', 'Service',
               'Preferred Date', 'Preferred Time', 'Name', 'Phone', 'Notes', 'Source'];

// Health check — open the URL in a browser, you should see {"ok":true,...}
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
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/** Run this ONCE from the editor if you want the tab created immediately
 *  (it also auto-creates itself on the first booking, so this is optional). */
function setupBookingsTab() {
  ensureSheet_();
  SpreadsheetApp.getActiveSpreadsheet().toast('Bookings tab ready!', 'Cure Health', 5);
}

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

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o))
                       .setMimeType(ContentService.MimeType.JSON);
}
