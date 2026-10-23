"use client";

import React, { useId } from 'react';
import { LayoutGroup, motion } from 'motion/react';
import { Button, Icon, MotionBoundary, useCalmMotion } from './primitives';
import type { ClientContext, Panel, SidebarProps } from './contracts';
import css from './sidebar.css';

const NS = 'linear-ui';
const dictionaries = {
  en: { 'session.new':'New session', 'toggle.open':'Open sidebar', 'toggle.collapse':'Collapse sidebar', 'panels.label':'Global panels', 'navigation.label':'Workspace navigation', 'conversation':'Conversation', 'workspace.caption':'YOUR WORKSPACE', 'appearance':'Appearance', 'appearance.light':'Light', 'appearance.dark':'Dark', 'appearance.system':'System', 'text.size':'Text size', 'text.smaller':'Decrease text size', 'text.larger':'Increase text size' },
  zh: { 'session.new':'新建会话', 'toggle.open':'展开侧栏', 'toggle.collapse':'收起侧栏', 'panels.label':'全局面板', 'navigation.label':'工作区导航', 'conversation':'返回对话', 'workspace.caption':'工作空间', 'appearance':'外观', 'appearance.light':'浅色', 'appearance.dark':'深色', 'appearance.system':'跟随系统', 'text.size':'字号', 'text.smaller':'减小字号', 'text.larger':'增大字号' },
};
function PanelRow({ id, label, usePanelInfo, selectPanel, renderSlot }: Pick<SidebarProps, 'usePanelInfo' | 'selectPanel' | 'renderSlot'> & { id: string; label: string }) {
  const active = usePanelInfo(info => info.activePanelId === id);
  const reduced = useCalmMotion();
  return <Button className="dlu-panel" aria-label={label} aria-current={active ? 'page' : undefined} title={label} onClick={() => selectPanel(id)}>
    {/* Pixel-Perfect's shared selection geometry, driven by the native panel state. */}
    {active && <motion.span className="dlu-panel-highlight" aria-hidden="true" layoutId={reduced ? undefined : 'selected-panel'} initial={false} transition={reduced ? { duration:0 } : { type:'spring', stiffness:450, damping:34 }} />}
    <span className="dlu-panel-glyph" aria-hidden="true">{renderSlot('sidebar.panellist', { size:18, active }, { only:id })}</span>
    <span className="dlu-rail-dot" aria-hidden="true" />
  </Button>;
}
function Appearance({ useTheme, setTheme, setTextSize, t }: Pick<SidebarProps, 'useTheme' | 'setTheme' | 'setTextSize' | 't'>) {
  const preference = useTheme(state => state.preference);
  const fontSize = useTheme(state => state.fontSizes.text);
  const reduced = useCalmMotion();
  const id = useId();
  return <div className="dlu-appearance">
    <span className="dlu-section-label">{t('appearance')}</span>
    <LayoutGroup id={id}><div className="dlu-theme-switch" role="group" aria-label={t('appearance')}>
      {(['light','dark','system'] as const).map(mode => <Button key={mode} className="dlu-theme-option" aria-label={t(`appearance.${mode}`)} aria-pressed={preference === mode} title={t(`appearance.${mode}`)} onClick={() => setTheme(mode)}>
        {preference === mode && <motion.span className="dlu-theme-highlight" layoutId={reduced ? undefined : 'theme-selection'} initial={false} transition={reduced ? { duration:0 } : { type:'spring', stiffness:450, damping:34 }} />}
        <Icon name={mode} size={13} />
        <span>{t(`appearance.${mode}`)}</span>
      </Button>)}
    </div></LayoutGroup>
    <div className="dlu-type-controls"><span>{t('text.size')}</span><div role="group" aria-label={t('text.size')}><Button aria-label={t('text.smaller')} title={t('text.smaller')} disabled={fontSize <= 10} onClick={()=>setTextSize(fontSize-1)}>A−</Button><output aria-live="polite">{fontSize}</output><Button aria-label={t('text.larger')} title={t('text.larger')} disabled={fontSize >= 22} onClick={()=>setTextSize(fontSize+1)}>A+</Button></div></div>
  </div>;
}
function SidebarContent(props: SidebarProps) {
  const { collapsed, width, renderSlot, t, startSession, toggleSidebar, selectPanel, usePanels, useShortcuts, usePanelInfo } = props;
  const wide = !collapsed;
  const panels = usePanels(value => value);
  const conversationActive = usePanelInfo(info => info.activePanelId === null);
  const toggleShortcut = useShortcuts(rows => rows.find(row => row.id === 'sidebar.left.toggle'));
  const newShortcut = useShortcuts(rows => rows.find(row => row.id === 'session.new'));
  const groupId = useId();
  const reduced = useCalmMotion();
  const toggleLabel = t(wide ? 'toggle.collapse' : 'toggle.open');
  const workspaces = renderSlot('sidebar.workspaces', { wide, expandSidebar:() => { if (collapsed) toggleSidebar(); } });
  return <aside className="dlu-sidebar" data-dlu="sidebar" data-version="2" data-collapsed={collapsed} aria-label={t('navigation.label')} style={{ maxWidth:width }}>
    <style>{css}</style>
    <div className="dlu-rail">
      <Button className="dlu-brand-button" aria-label={t('conversation')} aria-current={conversationActive ? 'page' : undefined} title={t('conversation')} onClick={() => selectPanel(null)}>
        {renderSlot('sidebar.brand.mark', { size:24 }, { fallback:<Icon name="mark" size={24} /> })}
      </Button>
      {!wide && <Button className="dlu-rail-new" aria-label={t('session.new')} aria-keyshortcuts={newShortcut?.aria} title={t('session.new')} onClick={() => startSession()}><Icon name="plus" size={18} /></Button>}
      <LayoutGroup id={groupId}><nav className="dlu-panels" aria-label={t('panels.label')}>{panels.map(panel => <PanelRow key={panel.id} {...panel} usePanelInfo={usePanelInfo} selectPanel={selectPanel} renderSlot={renderSlot} />)}</nav></LayoutGroup>
      {!wide && <div className="dlu-compact-workspaces">{workspaces}</div>}
      <div className="dlu-rail-spacer" />
      <div className="dlu-footer-actions">{renderSlot('sidebar.footer.action', { wide:false })}</div>
      <Button className="dlu-icon-button dlu-collapse" aria-label={toggleLabel} aria-keyshortcuts={toggleShortcut?.aria} aria-expanded={wide} title={toggleLabel} onClick={toggleSidebar}><Icon name="panel" size={18} />{!wide && renderSlot('sidebar.toggle.badge', {})}</Button>
      <div className="dlu-account">{renderSlot('sidebar.settings', { wide:false })}</div>
    </div>
    {wide && <motion.div className="dlu-workspace-pane" initial={reduced ? false : { opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ duration:reduced ? 0 : .22 }}>
      <div className="dlu-pane-header">
        <div className="dlu-brand-name">{renderSlot('sidebar.brand.name', {}, { fallback:<strong>DeepSeek Harness</strong> })}</div>
        <span className="dlu-eyebrow">{t('workspace.caption')}</span>
      </div>
      <div className="dlu-create-wrap"><Button className="dlu-new-session" aria-label={t('session.new')} aria-keyshortcuts={newShortcut?.aria} onClick={() => startSession()}>
        <span className="dlu-plus-box"><Icon name="plus" size={15} /></span><span className="dlu-label">{t('session.new')}</span>
        {newShortcut && <span className="dlu-shortcut" aria-hidden="true">{newShortcut.keys.map((key,index) => <span key={index}>{key}</span>)}</span>}
      </Button></div>
      <div className="dlu-workspaces">{workspaces}</div>
      <Appearance useTheme={props.useTheme} setTheme={props.setTheme} setTextSize={props.setTextSize} t={t} />
    </motion.div>}
  </aside>;
}
function Sidebar(props: SidebarProps) { return <MotionBoundary><SidebarContent {...props} /></MotionBoundary>; }
function Leading(props: SidebarProps) {
  const toggleShortcut = props.useShortcuts(rows => rows.find(row => row.id === 'sidebar.left.toggle'));
  const newShortcut = props.useShortcuts(rows => rows.find(row => row.id === 'session.new'));
  return <MotionBoundary><div className="dlu-leading"><style>{css}</style>
    <Button className="dlu-icon-button" aria-label={props.t('toggle.open')} aria-keyshortcuts={toggleShortcut?.aria} title={props.t('toggle.open')} onClick={props.toggleSidebar}><Icon name="panel" /></Button>
    <Button className="dlu-icon-button" aria-label={props.t('session.new')} aria-keyshortcuts={newShortcut?.aria} title={props.t('session.new')} onClick={() => props.startSession()}><Icon name="plus" /></Button>
  </div></MotionBoundary>;
}
export function registerSidebar(ctx: ClientContext) {
  ctx.effect(() => ctx.locale.register(NS, dictionaries), 'linear-ui: locale');
  let snapshot: readonly Panel[] = [];
  const listeners = new Set<() => void>();
  const panels = { getSnapshot:() => snapshot, subscribe:(listener:() => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; } };
  const theme = { getSnapshot:() => ctx.theme.getTheme(), subscribe:(listener:() => void) => ctx.on('theme/change', listener) };
  const sync = () => {
    const next = ctx.slots.entriesOfSlot('sidebar.panellist').flatMap(({ options }) => options.id ? [{ id:options.id, order:options.order ?? 0, label:(typeof options.label === 'function' ? options.label() : options.label) ?? options.id }] : []).sort((a,b) => a.order - b.order);
    if (next.length === snapshot.length && next.every((item,i) => item.id === snapshot[i]?.id && item.label === snapshot[i]?.label && item.order === snapshot[i]?.order)) return;
    snapshot = next;
    for (const listener of listeners) listener();
  };
  ctx.effect(() => ctx.slots.subscribe('sidebar.panellist', sync), 'linear-ui: panel list');
  ctx.effect(() => ctx.locale.subscribe(sync), 'linear-ui: panel labels');
  const injectProps = () => ({ startSession:() => ctx.uiWorkspace.startSession(), toggleSidebar:() => ctx.layout.toggleSidebar(), selectPanel:(id:string|null) => ctx.layout.selectPanel(id), setTheme:(id:string) => ctx.theme.setTheme(id), setTextSize:(px:number) => ctx.theme.setFontSize('text',px), hooks:{ panels, shortcuts:ctx.shortcuts.catalog, theme } });
  ctx.slots.inject('sidebar', () => ctx.slots.register({ name:'sidebar', locale:NS, inject:injectProps, children:{
    'sidebar.brand.mark':{kind:'single',scope:'root'}, 'sidebar.brand.name':{kind:'single',scope:'root'}, 'sidebar.toggle.badge':{kind:'single',scope:'root'}, 'sidebar.panellist':{kind:'list',scope:'root'}, 'sidebar.workspaces':{kind:'single',scope:'root'}, 'sidebar.settings':{kind:'single',scope:'root'}, 'sidebar.footer.action':{kind:'list',scope:'root'},
  } }, Sidebar));
  ctx.slots.inject('shell.leading', () => ctx.slots.register({ name:'shell.leading', locale:NS, inject:injectProps }, Leading));
  sync();
}
