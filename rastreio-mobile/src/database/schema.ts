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

    // Alerts table
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS alerts (
        id TEXT PRIMARY KEY,
        fazenda_id TEXT,
        tipo TEXT,
        nivel TEXT CHECK (nivel IN ('INFO','WARNING','CRITICAL')) DEFAULT 'INFO',
        titulo TEXT,
        descricao TEXT,
        data TEXT,
        lida INTEGER DEFAULT 0,
        arquivada INTEGER DEFAULT 0,
        created_at TEXT,
        synced INTEGER DEFAULT 0
      );`
    );

    // Recommendations table - Updated AI structure
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS recommendations (
        id TEXT PRIMARY KEY,
        fazenda_id TEXT,
        prioridade TEXT CHECK (prioridade IN ('ALTA','MEDIA','BAIXA','INFORMATIVA')) DEFAULT 'MEDIA',
        titulo TEXT,
        descricao TEXT,
        impacto TEXT,
        sugestao TEXT,
        analiseIA TEXT,
        status TEXT CHECK (status IN ('PENDENTE','RECONHECIDA','RESOLVIDA')) DEFAULT 'PENDENTE',
        payload TEXT,
        created_at TEXT,
        updated_at TEXT,
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
