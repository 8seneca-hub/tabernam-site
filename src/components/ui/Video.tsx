'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Image from './Image';

interface Props {
  videoUrl?: string;
  thumbnail?: string;
  className?: string;
  children?: ReactNode;
  title?: string;
}

function getYouTubeId(url: string): string | null {
  if (!url) return null;
  // The URL constructor requires a scheme. Editors often paste
  // `youtube.com/watch?v=...` or `www.youtube.com/...` without one, so
  // assume https:// when missing instead of throwing.
  const withScheme = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  try {
    const u = new URL(withScheme);
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

  const initialSrc = thumbnail
    ? thumbnail
    : videoId
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : null;
  const [thumbnailSrc, setThumbnailSrc] = useState<string | null>(initialSrc);

  useEffect(() => {
    if (thumbnail || !videoId) return;
    const maxUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    const probe = new window.Image();
    probe.onload = () => {
      if (probe.naturalWidth >= 200) setThumbnailSrc(maxUrl);
    };
    probe.src = maxUrl;
    return () => {
      probe.onload = null;
    };
  }, [thumbnail, videoId]);

  if (videoUrl && !videoId) {
    return (
      <div className={`relative overflow-hidden bg-black ${className}`.trim()}>
        <video
          src={videoUrl}
          controls
          playsInline
          poster={thumbnail}
          className="absolute inset-0 w-full h-full object-contain"
        >
          <track kind="captions" />
        </video>
      </div>
    );
  }

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
        <Image
          src={thumbnailSrc}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      {children}
    </button>
  );
}
