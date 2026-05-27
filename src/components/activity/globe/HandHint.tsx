'use client';

import { AnimatePresence, motion } from 'motion/react';

interface Props {
  visible: boolean;
}

export default function HandHint({ visible }: Props) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="hand-hint"
          className="absolute inset-0 pointer-events-none z-[3]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          aria-hidden="true"
        >
          <motion.img
            src="/hand-hint.png"
            alt=""
            className="absolute top-[62%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] object-contain [filter:drop-shadow(0_4px_12px_rgba(0,0,0,0.4))]"
            animate={{
              x: [-50, -30, 30, 60],
              rotate: [-12, -10, 0, 8],
              opacity: [1, 1, 1, 0],
            }}
            transition={{
              duration: 2,
              times: [0, 0.4, 0.85, 1],
              ease: 'easeInOut',
              repeat: Infinity,
              repeatDelay: 0.5,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
