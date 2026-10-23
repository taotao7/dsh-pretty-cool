import type { ClientContext } from './contracts';
import { tokens } from './theme';
import { registerSidebar } from './sidebar';
import { registerChatLeaves } from './chat';
import { registerComposer } from './composer';
import { registerDashboard } from './dashboard';

export const inject = ['slots', 'theme', 'locale', 'layout', 'uiWorkspace', 'shortcuts', 'modelDirectories', 'sessions', 'remote.session'];
export function apply(ctx: ClientContext) {
  ctx.effect(() => ctx.theme.overrideTokens('@local/dsh-linear-ui', tokens), 'linear-ui: theme');
  registerSidebar(ctx);
  registerChatLeaves(ctx);
  registerComposer(ctx);
  registerDashboard(ctx);
}
