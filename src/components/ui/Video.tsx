'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Image from './Image';
import { captureMediaError } from '@/lib/capture-media-error';
import { useI18n } from '@/app/hook/useI18n';

interface Props {
  videoUrl?: string;
  chinaUrl?: string;
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
  thumbnail,
  className = '',
  children,
  title = 'Video',
}: Props) {
  const { lang } = useI18n();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  // Flips to true when the primary YouTube source looks unreachable (e.g. a
  // mainland-China visitor behind the Great Firewall). Once set, the active
  // source switches to the Bilibili `chinaUrl` so the video still plays.
  const [fallbackToChina, setFallbackToChina] = useState(false);
  // Set when no source works at all — a native <video> load error, or a
  // YouTube-only video that turns out to be blocked with no chinaUrl fallback.
  // When true, the whole container is hidden rather than showing a broken box.
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse), (max-width: 768px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  // Chinese-language visitors get the Bilibili `chinaUrl` up front — they've
  // explicitly chosen zh, YouTube is blocked in mainland China, and Bilibili is
  // the native platform. Everyone else defaults to the primary YouTube URL and
  // only switches to `chinaUrl` if the reachability probe below finds YouTube
  // blocked. A video with only a chinaUrl falls straight through to it either way.
  const preferChina = lang.toLowerCase() === 'zh';
  const wantChina = preferChina || fallbackToChina;
  const activeUrl = wantChina && chinaUrl ? chinaUrl : videoUrl || chinaUrl;
  const bilibiliId = activeUrl ? getBilibiliId(activeUrl) : null;
  const youtubeId = activeUrl && !bilibiliId ? getYouTubeId(activeUrl) : null;
  // YouTube id of the *primary* source (before any fallback) — used to probe
  // whether YouTube is actually reachable from this browser.
  const primaryYouTubeId = videoUrl ? getYouTubeId(videoUrl) : null;

  const initialSrc = thumbnail
    ? thumbnail
    : youtubeId
    ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
    : null;
  const [thumbnailSrc, setThumbnailSrc] = useState<string | null>(initialSrc);

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

  // Probe whether YouTube is actually reachable from this browser. YouTube's
  // thumbnail host (img.youtube.com) sits behind the same Great Firewall that
  // blocks the embed, so a failed or timed-out thumbnail load is a reliable
  // signal that the YouTube iframe would render blank (a blocked iframe fires no
  // onerror of its own, so this image probe is the only workable client signal).
  // If YouTube is unreachable we switch to the Bilibili `chinaUrl` when one
  // exists, otherwise we hide the container — there's nothing playable to show.
  useEffect(() => {
    if (wantChina) return; // already serving the china source (zh visitor or prior fallback)
    if (!primaryYouTubeId) return; // primary isn't YouTube; native/bilibili failures handled elsewhere

    const YT_PROBE_TIMEOUT_MS = 3000;
    let settled = false;
    const probe = new window.Image();

    const onUnreachable = () => {
      if (settled) return;
      settled = true;
      if (chinaUrl) {
        // A Bilibili alternative exists — switch to it.
        setFallbackToChina(true);
        if (!thumbnail) setThumbnailSrc(null); // drop the (blocked) YouTube thumbnail
        captureMediaError('youtube-iframe', {
          src: videoUrl,
          useChina: true,
          title,
          reason: 'youtube-unreachable-auto-fallback-to-china',
        });
      } else {
        // No alternative source — hide the container instead of a blank embed.
        setHidden(true);
        captureMediaError('youtube-iframe', {
          src: videoUrl,
          title,
          reason: 'youtube-unreachable-no-fallback-hidden',
        });
      }
    };

    const timer = setTimeout(onUnreachable, YT_PROBE_TIMEOUT_MS);
    probe.onload = () => {
      settled = true;
      clearTimeout(timer);
    };
    probe.onerror = onUnreachable;
    probe.src = `https://img.youtube.com/vi/${primaryYouTubeId}/hqdefault.jpg`;

    return () => {
      settled = true;
      clearTimeout(timer);
      probe.onload = probe.onerror = null;
    };
  }, [wantChina, primaryYouTubeId, chinaUrl, videoUrl, title, thumbnail]);

  // No working source — render nothing (hide the container) rather than a broken
  // or empty box. `!activeUrl` also covers a video that was given no URLs at all.
  if (hidden || !activeUrl) return null;

  if (activeUrl && !youtubeId && !bilibiliId) {
    return (
      <div className={`relative overflow-hidden bg-black ${className}`.trim()}>
        <video
          src={activeUrl}
          controls
          playsInline
          poster={thumbnail}
          onError={() => {
            captureMediaError('video', { src: activeUrl, title });
            setHidden(true);
          }}
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
