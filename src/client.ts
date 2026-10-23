import type { ClientContext } from './contracts';
import { tokens } from './theme';
import { registerSidebar } from './sidebar';
import { registerChatLeaves } from './chat';
import { registerComposer } from './composer';
import { registerDashboard } from './dashboard';
import { RadiusStyles } from './radius';

export const inject = ['slots', 'theme', 'locale', 'layout', 'uiWorkspace', 'shortcuts', 'modelDirectories', 'sessions', 'remote.session'];
export function apply(ctx: ClientContext) {
  const scalableTokens = Object.fromEntries(Object.entries(tokens).map(([name, value]) => [name,
    name.startsWith('--dsw-radius-')
      ? { light:`calc(${value.light} * var(--dlu-radius-scale, 1))`, dark:`calc(${value.dark} * var(--dlu-radius-scale, 1))` }
      : value,
  ]));
  ctx.effect(() => ctx.theme.overrideTokens('dsh-pretty-cool', scalableTokens), 'linear-ui: theme');
  ctx.slots.inject('shell.overlay', () => ctx.slots.register({ name:'shell.overlay', id:'linear-ui.radius-styles' }, RadiusStyles));
  registerSidebar(ctx);
  registerChatLeaves(ctx);
  registerComposer(ctx);
  registerDashboard(ctx);
}
