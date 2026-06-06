import BaseRepository from './BaseRepository';
import { Animal } from '../types';
import { db } from '../database/schema';

export class AnimaisRepository extends BaseRepository<Animal> {
  constructor() {
    super('animais');
  }

  findByBrinco(brinco: string): Promise<Animal | null> {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          `SELECT * FROM animais WHERE brinco = ? LIMIT 1;`,
          [brinco],
          (_, res) => {
            if (res.rows.length) resolve(res.rows.item(0) as Animal);
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

  search(query: string): Promise<Animal[]> {
    const q = `%${query}%`;
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          `SELECT * FROM animais WHERE brinco LIKE ? OR raca LIKE ? ORDER BY updated_at DESC;`,
          [q, q],
          (_, res) => resolve(Array.from({ length: res.rows.length }).map((_, i) => res.rows.item(i) as Animal)),
          (_, err) => {
            reject(err);
            return false;
          }
        );
      });
    });
  }

  async markSynced(ids: string[]): Promise<void> {
    if (!ids.length) return;
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        const placeholders = ids.map(() => '?').join(',');
        tx.executeSql(
          `UPDATE animais SET synced = 1 WHERE id IN (${placeholders});`,
          ids,
          () => resolve(),
          (_, err) => {
            reject(err);
            return false;
          }
        );
      });
    });
  }
}

export default new AnimaisRepository();
