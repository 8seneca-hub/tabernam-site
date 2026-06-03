import type { ReactNode } from 'react';

interface Props {
  icon: ReactNode;
  label: ReactNode;
  value: ReactNode;
  href?: string;
  className?: string;
}

const BASE = 'flex items-center gap-4 rounded-3 border border-border bg-brand/6 px-4 py-3';
const HOVER = 'hover:border-brand hover:bg-brand/5 transition-colors';

export default function Card({ icon, label, value, href, className = '' }: Props) {
  const inner = (
    <>
      <span className="w-10 h-10 rounded-2 bg-brand/10 text-brand flex items-center justify-center shrink-0">
        {icon}
      </span>
      <span className="flex flex-col">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-muted">
          {label}
        </span>
        <span className="text-base font-medium text-text break-all">
          {value}
        </span>
      </span>
    </>
  );

  if (href) {
    return (
      <a href={href} className={`${BASE} ${HOVER} ${className}`.trim()}>
        {inner}
      </a>
    );
  }

  return <div className={`${BASE} ${className}`.trim()}>{inner}</div>;
}
