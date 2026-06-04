import * as SQLite from 'expo-sqlite';
import { v4 as uuidv4 } from 'uuid';
import type { Animal, Vacinacao, Pesagem } from '../types';

const db = SQLite.openDatabaseSync('rastreio.db');

export function initializeDatabase() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS animais (
      id TEXT PRIMARY KEY,
      fazenda_id TEXT NOT NULL,
      brinco TEXT NOT NULL,
      raca TEXT,
      sexo TEXT,
      data_nascimento TEXT,
      peso_atual REAL,
      lote TEXT,
      pasto TEXT,
      categoria TEXT,
      foto_url TEXT,
      ativo INTEGER DEFAULT 1,
      updated_at TEXT NOT NULL,
      synced INTEGER DEFAULT 0,
      UNIQUE(fazenda_id, brinco)
    );

    CREATE TABLE IF NOT EXISTS vacinacoes (
      id TEXT PRIMARY KEY,
      animal_id TEXT NOT NULL,
      vacina TEXT NOT NULL,
      data TEXT NOT NULL,
      dose TEXT,
      veterinario TEXT,
      proxima_dose TEXT,
      synced INTEGER DEFAULT 0,
      FOREIGN KEY(animal_id) REFERENCES animais(id)
    );

    CREATE TABLE IF NOT EXISTS pesagens (
      id TEXT PRIMARY KEY,
      animal_id TEXT NOT NULL,
      peso REAL NOT NULL,
      data TEXT NOT NULL,
      observacao TEXT,
      synced INTEGER DEFAULT 0,
      FOREIGN KEY(animal_id) REFERENCES animais(id)
    );
  `);
}

// CRUD Animais
export function createAnimal(animal: Omit<Animal, 'id' | 'synced'>): Animal {
  const id = uuidv4();
  const now = new Date().toISOString();
  db.runSync(
    `INSERT INTO animais (id, fazenda_id, brinco, raca, sexo, data_nascimento, 
      peso_atual, lote, pasto, categoria, foto_url, ativo, updated_at, synced)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
    [
      id,
      animal.fazenda_id,
      animal.brinco,
      animal.raca,
      animal.sexo,
      animal.data_nascimento,
      animal.peso_atual,
      animal.lote,
      animal.pasto,
      animal.categoria,
      animal.foto_url,
      animal.ativo ? 1 : 0,
      now,
    ]
  );
  return { ...animal, id, updated_at: now, synced: 0 };
}

export function getAnimais(fazendaId: string): Animal[] {
  return db
    .getAllSync(
      'SELECT * FROM animais WHERE fazenda_id = ? AND ativo = 1 ORDER BY brinco',
      [fazendaId]
    )
    .map((row: any) => ({
      ...row,
      ativo: Boolean(row.ativo),
      synced: row.synced,
    }));
}

export function getAnimalById(id: string): Animal | null {
  const result = db.getFirstSync('SELECT * FROM animais WHERE id = ?', [id]);
  return result
    ? { ...result, ativo: Boolean(result.ativo), synced: result.synced }
    : null;
}

export function updateAnimal(id: string, updates: Partial<Animal>): void {
  const now = new Date().toISOString();
  const fields = Object.keys(updates)
    .filter((k) => k !== 'id' && k !== 'fazenda_id')
    .map((k) => `${k} = ?`)
    .join(', ');
  const values = Object.keys(updates)
    .filter((k) => k !== 'id' && k !== 'fazenda_id')
    .map((k) => updates[k as keyof Animal]);

  db.runSync(
    `UPDATE animais SET ${fields}, updated_at = ?, synced = 0 WHERE id = ?`,
    [...values, now, id]
  );
}

// CRUD Vacinações
export function createVacinacao(vacinacao: Omit<Vacinacao, 'id' | 'synced'>): Vacinacao {
  const id = uuidv4();
  db.runSync(
    `INSERT INTO vacinacoes (id, animal_id, vacina, data, dose, veterinario, proxima_dose, synced)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
    [
      id,
      vacinacao.animal_id,
      vacinacao.vacina,
      vacinacao.data,
      vacinacao.dose,
      vacinacao.veterinario,
      vacinacao.proxima_dose,
    ]
  );
  return { ...vacinacao, id, synced: 0 };
}

export function getVacinacoesByAnimal(animalId: string): Vacinacao[] {
  return db.getAllSync('SELECT * FROM vacinacoes WHERE animal_id = ? ORDER BY data DESC', [
    animalId,
  ]);
}

// CRUD Pesagens
export function createPesagem(pesagem: Omit<Pesagem, 'id' | 'synced'>): Pesagem {
  const id = uuidv4();
  db.runSync(
    `INSERT INTO pesagens (id, animal_id, peso, data, observacao, synced)
     VALUES (?, ?, ?, ?, ?, 0)`,
    [id, pesagem.animal_id, pesagem.peso, pesagem.data, pesagem.observacao]
  );
  return { ...pesagem, id, synced: 0 };
}

export function getPesagensByAnimal(animalId: string): Pesagem[] {
  return db.getAllSync('SELECT * FROM pesagens WHERE animal_id = ? ORDER BY data DESC', [
    animalId,
  ]);
}

// Sync helpers
export function getPendingSync() {
  const animais = db.getAllSync('SELECT * FROM animais WHERE synced = 0');
  const vacinacoes = db.getAllSync('SELECT * FROM vacinacoes WHERE synced = 0');
  const pesagens = db.getAllSync('SELECT * FROM pesagens WHERE synced = 0');
  return { animais, vacinacoes, pesagens };
}

export function markAsSynced(type: 'animais' | 'vacinacoes' | 'pesagens'): void {
  db.runSync(`UPDATE ${type} SET synced = 1 WHERE synced = 0`);
}
