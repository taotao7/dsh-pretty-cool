import React from 'react';
import type { ClientContext, Selector } from './contracts';
import css from './dashboard.css';
import refinements from './refinements.css';

interface Pressure { pressureTokens?:number; projectedTokens?:number; contextWindow?:number }
interface SessionList { byId:Record<string,{cwd?:string}> }
interface ContextProps {
  sessionId:string;
  useSessions:Selector<SessionList>;
  useProjection:(key:'contextPressure')=>Pressure|undefined;
  t:(key:string)=>string;
}
const NS='linear-dashboard';
const dictionaries={
  en:{directory:'Working directory',context:'Approximate context usage'},
  zh:{directory:'工作目录',context:'估算上下文占用'},
};
function HeaderMarker(){return <span className="dlu-header-marker" hidden/>;}
function ActivitySeat(){return <div className="dlu-status-rail" aria-hidden="true"/>;}
function RunningTime(){
  React.useEffect(()=>{
    const sync=()=>{
      for (const node of Array.from(document.querySelectorAll('[data-chat-running=true] [class$="_runningContent"]'))) {
        const text=node.querySelector('[class$="_runningText"]')?.textContent??'';
        const duration=text.match(/(\d+\s*[a-z\u4e00-\u9fff]+(?:\s+\d+\s*[a-z\u4e00-\u9fff]+)?)\s*$/i)?.[1]??'';
        if (node.getAttribute('data-dlu-duration')!==duration) node.setAttribute('data-dlu-duration',duration);
      }
    };
    sync();
    const observer=new MutationObserver(sync);
    observer.observe(document.body,{childList:true,subtree:true,characterData:true});
    return ()=>observer.disconnect();
  },[]);
  return null;
}
function PromptContext({sessionId,useSessions,useProjection,t}:ContextProps){
  const cwd=useSessions(s=>s.byId[sessionId]?.cwd);
  const pressure=useProjection('contextPressure');
  const used=pressure?.projectedTokens??pressure?.pressureTokens;
  const capacity=pressure?.contextWindow;
  const percent=typeof used==='number'&&Number.isFinite(used)&&typeof capacity==='number'&&Number.isFinite(capacity)&&capacity>0
    ?Math.min(100,Math.max(0,Math.round(used/capacity*100))):undefined;
  const shortPath=cwd?.split(/[\\/]/).filter(Boolean).slice(-2).join('/')||cwd;
  return <>
    {cwd&&<span className="dlu-prompt-directory" title={`${t('directory')}: ${cwd}`}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M3 7a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/></svg>
      <span>{shortPath}</span>
    </span>}
    {percent!==undefined&&<span className="dlu-context-line" aria-hidden="true" data-pressure={percent>=90?'high':'normal'}><i style={{width:`${percent}%`}}/></span>}
  </>;
}
function Styles(){return <style>{css+'\n'+refinements}</style>;}
export function registerDashboard(ctx:ClientContext){
  ctx.effect(()=>ctx.locale.register(NS,dictionaries),'linear-ui: dashboard locale');
  ctx.slots.inject('shell.overlay',()=>ctx.slots.register({name:'shell.overlay',id:'linear-ui.dashboard-styles'},Styles));
  ctx.slots.inject('shell.overlay',()=>ctx.slots.register({name:'shell.overlay',id:'linear-ui.running-time'},RunningTime));
  ctx.slots.inject('conversation.session.header.actions',()=>ctx.slots.register({name:'conversation.session.header.actions',id:'linear-ui.header-marker',order:1000},HeaderMarker));
  ctx.slots.inject('conversation.input.dock',()=>ctx.slots.register({name:'conversation.input.dock',id:'linear-ui.status-seat',order:30},ActivitySeat));
  ctx.slots.inject('conversation.composer.dock',()=>ctx.slots.register({name:'conversation.composer.dock',id:'linear-ui.context',order:-10,locale:NS},PromptContext));
}
