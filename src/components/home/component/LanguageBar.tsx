'use client';

export interface LanguageBarProps {
  name: string;
  level: string;
  descriptor: string;
  bars: number;
  total?: number;
}

export default function LanguageBar({ name, level, descriptor, bars, total = 5 }: LanguageBarProps) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-base font-semibold text-text">{name}</span>
        <span className="text-sm text-muted">{level}</span>
      </div>
      <div className="flex gap-1.5" role="img" aria-label={`${name}: ${descriptor}`}>
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={`h-2 flex-1 rounded-sm ${i < bars ? 'bg-brand' : 'bg-border'}`}
          />
        ))}
      </div>
      <p className="text-xs text-muted mt-1.5">{descriptor}</p>
    </div>
  );
}
