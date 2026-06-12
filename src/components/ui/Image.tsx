import type { ImgHTMLAttributes } from 'react';

interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'loading'> {
  src: string;
  alt: string;
  /** Eager-load with high fetch priority (defaults to lazy + auto priority). */
  priority?: boolean;
}

export default function Image({ src, alt, priority = false, ...rest }: ImageProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      {...rest}
    />
  );
}
