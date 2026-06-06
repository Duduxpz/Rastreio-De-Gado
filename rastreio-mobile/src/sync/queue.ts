import { db } from '../database/schema';
import { apiFetch } from '../services/api';

export interface QueueItem {
  id?: number;
  endpoint: string;
  payload: any;
  attempts?: number;
}

export function enqueue(endpoint: string, payload: any) {
  const payloadStr = JSON.stringify(payload);
  db.transaction((tx) => {
    tx.executeSql(`INSERT INTO sync_queue (endpoint, payload) VALUES (?, ?);`, [endpoint, payloadStr]);
  });
}

export function processQueue(): Promise<void> {
  return new Promise((resolve) => {
    db.transaction((tx) => {
      tx.executeSql(`SELECT * FROM sync_queue ORDER BY id ASC LIMIT 20;`, [], async (_, res) => {
        const rows = Array.from({ length: res.rows.length }).map((_, i) => res.rows.item(i));
        for (const row of rows) {
          try {
            const payload = JSON.parse(row.payload);
            await apiFetch(row.endpoint, { method: 'POST', body: JSON.stringify(payload) });
            tx.executeSql(`DELETE FROM sync_queue WHERE id = ?;`, [row.id]);
          } catch (err: any) {
            const attempts = (row.attempts || 0) + 1;
            tx.executeSql(`UPDATE sync_queue SET attempts = ? , last_error = ? WHERE id = ?;`, [attempts, String(err?.message ?? err), row.id]);
          }
        }
        resolve();
      });
    });
  });
}

export default { enqueue, processQueue };
