import { SQLiteDatabase } from 'expo-sqlite';
import { v4 as uuidv4 } from 'uuid';
import type { Alert, Recommendation } from '../types';
import { BaseRepository } from './BaseRepository';

export class AlertsRepository extends BaseRepository<Alert> {
  constructor(db: SQLiteDatabase) {
    super(db, 'alerts');
  }

  private executeSql<T>(sql: string, params: any[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(
          sql,
          params,
          (_, result) => {
            const items: T[] = [];
            for (let i = 0; i < result.rows.length; i += 1) {
              items.push(result.rows.item(i) as T);
            }
            resolve(items);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  private runSql(sql: string, params: any[] = []): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(
          sql,
          params,
          () => resolve(),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async create(alert: Omit<Alert, 'id'>): Promise<Alert> {
    const id = uuidv4();
    const now = new Date().toISOString();

    await this.runSql(
      `INSERT INTO ${this.table} (id, fazenda_id, tipo, nivel, titulo, descricao, data, lida, arquivada, created_at, synced)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        alert.fazenda_id,
        alert.tipo,
        alert.nivel,
        alert.titulo,
        alert.descricao,
        alert.data ? JSON.stringify(alert.data) : null,
        0,
        0,
        now,
        0,
      ]
    );

    return { ...alert, id, created_at: now, synced: 0, lida: false, arquivada: false };
  }

  async findByFazenda(fazendaId: string): Promise<Alert[]> {
    const rows = await this.executeSql<any>(
      `SELECT * FROM ${this.table} WHERE fazenda_id = ? ORDER BY created_at DESC`,
      [fazendaId]
    );

    return rows.map((row) => this.parseAlert(row));
  }

  async findUnread(fazendaId: string): Promise<Alert[]> {
    const rows = await this.executeSql<any>(
      `SELECT * FROM ${this.table} WHERE fazenda_id = ? AND lida = 0 ORDER BY created_at DESC`,
      [fazendaId]
    );

    return rows.map((row) => this.parseAlert(row));
  }

  async markAsRead(id: string): Promise<void> {
    await this.runSql(`UPDATE ${this.table} SET lida = 1 WHERE id = ?`, [id]);
  }

  async markAsArchived(id: string): Promise<void> {
    await this.runSql(`UPDATE ${this.table} SET arquivada = 1 WHERE id = ?`, [id]);
  }

  async findUnsynced(): Promise<Alert[]> {
    const rows = await this.executeSql<any>(`SELECT * FROM ${this.table} WHERE synced = 0`, []);
    return rows.map((row) => this.parseAlert(row));
  }

  async markSynced(id: string): Promise<void> {
    await this.runSql(`UPDATE ${this.table} SET synced = 1 WHERE id = ?`, [id]);
  }

  private parseAlert(row: any): Alert {
    return {
      id: row.id,
      fazenda_id: row.fazenda_id,
      tipo: row.tipo,
      nivel: row.nivel,
      titulo: row.titulo,
      descricao: row.descricao,
      data: row.data ? JSON.parse(row.data) : undefined,
      lida: !!row.lida,
      arquivada: !!row.arquivada,
      created_at: row.created_at,
      synced: row.synced,
    };
  }
}

export class RecommendationsRepository extends BaseRepository<Recommendation> {
  constructor(db: SQLiteDatabase) {
    super(db, 'recommendations');
  }

  private executeSql<T>(sql: string, params: any[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(
          sql,
          params,
          (_, result) => {
            const items: T[] = [];
            for (let i = 0; i < result.rows.length; i += 1) {
              items.push(result.rows.item(i) as T);
            }
            resolve(items);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  private runSql(sql: string, params: any[] = []): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(
          sql,
          params,
          () => resolve(),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async create(rec: Omit<Recommendation, 'id' | 'created_at' | 'updated_at'>): Promise<Recommendation> {
    const id = uuidv4();
    const now = new Date().toISOString();

    await this.runSql(
      `INSERT INTO ${this.table} (id, fazenda_id, prioridade, titulo, descricao, impacto, sugestao, analiseIA, status, payload, created_at, updated_at, synced)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        rec.fazenda_id,
        rec.prioridade,
        rec.titulo,
        rec.descricao,
        rec.impacto,
        rec.sugestao,
        rec.analiseIA,
        'PENDENTE',
        rec.payload ? JSON.stringify(rec.payload) : null,
        now,
        now,
        0,
      ]
    );

    return {
      ...rec,
      id,
      status: 'PENDENTE',
      created_at: now,
      updated_at: now,
      synced: 0,
    };
  }

  async findByFazenda(fazendaId: string): Promise<Recommendation[]> {
    const rows = await this.executeSql<any>(
      `SELECT * FROM ${this.table} WHERE fazenda_id = ? ORDER BY prioridade DESC, created_at DESC`,
      [fazendaId]
    );

    return rows.map((row) => this.parseRecommendation(row));
  }

  async findByStatus(fazendaId: string, status: string): Promise<Recommendation[]> {
    const rows = await this.executeSql<any>(
      `SELECT * FROM ${this.table} WHERE fazenda_id = ? AND status = ? ORDER BY prioridade DESC`,
      [fazendaId, status]
    );

    return rows.map((row) => this.parseRecommendation(row));
  }

  async updateStatus(id: string, status: 'PENDENTE' | 'RECONHECIDA' | 'RESOLVIDA'): Promise<void> {
    await this.runSql(`UPDATE ${this.table} SET status = ?, updated_at = ? WHERE id = ?`, [status, new Date().toISOString(), id]);
  }

  async findUnsynced(): Promise<Recommendation[]> {
    const rows = await this.executeSql<any>(`SELECT * FROM ${this.table} WHERE synced = 0`, []);
    return rows.map((row) => this.parseRecommendation(row));
  }

  async markSynced(id: string): Promise<void> {
    await this.runSql(`UPDATE ${this.table} SET synced = 1 WHERE id = ?`, [id]);
  }

  private parseRecommendation(row: any): Recommendation {
    return {
      id: row.id,
      fazenda_id: row.fazenda_id,
      prioridade: row.prioridade,
      titulo: row.titulo,
      descricao: row.descricao,
      impacto: row.impacto,
      sugestao: row.sugestao,
      analiseIA: row.analiseIA,
      status: row.status || 'PENDENTE',
      payload: row.payload ? JSON.parse(row.payload) : undefined,
      created_at: row.created_at,
      updated_at: row.updated_at,
      synced: row.synced,
    };
  }
}
