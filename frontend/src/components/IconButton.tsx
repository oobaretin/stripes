import type { ReactNode } from 'react';

type IconButtonProps = {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'danger';
  children: ReactNode;
};

export default function IconButton({ label, onClick, variant = 'default', children }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`icon-btn ${variant === 'danger' ? 'icon-btn-danger' : 'icon-btn-default'}`}
    >
      {children}
    </button>
  );
}
