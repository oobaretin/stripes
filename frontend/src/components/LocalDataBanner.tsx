import { useState } from 'react';
import { HardDrive, X } from 'lucide-react';

const DISMISS_KEY = 'striply_local_data_notice_dismissed';

export default function LocalDataBanner() {
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISS_KEY) === '1');

  if (dismissed) return null;

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-2.5 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl items-start gap-3">
        <HardDrive className="h-5 w-5 shrink-0 text-amber-700 mt-0.5" aria-hidden />
        <p className="flex-1 text-sm text-amber-950">
          <span className="font-medium">Saved in this browser only.</span> Your catalog, buyers, purchases, and sales stay on
          this device until you export a backup from Profile or clear site data.
        </p>
        <button
          type="button"
          onClick={() => {
            localStorage.setItem(DISMISS_KEY, '1');
            setDismissed(true);
          }}
          className="shrink-0 rounded p-1 text-amber-800 hover:bg-amber-100"
          aria-label="Dismiss notice"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
