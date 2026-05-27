'use client';

import { AnimatePresence, motion } from 'motion/react';

interface Props {
  visible: boolean;
  text: string;
}

export default function DancingText({ visible, text }: Props) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="dancing-text"
          className="absolute top-[20%] left-1/2 -translate-x-1/2 flex flex-wrap justify-center text-lg md:text-xl font-medium text-text max-w-[80%] whitespace-pre pointer-events-none z-[4]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          aria-hidden="true"
        >
          {text.split('').map((char, i) => (
            <motion.span
              key={i}
              className="inline-block"
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 1.4,
                delay: i * 0.05,
                ease: 'easeInOut',
                repeat: Infinity,
              }}
            >
              {char === ' ' ? ' ' : char}
            </motion.span>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
