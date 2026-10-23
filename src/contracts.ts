import type { ComponentType, ReactNode } from 'react';

/** Narrow public contracts verified against DSH 0.2.1-rc.2 Inspect + declarations. */
export type Dispose = () => void;
export type Selector<S> = <T>(select: (snapshot: S) => T) => T;
export interface Observable<S> { getSnapshot(): S; subscribe(listener: () => void): Dispose }
export interface Panel { id: string; order: number; label: string }
export interface Shortcut { id: string; keys: readonly string[]; aria?: string }
export interface ThemeSnapshot { preference: 'light' | 'dark' | 'system'; active: { colorScheme: 'light' | 'dark' }; fontSizes: Readonly<Record<string, number>> }
export type RenderSlot = (name: string, props: object, options?: { only?: string; fallback?: ReactNode }) => ReactNode;
export type RenderFactory = (name: string, props: object) => ReactNode;
export interface SidebarProps {
  collapsed: boolean;
  width: number;
  renderSlot: RenderSlot;
  t: (key: string) => string;
  startSession(): void;
  toggleSidebar(): void;
  selectPanel(id: string | null): void;
  setTheme(id: 'light' | 'dark' | 'system'): void;
  setTextSize(px: number): void;
  useTheme: Selector<ThemeSnapshot>;
  usePanels: Selector<readonly Panel[]>;
  useShortcuts: Selector<readonly Shortcut[]>;
  usePanelInfo: Selector<{ activePanelId: string | null }>;
}
export interface SlotOptions {
  name: string;
  key?: string;
  id?: string;
  order?: number;
  priority?: number;
  locale?: string;
  children?: Record<string, {kind: 'single' | 'list'; scope: 'root'}>;
  inject?: (sessionId: string) => object;
}
export interface ClientContext {
  modelDirectories: import('./composer-model').ModelDirectories;
  sessions: { subagentAddress(sessionId: string): unknown | undefined };
  effect(effect: () => Dispose, label?: string): Dispose;
  on(name: 'theme/change', listener: () => void): Dispose;
  theme: {
    overrideTokens(source: string, values: Record<string, { light: string; dark: string }>): Dispose;
    getTheme(): ThemeSnapshot;
    setTheme(id: string): void;
    setFontSize(role: string, px: number): void;
  };
  slots: {
    inject(name: string, effect: () => Dispose): Dispose;
    register<P>(options: SlotOptions, component: ComponentType<P>): Dispose;
    entriesOfSlot(name: string): readonly { options: { id?: string; order?: number; label?: string | (() => string) } }[];
    subscribe(name: string, fn: () => void): Dispose;
  };
  locale: { register(ns: string, dict: Record<string, Record<string, string>>): Dispose; subscribe(fn: () => void): Dispose };
  layout: { toggleSidebar(): void; selectPanel(id: string | null): void };
  uiWorkspace: { startSession(workspaceId?: string): void };
  shortcuts: { catalog: Observable<readonly Shortcut[]> };
}
