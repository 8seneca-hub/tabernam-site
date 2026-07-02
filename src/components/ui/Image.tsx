import type { ImgHTMLAttributes } from 'react';
import { captureMediaError } from '@/lib/capture-media-error';

interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'loading'> {
  src: string;
  alt: string;
  /** Eager-load with high fetch priority (defaults to lazy + auto priority). */
  priority?: boolean;
  /** Report load failures to PostHog Error Tracking (opt-in to avoid noise). */
  trackErrors?: boolean;
  /** Label for where the image lives, attached to the reported issue. */
  errorSurface?: string;
}

export default function Image({
  src,
  alt,
  priority = false,
  trackErrors = false,
  errorSurface,
  onError,
  ...rest
}: ImageProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      onError={(e) => {
        if (trackErrors) captureMediaError('image', { src, surface: errorSurface });
        onError?.(e);
      }}
      {...rest}
    />
  );
}
