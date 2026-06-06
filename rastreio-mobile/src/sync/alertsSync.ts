import { db } from '../database/schema';
import { AlertsRepository, RecommendationsRepository } from '../repositories/AlertsRepository';
import { apiFetch } from '../services/api';

/**
 * Sync alerts and recommendations from API to local SQLite
 */
export async function syncAlertsAndRecommendations(fazendaId: string, token: string) {
  try {
    const alertsRepo = new AlertsRepository(db);
    const recsRepo = new RecommendationsRepository(db);

    // Fetch alerts from API
    const alertsResponse = await fetch(`/api/alerts?limite=100`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (alertsResponse.ok) {
      const { data: apiAlerts } = await alertsResponse.json();

      // Merge with local alerts (avoid duplicates)
      const localAlerts = await alertsRepo.findByFazenda(fazendaId);
      const localIds = new Set(localAlerts.map((a) => a.id));

      for (const apiAlert of apiAlerts) {
        if (!localIds.has(apiAlert.id)) {
          await alertsRepo.create({
            fazenda_id: fazendaId,
            tipo: apiAlert.tipo,
            nivel: apiAlert.nivel,
            titulo: apiAlert.titulo,
            descricao: apiAlert.descricao,
            data: apiAlert.data,
            lida: apiAlert.lida,
            arquivada: apiAlert.arquivada,
            created_at: apiAlert.created_at,
          });
        } else {
          // Update read status if changed
          const local = localAlerts.find((a) => a.id === apiAlert.id);
          if (local && local.lida !== apiAlert.lida) {
            await alertsRepo.markAsRead(apiAlert.id);
          }
        }
      }
    }

    // Fetch recommendations from API
    const recsResponse = await fetch(`/api/recommendations?limite=100`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (recsResponse.ok) {
      const { data: apiRecs } = await recsResponse.json();

      // Merge with local recommendations
      const localRecs = await recsRepo.findByFazenda(fazendaId);
      const localIds = new Set(localRecs.map((r) => r.id));

      for (const apiRec of apiRecs) {
        if (!localIds.has(apiRec.id)) {
          await recsRepo.create({
            fazenda_id: fazendaId,
            prioridade: apiRec.prioridade,
            titulo: apiRec.titulo,
            descricao: apiRec.descricao,
            impacto: apiRec.impacto,
            sugestao: apiRec.sugestao,
            analiseIA: apiRec.analiseIA,
            payload: apiRec.payload,
          });
        } else {
          // Update status if changed
          const local = localRecs.find((r) => r.id === apiRec.id);
          if (local && local.status !== apiRec.status) {
            await recsRepo.updateStatus(apiRec.id, apiRec.status);
          }
        }
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to sync alerts and recommendations:', error);
    return { success: false, error };
  }
}

/**
 * Push local unsynced alerts and recommendations to API
 */
export async function pushAlertsAndRecommendations(token: string) {
  try {
    const alertsRepo = new AlertsRepository(db);
    const recsRepo = new RecommendationsRepository(db);

    // Push unsynced alerts
    const unsyncedAlerts = await alertsRepo.findUnsynced();
    for (const alert of unsyncedAlerts) {
      try {
        const response = await fetch('/api/alerts', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(alert),
        });

        if (response.ok) {
          await alertsRepo.markSynced(alert.id);
        }
      } catch (error) {
        console.error(`Failed to push alert ${alert.id}:`, error);
      }
    }

    // Push unsynced recommendations
    const unsyncedRecs = await recsRepo.findUnsynced();
    for (const rec of unsyncedRecs) {
      try {
        const response = await fetch(`/api/recommendations/${rec.id}`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: rec.status }),
        });

        if (response.ok) {
          await recsRepo.markSynced(rec.id);
        }
      } catch (error) {
        console.error(`Failed to push recommendation ${rec.id}:`, error);
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to push alerts and recommendations:', error);
    return { success: false, error };
  }
}
