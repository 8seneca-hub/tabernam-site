'use client';

import { useRouter, usePathname } from 'next/navigation';
import { type ReactNode, useCallback } from 'react';

export default function ActivityLink({
  children,
  className,
  onClick: onClickProp,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const scrollToActivity = useCallback(() => {
    const el = document.getElementById('activity');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      // Update URL without hash using replaceState
      window.history.replaceState(null, '', pathname);
    }
  }, [pathname]);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      onClickProp?.();

      if (pathname === '/') {
        scrollToActivity();
      } else {
        router.push('/');
        // Wait for navigation, then scroll
        const check = () => {
          const el = document.getElementById('activity');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          } else {
            requestAnimationFrame(check);
          }
        };
        requestAnimationFrame(check);
      }
    },
    [pathname, router, scrollToActivity, onClickProp],
  );

  return (
    <a href="/" className={className} onClick={handleClick}>
      {children}
    </a>
  );
}
