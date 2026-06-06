import { useCallback, useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { AlertsRepository, RecommendationsRepository } from '../repositories/AlertsRepository';
import type { Alert, Recommendation } from '../types';

export function useAlerts(fazendaId: string) {
  const db = useSQLiteContext();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const repo = new AlertsRepository(db);

  const loadAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await repo.findByFazenda(fazendaId);
      setAlerts(data);
      const unread = data.filter((a) => !a.lida).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Failed to load alerts:', error);
    } finally {
      setLoading(false);
    }
  }, [fazendaId]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await repo.markAsRead(id);
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, lida: true } : a))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark alert as read:', error);
    }
  }, []);

  const markAsArchived = useCallback(async (id: string) => {
    try {
      await repo.markAsArchived(id);
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    } catch (error) {
      console.error('Failed to archive alert:', error);
    }
  }, []);

  useEffect(() => {
    loadAlerts();
    const interval = setInterval(loadAlerts, 10000); // Refresh every 10s

    return () => clearInterval(interval);
  }, [loadAlerts]);

  return {
    alerts,
    unreadCount,
    loading,
    loadAlerts,
    markAsRead,
    markAsArchived,
  };
}

export function useRecommendations(fazendaId: string) {
  const db = useSQLiteContext();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [criticalCount, setCriticalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const repo = new RecommendationsRepository(db);

  const loadRecommendations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await repo.findByFazenda(fazendaId);
      setRecommendations(data);
      const critical = data.filter((r) => r.prioridade === 1 && !r.acknowledged).length;
      setCriticalCount(critical);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setLoading(false);
    }
  }, [fazendaId]);

  const acknowledge = useCallback(async (id: string) => {
    try {
      await repo.acknowledge(id);
      setRecommendations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, acknowledged: true } : r))
      );
      setCriticalCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to acknowledge recommendation:', error);
    }
  }, []);

  useEffect(() => {
    loadRecommendations();
    const interval = setInterval(loadRecommendations, 15000); // Refresh every 15s

    return () => clearInterval(interval);
  }, [loadRecommendations]);

  return {
    recommendations,
    criticalCount,
    loading,
    loadRecommendations,
    acknowledge,
  };
}
