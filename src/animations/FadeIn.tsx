'use client';

import { motion, type Variants } from 'motion/react';
import type { ReactNode } from 'react';

const variants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

interface Props {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  as?: keyof typeof motion;
}

export default function FadeIn({
  children,
  className,
  delay = 0,
  duration = 0.7,
  as = 'div',
}: Props) {
  const Component = motion[as] as typeof motion.div;

  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={variants}
      transition={{
        delay,
        duration,
        ease: [0.22, 0.61, 0.36, 1] as const,
      }}
    >
      {children}
    </Component>
  );
}
