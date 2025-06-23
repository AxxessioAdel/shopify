// syncState.js
// Dieses Modul verwaltet das Speichern und Abrufen des letzten Verarbeitungszeitpunkts mit SQLite.

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

// __dirname Ersatz für ES-Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pfad zur SQLite-Datenbank
const dbPath = path.join(__dirname, 'syncState.sqlite');
const db = new Database(dbPath);

// Tabelle erstellen, falls sie nicht existiert
const createTable = `
  CREATE TABLE IF NOT EXISTS sync_state (
    key TEXT PRIMARY KEY,
    value TEXT
  )
`;
db.prepare(createTable).run();

// Schlüssel für den letzten Verarbeitungszeitpunkt
const LAST_PROCESSED_KEY = 'lastProcessedAt';

/**
 * Gibt den letzten gespeicherten Verarbeitungszeitpunkt zurück.
 * @returns {string|null} ISO-Zeitstempel oder null, falls nicht gesetzt
 */
export function getLastProcessedAt() {
  // Wert aus der Datenbank lesen
  const row = db.prepare('SELECT value FROM sync_state WHERE key = ?').get(LAST_PROCESSED_KEY);
  return row ? row.value : null;
}

/**
 * Setzt oder aktualisiert den Verarbeitungszeitpunkt.
 * @param {string} timestamp - ISO-Zeitstempel
 */
export function setLastProcessedAt(timestamp) {
  // Wert in der Datenbank speichern oder aktualisieren
  db.prepare(`INSERT INTO sync_state (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value`)
    .run(LAST_PROCESSED_KEY, timestamp);
}
