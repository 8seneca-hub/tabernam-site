'use client';

export interface EntryRowProps {
  title: string;
  org?: string;
  date: string;
  desc?: string;
}

export default function EntryRow({ title, org, date, desc }: EntryRowProps) {
  return (
    <div className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-1 items-baseline max-md:grid-cols-1">
      <div className="min-w-0">
        <h3 className="text-base font-semibold text-text">{title}</h3>
        {org && <p className="text-sm text-muted mt-0.5 leading-relaxed">{org}</p>}
      </div>
      <p className="text-sm italic text-muted whitespace-nowrap max-md:text-xs">{date}</p>
      {desc && (
        <p className="col-span-full text-sm text-text/85 leading-relaxed mt-2">
          <span className="text-brand mr-2" aria-hidden>●</span>{desc}
        </p>
      )}
    </div>
  );
}
