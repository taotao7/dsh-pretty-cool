"use client";
import React,{useEffect,useId,useLayoutEffect,useMemo,useRef,useState,useSyncExternalStore} from 'react';
import {AnimatePresence,motion} from 'motion/react';
import {Button,ease,useCalmMotion} from './primitives';
import type {ClientContext} from './contracts';
import {currentModel,effortView,nextEffortSelection,type ModelDirectory,type ModelSelection} from './composer-model';
import css from './composer.css';
const NS='linear-ui-composer';
const dictionaries={
  en:{model:'Select model',models:'Models',find:'Find a model…',none:'No matching models',loading:'Loading models…',retry:'Retry',auto:'Auto',thinking:'Thinking level',next:'Next',cycle:'Click to cycle',autoHint:'Auto uses the provider default',fixedHint:'This model has a configured default; cycle its supported levels',close:'Dismiss',closePicker:'Close model picker',current:'Current model',results:'Results',navigate:'Navigate',select:'Select',escape:'Close',keyboard:'Keyboard shortcuts',writerHeld:'Another writer controls this session. Retry when it is available.'},
  zh:{model:'选择模型',models:'模型',find:'搜索模型…',none:'没有匹配的模型',loading:'正在加载模型…',retry:'重试',auto:'Auto',thinking:'思考级别',next:'下一级',cycle:'单击循环切换',autoHint:'Auto 使用提供方的默认级别',fixedHint:'此模型有固定默认值，按钮循环切换它支持的级别',close:'关闭',closePicker:'关闭模型选择器',current:'当前模型',results:'结果',navigate:'浏览',select:'选择',escape:'关闭',keyboard:'键盘快捷键',writerHeld:'其他写入方正在控制此会话，请稍后重试。'},
};
interface Props {locked:boolean;available:boolean;directory:ModelDirectory;t:(key:string)=>string}
function Chevron(){return <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg>;}
function ModelMark(){return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true"><path d="m8 1 6 3.5v7L8 15l-6-3.5v-7Z M2 4.5 8 8l6-3.5M8 8v7"/></svg>;}
function ModelControls({locked,available,directory,t}:Props){
  const subscribe=React.useCallback((listener:()=>void)=>directory.store.subscribe(listener),[directory]);
  const snapshot=React.useCallback(()=>directory.store.getSnapshot(),[directory]);
  const state=useSyncExternalStore(subscribe,snapshot);
  const reduced=useCalmMotion();
  const [open,setOpen]=useState(false);
  const [query,setQuery]=useState('');
  const [active,setActive]=useState(0);
  const [offset,setOffset]=useState(0);
  const [error,setError]=useState<string|null>(null);
  const root=useRef<HTMLDivElement>(null);
  const panel=useRef<HTMLDivElement>(null);
  const trigger=useRef<HTMLButtonElement>(null);
  const search=useRef<HTMLInputElement>(null);
  const options=useRef<(HTMLButtonElement|null)[]>([]);
  const generation=useRef(0);
  const id=useId();
  const chosen=currentModel(state);
  const effort=effortView(state,t('auto'));
  const pending=state.pending!==null;
  const rows=useMemo(()=>{
    const needle=query.trim().toLocaleLowerCase();
    return state.groups.flatMap(group=>group.models.filter(model=>`${model.name} ${model.id} ${group.name}`.toLocaleLowerCase().includes(needle)).map(model=>({group,model})));
  },[query,state.groups]);
  useEffect(()=>{
    generation.current++;
    setOpen(false);setError(null);setQuery('');
    if(available)void directory.load().catch(()=>{});
    return ()=>{generation.current++;};
  },[directory,available]);
  useEffect(()=>{if(locked || !available)setOpen(false);},[locked,available]);
  useEffect(()=>{
    if(!open)return;
    search.current?.focus({preventScroll:true});
    const outside=(event:PointerEvent)=>{if(event.target instanceof Node && !root.current?.contains(event.target))setOpen(false);};
    document.addEventListener('pointerdown',outside,true);
    return ()=>document.removeEventListener('pointerdown',outside,true);
  },[open]);
  useEffect(()=>{
    if(open)setActive(Math.max(0,rows.findIndex(row=>row.group.id===state.current?.provider && row.model.id===state.current?.model)));
  },[open,query,rows]);
  useEffect(()=>{if(open)options.current[active]?.scrollIntoView({block:'nearest'});},[active,open]);
  // Measure only our own control group and panel; no host DOM selectors or body portal.
  useLayoutEffect(()=>{
    if(!open)return;
    const fit=()=>{
      const anchor=root.current?.getBoundingClientRect();
      const width=panel.current?.getBoundingClientRect().width;
      if(anchor && width)setOffset(Math.min(0,window.innerWidth-12-anchor.left-width)+Math.max(0,12-anchor.left));
    };
    fit();window.addEventListener('resize',fit);
    const observer=new ResizeObserver(fit);
    if(root.current)observer.observe(root.current);
    if(panel.current)observer.observe(panel.current);
    return ()=>{window.removeEventListener('resize',fit);observer.disconnect();};
  },[open]);
  function close(restore=false){setOpen(false);if(restore)trigger.current?.focus({preventScroll:true});}
  async function select(selection:ModelSelection,closeAfter=false){
    if(!available || locked || directory.store.getSnapshot().pending!==null)return;
    const operation=++generation.current;
    setError(null);
    try{
      const result=await directory.select(selection);
      if(operation!==generation.current)return;
      if(!result.ok)setError(result.error.code==='session/writer-held'?t('writerHeld'):`${result.error.code}: ${result.error.message}`);
      else if(closeAfter){const menu=panel.current;close(!!menu && menu.contains(menu.ownerDocument.activeElement));}
    }catch(reason){if(operation===generation.current)setError(reason instanceof Error?reason.message:String(reason));}
  }
  function choose(index:number){
    const row=rows[index];if(!row)return;
    const latest=directory.store.getSnapshot();
    if(locked || latest.pending!==null)return;
    if(row.group.id===latest.current?.provider && row.model.id===latest.current.model){close(true);return;}
    void select({provider:row.group.id,model:row.model.id,...(row.model.reasoning?.defaultEffort===undefined?{}:{reasoningEffort:row.model.reasoning.defaultEffort})},true);
  }
  if(!available)return null;
  const caption=chosen?.model.name??t('model');
  const hint=effort?`${t('thinking')}: ${effort.current.name}. ${t('next')}: ${effort.next.name}. ${t('cycle')}. ${chosen?.model.reasoning?.defaultEffort===undefined?t('autoHint'):t('fixedHint')}`:'';
  return <div className="dlu-model-controls" data-dlu="model-controls" ref={root} onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget))setOpen(false);}}>
    <Button ref={trigger} className="dlu-model-trigger" disabled={locked} aria-haspopup="dialog" aria-expanded={open} aria-controls={open?`${id}-menu`:undefined} aria-label={`${t('model')}: ${caption}${chosen?` · ${chosen.group.name}`:''}`} title={chosen?`${caption} · ${chosen.group.name}`:t('model')} onClick={()=>{setQuery('');setOffset(0);setOpen(value=>!value);if(state.status==='error')void directory.load().catch(()=>{});}}>
      <span className="dlu-model-symbol"><ModelMark/></span><span className="dlu-model-caption">{caption}</span><Chevron/>
    </Button>
    {effort && <Button className="dlu-effort" data-dlu="effort" data-effort={effort.current.id??'provider-default'} disabled={locked || pending || effort.levels.length<2} aria-busy={pending} aria-label={hint} title={hint} onMouseDown={event=>{if(event.button===0)event.preventDefault();}} onClick={event=>{if(open){close();event.currentTarget.focus();}const selection=nextEffortSelection(directory.store.getSnapshot(),locked);if(selection)void select(selection);}}>
      <span className="dlu-effort-meter" aria-hidden="true" data-auto={effort.current.id===undefined}>{effort.levels.filter(level=>level.id!==undefined).map((level,index)=><motion.i key={level.id} initial={false} animate={{opacity:effort.current.id===undefined?.35:index<=effort.index?1:.2}} transition={{duration:reduced?0:.15,ease}} style={{height:3+index*1.5}}/>)}</span>
      <span aria-live="polite" aria-atomic="true">{effort.current.name}</span>
      <svg className="dlu-effort-cycle" width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M13 6a5 5 0 1 0 0 4M13 2v4H9"/></svg>
      {pending && <span className="dlu-pending-dot" aria-hidden="true"/>}
    </Button>}
    <AnimatePresence initial={false}>
      {open && <motion.div ref={panel} id={`${id}-menu`} className="dlu-model-menu" role="dialog" aria-label={t('model')} style={{left:offset}} initial={reduced?false:{opacity:0,y:5}} animate={{opacity:1,y:0}} exit={{opacity:0,y:reduced?0:3}} transition={{duration:reduced?0:.12,ease}} onKeyDown={event=>{
        if(event.nativeEvent.isComposing || event.nativeEvent.keyCode===229)return;
        if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close(true);}
        else if(event.key==='ArrowDown' || event.key==='ArrowUp'){event.preventDefault();event.stopPropagation();if(rows.length)setActive(index=>(index+(event.key==='ArrowDown'?1:-1)+rows.length)%rows.length);}
        else if(event.key==='Enter' && event.target===search.current){event.preventDefault();event.stopPropagation();if(!pending)choose(active);}
      }}>
        <div className="dlu-model-menu-heading"><span>{t('models')}</span><button type="button" className="dlu-model-close" aria-label={t('closePicker')} title={t('closePicker')} onClick={()=>close(true)}><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m4 4 8 8M12 4l-8 8"/></svg></button></div>
        {state.current && <div className="dlu-model-current">
          <span className="dlu-model-current-label">{t('current')}</span>
          <strong>{chosen?.model.name??state.current.model}</strong>
          <span className="dlu-model-current-provider" title={`${state.current.provider} / ${state.current.model}`}>{chosen?.group.name??state.current.provider}</span>
        </div>}
        <input ref={search} className="dlu-model-search" role="combobox" aria-label={t('find')} aria-expanded="true" aria-autocomplete="list" aria-controls={`${id}-list`} aria-activedescendant={rows[active]?`${id}-option-${active}`:undefined} value={query} placeholder={t('find')} onChange={event=>setQuery(event.target.value)}/>
        <div className="dlu-model-list" id={`${id}-list`} role="listbox" aria-label={t('models')} aria-busy={pending || state.status==='loading'}>
          {rows.map((row,index)=>{
            const selected=row.group.id===state.current?.provider && row.model.id===state.current?.model;
            return <React.Fragment key={`${row.group.id}/${row.model.id}`}>
              {(index===0 || rows[index-1].group.id!==row.group.id) && <div className="dlu-provider-caption" role="presentation">{row.group.name}</div>}
              <button ref={node=>{options.current[index]=node;}} type="button" role="option" tabIndex={-1} id={`${id}-option-${index}`} aria-selected={selected} aria-describedby={row.model.description?`${id}-description-${index}`:undefined} aria-label={`${row.model.name} · ${row.group.name}`} disabled={pending || locked} data-active={index===active} className="dlu-model-option" title={row.model.description} onMouseMove={()=>setActive(index)} onClick={()=>choose(index)}>
                <span className="dlu-model-option-copy"><span className="dlu-model-option-name">{row.model.name}</span>{row.model.description && <span className="dlu-model-description" id={`${id}-description-${index}`}>{row.model.description}</span>}</span><span className="dlu-model-check" aria-hidden="true">{selected?'✓':''}</span>
              </button>
            </React.Fragment>;
          })}
          {!rows.length && <p className="dlu-model-empty">{state.status==='loading'?t('loading'):t('none')}</p>}
        </div>
        <div className="dlu-model-menu-footer">
          <span className="dlu-model-result-count" role="status" aria-live="polite" aria-atomic="true">{t('results')} <strong>{rows.length}</strong></span>
          <div className="dlu-model-keyboard" aria-label={t('keyboard')}><span><kbd>↑ ↓</kbd> {t('navigate')}</span><span><kbd>Enter</kbd> {t('select')}</span><span><kbd>Esc</kbd> {t('escape')}</span></div>
        </div>
        {(state.error || state.failures.length>0) && <div className="dlu-catalog-errors"><span>{state.error??state.failures.map(failure=>`${failure.name}: ${failure.message}`).join('\n')}</span><button type="button" className="dlu-message-action" onClick={()=>void directory.load().catch(()=>{})}>{t('retry')}</button></div>}
      </motion.div>}
    </AnimatePresence>
    {error && <div className="dlu-model-error" role="alert"><span>{error}</span><button type="button" className="dlu-message-action" aria-label={t('close')} onClick={()=>setError(null)}>×</button></div>}
  </div>;
}
function Styles(){return <style>{css}</style>;}
export function registerComposer(ctx:ClientContext){
  ctx.effect(()=>ctx.locale.register(NS,dictionaries),'linear-ui: composer locale');
  ctx.slots.inject('shell.overlay',()=>ctx.slots.register({name:'shell.overlay',id:'linear-ui.composer-styles'},Styles));
  ctx.slots.inject('conversation.input.model',()=>ctx.slots.register({name:'conversation.input.model',priority:-20,locale:NS,inject:(sessionId:string)=>({directory:ctx.modelDirectories.directoryFor(sessionId),available:ctx.sessions.subagentAddress(sessionId)===undefined})},ModelControls));
}
