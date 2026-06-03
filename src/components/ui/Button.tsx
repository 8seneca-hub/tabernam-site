'use client';

import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';

type Variant = 'primary' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';
type Shape = 'rounded' | 'pill';

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: 'bg-brand text-white hover:bg-brand/90',
  outline: 'bg-white/10 backdrop-blur-sm border border-border text-text hover:bg-white/50 hover:border-gray-80',
  ghost: 'bg-transparent text-text hover:bg-surface/60',
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm gap-1.5',
  md: 'px-6 py-3 text-base gap-2',
  lg: 'px-10 py-5 text-xl gap-2.5',
};

const SHAPE_CLASSES: Record<Shape, string> = {
  rounded: 'rounded-2',
  pill: 'rounded-full',
};

const BASE_CLASSES =
  'inline-flex items-center justify-center font-medium border-0 cursor-pointer transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-brand/40 disabled:opacity-50 disabled:cursor-not-allowed';

interface OwnProps<E extends ElementType> {
  as?: E;
  variant?: Variant;
  size?: Size;
  shape?: Shape;
  icon?: ReactNode;
  iconLeft?: ReactNode;
  children?: ReactNode;
  className?: string;
}

type Props<E extends ElementType> = OwnProps<E> &
  Omit<ComponentPropsWithoutRef<E>, keyof OwnProps<E>>;

export default function Button<E extends ElementType = 'button'>({
  as,
  variant = 'primary',
  size = 'md',
  shape = 'rounded',
  icon,
  iconLeft,
  className,
  children,
  ...rest
}: Props<E>) {
  const Component = (as || 'button') as ElementType;
  const classes = [
    BASE_CLASSES,
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    SHAPE_CLASSES[shape],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const typeProp = Component === 'button' && !('type' in rest) ? { type: 'button' as const } : null;

  return (
    <Component className={classes} {...typeProp} {...rest}>
      {iconLeft && <span aria-hidden>{iconLeft}</span>}
      {children}
      {icon && <span aria-hidden>{icon}</span>}
    </Component>
  );
}
