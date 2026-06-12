'use client';

import Video from './Video';

interface Props {
  videoUrl?: string;
  title?: string;
  eyebrow?: string;
  // Default: 16:9. Use 'cinema' for the ExperienceStoriesSection hero look.
  aspect?: 'video' | 'cinema';
  // Default: light play button on a soft dim. Use 'brand' for a stronger
  // accent (large brand-coloured circle + heavier black overlay).
  playStyle?: 'light' | 'brand';
  className?: string;
}

function PlayIcon({ size }: { size: 'sm' | 'lg' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={size === 'lg' ? 'w-9 h-9 ml-1' : 'w-7 h-7 ml-0.5'}
    >
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

export default function VideoCard({
  videoUrl,
  title,
  eyebrow,
  aspect = 'video',
  playStyle = 'light',
  className = '',
}: Props) {
  // Both the default and "cinema" variants now lock to 16:9 per spec —
  // the `aspect` prop is kept for backwards-compat with existing call sites.
  const aspectClass = 'aspect-video';
  void aspect;
  const isBrand = playStyle === 'brand';
  const dimClass = isBrand
    ? 'bg-black/30 group-hover:bg-black/20'
    : 'bg-black/10 group-hover:bg-black/0';
  const buttonClass = isBrand
    ? 'w-20 h-20 rounded-full bg-brand text-white shadow-2xl'
    : 'w-16 h-16 rounded-full bg-white/95 text-brand shadow-lg';
  const shadow = isBrand ? 'shadow-lg' : 'shadow-md';

  return (
    <Video
      videoUrl={videoUrl}
      title={title}
      className={`block ${aspectClass} bg-gray-40 ${shadow} overflow-hidden ${className}`.trim()}
    >
      <div className={`absolute inset-0 ${dimClass} transition-colors`} />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={`${buttonClass} flex items-center justify-center transition-transform group-hover:scale-110`}>
          <PlayIcon size={isBrand ? 'lg' : 'sm'} />
        </div>
      </div>
      {(eyebrow || title) && (
        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/60 to-transparent">
          {eyebrow && (
            <span className="block text-xs font-semibold text-white/90 uppercase tracking-[0.2em] mb-2">
              {eyebrow}
            </span>
          )}
          {title && (
            <h3 className="text-2xl md:text-3xl font-semibold text-white leading-tight">
              {title}
            </h3>
          )}
        </div>
      )}
    </Video>
  );
}
