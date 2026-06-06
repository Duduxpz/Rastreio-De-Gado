import { useEffect, useRef, useState } from 'react';
import queue from '../sync/queue';

export function useSync({ intervalMs = 30000 }: { intervalMs?: number } = {}) {
  const [running, setRunning] = useState(false);
  const [lastRun, setLastRun] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);

  async function processNow() {
    setRunning(true);
    try {
      await queue.processQueue();
      setLastRun(new Date().toISOString());
    } catch (err) {
      console.warn('Sync process failed', err);
    } finally {
      setRunning(false);
    }
  }

  useEffect(() => {
    // start interval
    processNow();
    intervalRef.current = setInterval(() => {
      processNow();
    }, intervalMs) as unknown as number;

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current as unknown as number);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs]);

  return { running, lastRun, processNow } as const;
}

export default useSync;
