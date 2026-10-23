"use client";

import React, { useSyncExternalStore } from 'react';
import { motion, MotionConfig, type HTMLMotionProps } from 'motion/react';

export const ease = [0.2, 0, 0, 1] as const;
const media = () => window.matchMedia('(prefers-reduced-motion: reduce)');
const reducedSnapshot = () => media().matches;
const subscribeReduced = (notify: () => void) => {
  const query = media();
  query.addEventListener('change', notify);
  return () => query.removeEventListener('change', notify);
};
/** ReactBits interaction durations; reactive to OS preference changes. */
export function useCalmMotion() {
  return useSyncExternalStore(subscribeReduced, reducedSnapshot, () => true);
}
export function MotionBoundary({ children }: { children: React.ReactNode }) {
  const reduced = useCalmMotion();
  return <MotionConfig reducedMotion={reduced ? 'always' : 'never'} transition={{ duration: reduced ? 0 : 0.16, ease }}>{children}</MotionConfig>;
}
/** Adapted from ReactBits AppShell1 / PromptInput1 ghost and secondary controls. */
export const Button = React.forwardRef<HTMLButtonElement, HTMLMotionProps<'button'>>(function Button({ className = '', children, ...props }, ref) {
  const reduced = useCalmMotion();
  return <motion.button ref={ref} type="button" className={`dlu-button ${className}`} whileTap={reduced ? undefined : { scale: 0.975 }} transition={{ duration: reduced ? 0 : 0.12, ease }} {...props}>{children}</motion.button>;
});
export function Icon({ name, size = 16 }: { name: 'plus' | 'panel' | 'mark' | 'light' | 'dark' | 'system'; size?: number }) {
  const paths = {
    plus:<path d="M12 5v14M5 12h14" />,
    panel:<><rect x="3" y="4" width="18" height="16" rx="3" /><path d="M9 4v16" /></>,
    mark:<><rect x="3" y="3" width="18" height="18" rx="5" /><path d="M8 8v8h8M12 8h4" /></>,
    light:<><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></>,
    dark:<path d="M20.5 13.2A8.5 8.5 0 0 1 10.8 3.5 8.5 8.5 0 1 0 20.5 13.2Z"/>,
    system:<><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8m-4-4v4"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
