'use client';

import { motion } from 'motion/react';
import { useI18n } from '@/app/hook/useI18n';

interface Props {
  isOpen: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export default function ZoomControls({ isOpen, onZoomIn, onZoomOut }: Props) {
  const { t } = useI18n();
  return (
    <motion.div
      className="fixed top-1/2 left-7 -translate-y-1/2 z-[200] flex flex-col bg-bg rounded-2 shadow-[0_2px_10px_rgba(0,0,0,0.18)] overflow-hidden"
      animate={{ opacity: isOpen ? 1 : 0 }}
      transition={{ duration: 0.45, ease: 'easeOut', delay: isOpen ? 0.3 : 0 }}
      style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        aria-label={t('globe.zoom.in')}
        onClick={onZoomIn}
        className="w-[38px] h-[38px] flex items-center justify-center text-text transition-colors duration-200 hover:bg-black/[0.06] cursor-pointer"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-4 h-4">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
      <button
        type="button"
        aria-label={t('globe.zoom.out')}
        onClick={onZoomOut}
        className="w-[38px] h-[38px] flex items-center justify-center text-text transition-colors duration-200 hover:bg-black/[0.06] cursor-pointer border-t border-border"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-4 h-4">
          <path d="M5 12h14" />
        </svg>
      </button>
    </motion.div>
  );
}
