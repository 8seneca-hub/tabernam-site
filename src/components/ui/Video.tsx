'use client';

import { useState, type ReactNode } from 'react';

interface Props {
  videoUrl?: string;
  thumbnail?: string;
  className?: string;
  children?: ReactNode;
  title?: string;
}

function getYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === 'youtu.be') return u.pathname.slice(1) || null;
    if (u.hostname.endsWith('youtube.com')) {
      const v = u.searchParams.get('v');
      if (v) return v;
      const parts = u.pathname.split('/').filter(Boolean);
      const embedIdx = parts.indexOf('embed');
      if (embedIdx !== -1 && parts[embedIdx + 1]) return parts[embedIdx + 1];
    }
  } catch {
    // fall through
  }
  return null;
}

export default function Video({
  videoUrl,
  thumbnail,
  className = '',
  children,
  title = 'Video',
}: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoId = videoUrl ? getYouTubeId(videoUrl) : null;
  const thumbnailSrc =
    thumbnail || (videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null);

  if (isPlaying && videoId) {
    return (
      <div className={`relative overflow-hidden ${className}`.trim()}>
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => videoId && setIsPlaying(true)}
      disabled={!videoId}
      aria-label={`Play ${title}`}
      className={`relative block w-full cursor-pointer group disabled:cursor-default text-left p-0 border-0 bg-transparent overflow-hidden ${className}`.trim()}
    >
      {thumbnailSrc && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumbnailSrc}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      {children}
    </button>
  );
}
