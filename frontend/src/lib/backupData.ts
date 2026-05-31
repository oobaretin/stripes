import { SK } from './localData';

const EXTRA_KEYS = ['striply_profit_margin', 'striply_selected_buyer_ids'] as const;

export function exportAllData(): string {
  const data: Record<string, unknown> = {};
  for (const key of Object.values(SK)) {
    const raw = localStorage.getItem(key);
    if (raw != null) data[key] = JSON.parse(raw);
  }
  for (const key of EXTRA_KEYS) {
    const raw = localStorage.getItem(key);
    if (raw != null) {
      try {
        data[key] = JSON.parse(raw);
      } catch {
        data[key] = raw;
      }
    }
  }
  return JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), data }, null, 2);
}

export function downloadBackup() {
  const blob = new Blob([exportAllData()], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `striply-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importAllData(json: string): { ok: true } | { ok: false; error: string } {
  try {
    const parsed = JSON.parse(json) as { data?: Record<string, unknown> };
    if (!parsed.data || typeof parsed.data !== 'object') {
      return { ok: false, error: 'Invalid backup file format.' };
    }
    for (const [key, value] of Object.entries(parsed.data)) {
      localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
    }
    return { ok: true };
  } catch {
    return { ok: false, error: 'Could not read backup file.' };
  }
}
