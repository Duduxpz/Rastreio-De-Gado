import { db } from '../database/schema';

export interface Identifiable {
  id: string;
}

export class BaseRepository<T extends Identifiable> {
  table: string;

  constructor(table: string) {
    this.table = table;
  }

  create(item: T): Promise<void> {
    const keys = Object.keys(item).join(', ');
    const placeholders = Object.keys(item).map(() => '?').join(', ');
    const values = Object.keys(item).map((k) => (item as any)[k]);
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          `INSERT OR REPLACE INTO ${this.table} (${keys}) VALUES (${placeholders});`,
          values,
          () => resolve(),
          (_, err) => {
            reject(err);
            return false;
          }
        );
      });
    });
  }

  findById(id: string): Promise<T | null> {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          `SELECT * FROM ${this.table} WHERE id = ? LIMIT 1;`,
          [id],
          (_, res) => {
            if (res.rows.length) resolve(res.rows.item(0) as T);
            else resolve(null);
          },
          (_, err) => {
            reject(err);
            return false;
          }
        );
      });
    });
  }

  listAll(): Promise<T[]> {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          `SELECT * FROM ${this.table} ORDER BY updated_at DESC;`,
          [],
          (_, res) => resolve(Array.from({ length: res.rows.length }).map((_, i) => res.rows.item(i) as T)),
          (_, err) => {
            reject(err);
            return false;
          }
        );
      });
    });
  }

  listUnsynced(): Promise<T[]> {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          `SELECT * FROM ${this.table} WHERE synced = 0 ORDER BY updated_at ASC;`,
          [],
          (_, res) => resolve(Array.from({ length: res.rows.length }).map((_, i) => res.rows.item(i) as T)),
          (_, err) => {
            reject(err);
            return false;
          }
        );
      });
    });
  }
}

export default BaseRepository;
