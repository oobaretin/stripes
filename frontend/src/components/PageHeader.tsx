import type { ReactNode } from 'react';

type PageHeaderProps = {
  lead?: string;
  description: string;
  actions?: ReactNode;
};

export default function PageHeader({ lead, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        {lead && <p className="text-lg font-semibold text-slate-900">{lead}</p>}
        <p className={`text-sm text-slate-600 max-w-3xl ${lead ? 'mt-1' : ''}`}>{description}</p>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
