'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Image from './Image';
import { captureMediaError } from '@/lib/capture-media-error';

interface Props {
  videoUrl?: string;
  chinaUrl?: string;
  useChina?: boolean;
  thumbnail?: string;
  className?: string;
  children?: ReactNode;
  title?: string;
}

function getYouTubeId(url: string): string | null {
  if (!url) return null;
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

function getBilibiliId(url: string): string | null {
  if (!url) return null;
  const withScheme = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  try {
    const u = new URL(withScheme);
    if (!/(^|\.)bilibili\.com$/.test(u.hostname) && u.hostname !== 'b23.tv') return null;
    const parts = u.pathname.split('/').filter(Boolean);
    const videoIdx = parts.indexOf('video');
    if (videoIdx !== -1 && parts[videoIdx + 1]) return parts[videoIdx + 1];
    if (parts[0] && /^BV[\w]+$/i.test(parts[0])) return parts[0];
  } catch {
    // fall through
  }
  return null;
}

export default function Video({
  videoUrl,
  chinaUrl,
  useChina = false,
  thumbnail,
  className = '',
  children,
  title = 'Video',
}: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse), (max-width: 768px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const activeUrl = useChina && chinaUrl ? chinaUrl : videoUrl;
  const bilibiliId = activeUrl ? getBilibiliId(activeUrl) : null;
  const youtubeId = activeUrl && !bilibiliId ? getYouTubeId(activeUrl) : null;

  const initialSrc = thumbnail
    ? thumbnail
    : youtubeId
    ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
    : null;
  const [thumbnailSrc, setThumbnailSrc] = useState<string | null>(initialSrc);

  // A China visitor served a YouTube embed will hit a hard block (YouTube is
  // unreachable in China). If we land here it means no chinaUrl fallback was
  // configured — report it so it surfaces (and can be filtered to CN) in
  // PostHog Error Tracking, since a blocked iframe fires no useful onerror.
  useEffect(() => {
    if (useChina && youtubeId) {
      captureMediaError('youtube-iframe', {
        src: activeUrl,
        useChina,
        title,
        reason: 'youtube-served-to-china-visitor-without-fallback',
      });
    }
  }, [useChina, youtubeId, activeUrl, title]);

  useEffect(() => {
    if (thumbnail || !youtubeId) return;
    const maxUrl = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
    const probe = new window.Image();
    probe.onload = () => {
      if (probe.naturalWidth >= 200) setThumbnailSrc(maxUrl);
    };
    probe.src = maxUrl;
    return () => {
      probe.onload = null;
    };
  }, [thumbnail, youtubeId]);

  if (activeUrl && !youtubeId && !bilibiliId) {
    return (
      <div className={`relative overflow-hidden bg-black ${className}`.trim()}>
        <video
          src={activeUrl}
          controls
          playsInline
          poster={thumbnail}
          onError={() => captureMediaError('video', { src: activeUrl, useChina, title })}
          className="absolute inset-0 w-full h-full object-contain"
        >
          <track kind="captions" />
        </video>
      </div>
    );
  }

  if (isPlaying && youtubeId) {
    return (
      <div className={`relative overflow-hidden ${className}`.trim()}>
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  if (isPlaying && bilibiliId) {
    const bilibiliSrc = isMobile
      ? `https://www.bilibili.com/blackboard/html5mobileplayer.html?bvid=${bilibiliId}&autoplay=1&danmaku=0&high_quality=1&quality=80&as_wide=1&hideCoverInfo=1`
      : `https://player.bilibili.com/player.html?bvid=${bilibiliId}&autoplay=1&danmaku=0&high_quality=1`;
    return (
      <div className={`relative overflow-hidden ${className}`.trim()}>
        <iframe
          className="absolute inset-0 w-full h-full"
          src={bilibiliSrc}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  const playable = !!(youtubeId || bilibiliId);
  return (
    <button
      type="button"
      onClick={() => playable && setIsPlaying(true)}
      disabled={!playable}
      aria-label={`Play ${title}`}
      className={`relative block w-full cursor-pointer group disabled:cursor-default text-left p-0 border-0 bg-transparent overflow-hidden ${className}`.trim()}
    >
      {thumbnailSrc ? (
        <Image
          src={thumbnailSrc}
          alt=""
          trackErrors
          errorSurface="video-thumbnail"
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gray-900" />
      )}
      {children}
    </button>
  );
}
