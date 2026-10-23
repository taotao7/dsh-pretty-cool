import React, { useSyncExternalStore } from 'react';

export const DEFAULT_RADIUS = 6;
export const MAX_RADIUS = 16;
const STORAGE_KEY = 'dsh-pretty-cool:corner-radius';
export function normalizeRadius(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.min(MAX_RADIUS, Math.max(0, Math.round(value))) : DEFAULT_RADIUS;
}
function readStoredRadius(): number {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw === null || raw.trim() === '' ? DEFAULT_RADIUS : normalizeRadius(Number(raw));
  } catch { return DEFAULT_RADIUS; }
}
let radius = readStoredRadius();
const listeners = new Set<() => void>();
function publish(next: number) {
  if (radius === next) return;
  radius = next;
  for (const listener of listeners) listener();
}
function storageChanged(event: StorageEvent) {
  if (event.key === STORAGE_KEY || event.key === null) publish(readStoredRadius());
}
function subscribe(listener: () => void) {
  if (listeners.size === 0) {
    radius = readStoredRadius();
    window.addEventListener('storage', storageChanged);
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener('storage', storageChanged);
  };
}
export function setRadius(value: number) {
  const next = normalizeRadius(value);
  try { window.localStorage.setItem(STORAGE_KEY, String(next)); } catch { /* Session-local adjustment still works. */ }
  publish(next);
}
export function useRadius() {
  return useSyncExternalStore(subscribe, () => radius, () => DEFAULT_RADIUS);
}
export function RadiusStyles() {
  const value = useRadius();
  return <style>{`:root { --dlu-radius-scale: ${value / DEFAULT_RADIUS}; }`}</style>;
}
