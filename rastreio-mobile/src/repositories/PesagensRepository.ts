import BaseRepository from './BaseRepository';
import { Pesagem } from '../types';
import { db } from '../database/schema';

export class PesagensRepository extends BaseRepository<Pesagem> {
  constructor() {
    super('pesagens');
  }

  listByAnimal(animalId: string): Promise<Pesagem[]> {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          `SELECT * FROM pesagens WHERE animal_id = ? ORDER BY data DESC;`,
          [animalId],
          (_, res) => resolve(Array.from({ length: res.rows.length }).map((_, i) => res.rows.item(i) as Pesagem)),
          (_, err) => {
            reject(err);
            return false;
          }
        );
      });
    });
  }
}

export default new PesagensRepository();
