import * as SQLite from 'expo-sqlite';

const DB_NAME = 'rastreio.db';

export const db = SQLite.openDatabase(DB_NAME);

export function initDatabase() {
  // Create core tables mirroring server schema but with `synced` flag
  db.transaction((tx) => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS animais (
        id TEXT PRIMARY KEY,
        fazenda_id TEXT,
        brinco TEXT,
        raca TEXT,
        sexo TEXT,
        data_nascimento TEXT,
        peso_atual REAL,
        lote TEXT,
        pasto TEXT,
        categoria TEXT,
        foto_url TEXT,
        ativo INTEGER DEFAULT 1,
        updated_at TEXT,
        synced INTEGER DEFAULT 0
      );`
    );

    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS vacinacoes (
        id TEXT PRIMARY KEY,
        animal_id TEXT,
        vacina TEXT,
        data TEXT,
        dose TEXT,
        veterinario TEXT,
        proxima_dose TEXT,
        created_at TEXT,
        synced INTEGER DEFAULT 0
      );`
    );

    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS pesagens (
        id TEXT PRIMARY KEY,
        animal_id TEXT,
        peso REAL,
        data TEXT,
        observacao TEXT,
        created_at TEXT,
        synced INTEGER DEFAULT 0
      );`
    );

    // Queue table for sync
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS sync_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        endpoint TEXT NOT NULL,
        payload TEXT NOT NULL,
        attempts INTEGER DEFAULT 0,
        last_error TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        next_try_at TEXT
      );`
    );
  });
}

export default initDatabase;
