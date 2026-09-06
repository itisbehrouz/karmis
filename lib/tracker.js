/**
 * KARMİS Tracker Bridge v2.1.0
 * Unified Database Bridge (SQLite Single Source of Truth with Auto CSV Export)
 */

const db = require('./db');

const HEADERS = [
  'Şirket Adı', 'Pozisyon', 'Uyum Oranı', 'İlan Linki', 'Başvuru Tarihi',
  'Kanal / Kaynak', 'Başvuru Durumu', 'Görüşülen Kişi / İK', 'Son İletişim Tarihi', 'Notlar & Sonraki Adım'
];

function parseTrackingCsv() {
  return db.getAllApplications();
}

function updateApplicationStatus(csvPath, company, position, newStatus) {
  return db.updateApplicationStatus(company, position, newStatus);
}

function updateApplicationNotes(csvPath, company, position, newNotes) {
  return db.updateApplicationNotes(company, position, newNotes);
}

function addApplicationEntry(entry) {
  db.insertApplication(entry);
  return { csvPath: db.CSV_PATH };
}

module.exports = {
  parseTrackingCsv,
  updateApplicationStatus,
  updateApplicationNotes,
  addApplicationEntry,
  HEADERS,
  cleanString: db.cleanString
};
