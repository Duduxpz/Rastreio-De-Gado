import * as SQLite from 'expo-sqlite';
import { v4 as uuidv4 } from 'uuid';
import type { Animal, Vacinacao, Pesagem } from '../types';

export const db = SQLite.openDatabase('rastreio.db');

export function initializeDatabase() {
  db.transaction((tx) => {
    tx.executeSql(`
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
    `);
    tx.executeSql(`
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
    `);
    tx.executeSql(`
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
  });
}

export function createAnimal(animal: Omit<Animal, 'id' | 'synced'>): Animal {
  const id = uuidv4();
  const now = new Date().toISOString();
  return { ...animal, id, updated_at: now, synced: 0 };
}

export function getAnimais(_fazendaId: string): Animal[] {
  return [];
}

export function getAnimalById(_id: string): Animal | null {
  return null;
}

export function updateAnimal(_id: string, _updates: Partial<Animal>): void {
  // noop
}

export function createVacinacao(vacinacao: Omit<Vacinacao, 'id' | 'synced'>): Vacinacao {
  return { ...vacinacao, id: uuidv4(), synced: 0 };
}

export function getVacinacoesByAnimal(_animalId: string): Vacinacao[] {
  return [];
}

export function createPesagem(pesagem: Omit<Pesagem, 'id' | 'synced'>): Pesagem {
  return { ...pesagem, id: uuidv4(), synced: 0 };
}

export function getPesagensByAnimal(_animalId: string): Pesagem[] {
  return [];
}

export function getPendingSync() {
  return { animais: [], vacinacoes: [], pesagens: [] };
}

export function markAsSynced(_type: 'animais' | 'vacinacoes' | 'pesagens'): void {
  // noop
}
