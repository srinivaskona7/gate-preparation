import { CloudDownload, WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/ui/button';
import { ProgressBar } from '@/ui/primitives';

interface OfflineStatus {
  cached: number;
  total: number;
  totalBytes: number;
}

type WorkerMessage =
  | ({ type: 'offline-status' | 'offline-progress' } & OfflineStatus)
  | { type: 'offline-error'; message: string };

const mb = (bytes: number) => `${Math.round(bytes / 1_048_576)} MB`;

/**
 * Offline state from the service worker (public build only). Pages already opened work offline
 * on their own; this saves the rest of the site in one go when the learner asks for it.
 */
export function OfflineCard() {
  const [status, setStatus] = useState<OfflineStatus | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    const sw = navigator.serviceWorker;
    const onMessage = (e: MessageEvent<WorkerMessage>) => {
      const m = e.data;
      if (m.type === 'offline-error') {
        setError(m.message);
        setSaving(false);
        return;
      }
      setStatus({ cached: m.cached, total: m.total, totalBytes: m.totalBytes });
      if (m.type === 'offline-status') setSaving(false);
    };
    sw.addEventListener('message', onMessage);
    sw.ready.then((reg) => reg.active?.postMessage('offline-status'));
    return () => sw.removeEventListener('message', onMessage);
  }, []);

  if (!status) return null;
  const done = status.cached >= status.total;
  const saveAll = () => {
    setSaving(true);
    setError(null);
    navigator.serviceWorker.ready.then((reg) => reg.active?.postMessage('offline-save-all'));
  };

  return (
    <section aria-labelledby="offline-title" className="glass space-y-3 p-5">
      <h2 id="offline-title" className="flex items-center gap-2 text-[15px] font-semibold text-ink">
        <WifiOff className="size-4 text-accent" aria-hidden /> Offline
      </h2>
      <p className="text-[13px] text-muted">
        {done
          ? 'The whole site is saved on this device and works with no connection.'
          : `Pages you open are saved as you go. Save the rest (${mb(status.totalBytes)}) to study with no connection.`}
      </p>
      <ProgressBar value={(status.cached / status.total) * 100} />
      <p className="font-mono text-[11px] text-faint" aria-live="polite">
        {status.cached} of {status.total} files saved
      </p>
      {error && <p className="text-[12px] text-coral">Saving stopped: {error}. Try again when the connection is back.</p>}
      {!done && (
        <Button variant="outline" size="sm" onClick={saveAll} disabled={saving}>
          <CloudDownload /> {saving ? 'Saving…' : 'Save everything for offline'}
        </Button>
      )}
    </section>
  );
}
