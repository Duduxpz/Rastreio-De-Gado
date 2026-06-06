import BaseRepository from './BaseRepository';
import { Vacinacao } from '../types';
import { db } from '../database/schema';

export class VacinacoesRepository extends BaseRepository<Vacinacao> {
  constructor() {
    super('vacinacoes');
  }

  listByAnimal(animalId: string): Promise<Vacinacao[]> {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          `SELECT * FROM vacinacoes WHERE animal_id = ? ORDER BY data DESC;`,
          [animalId],
          (_, res) => resolve(Array.from({ length: res.rows.length }).map((_, i) => res.rows.item(i) as Vacinacao)),
          (_, err) => {
            reject(err);
            return false;
          }
        );
      });
    });
  }
}

export default new VacinacoesRepository();
