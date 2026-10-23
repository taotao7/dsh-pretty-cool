"use client";

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useCalmMotion, ease } from './primitives';
import type { ClientContext, RenderFactory } from './contracts';
import css from './chat.css';

const NS = 'linear-ui-chat';
const dictionaries = {
  en:{ you:'You', steering:'Follow-up', copy:'Copy', copied:'Copied', copyFailed:'Copy failed — retry', activity:'Work details', finished:'Work completed', stopped:'Stopped', failed:'Failed', tools:'tool calls', messages:'messages', agents:'subagents', reasoning:'Reasoning', seconds:'s', minutes:'m' },
  zh:{ you:'你', steering:'追加指示', copy:'复制', copied:'已复制', copyFailed:'复制失败，请重试', activity:'工作过程', finished:'本轮工作已完成', stopped:'已停止', failed:'执行失败', tools:'次工具调用', messages:'条消息', agents:'个子代理', reasoning:'推理过程', seconds:'秒', minutes:'分' },
};
interface TextBlock { type:string; text?:string; attachment?:unknown; [key:string]:unknown }
interface UserProps {
  node:{kind:string;data:{content:readonly TextBlock[];time?:number;referenceLabels?:readonly string[];skillNames?:readonly string[]}};
  loadImage:unknown;
  renderFactorySlot:RenderFactory;
  t:(key:string)=>string;
}
function UserCard({ node, loadImage, renderFactorySlot, t }: UserProps) {
  const reduced = useCalmMotion();
  const [copyState, setCopyState] = useState<'copy'|'copied'|'copyFailed'>('copy');
  const data = node.data;
  const texts:string[] = [];
  const attachments:unknown[] = [];
  const extraBlocks:unknown[] = [];
  for (const block of data.content) {
    if (block.type === 'text' && typeof block.text === 'string') texts.push(block.text);
    else if (block.type === 'image' && block.attachment !== undefined) attachments.push({type:'image',image:{attachment:block.attachment}});
    else if (block.type === 'file' && block.attachment !== undefined) attachments.push({type:'file',file:block.attachment});
    else extraBlocks.push(block);
  }
  const text = texts.join('');
  const time = data.time === undefined ? undefined : new Date(data.time);
  return <motion.article className="dlu-user-card" data-dlu="user-card" initial={reduced ? false : {opacity:0,y:5}} animate={{opacity:1,y:0}} transition={{duration:reduced ? 0 : .18,ease}}>
    <header className="dlu-message-header">
      <span className="dlu-user-avatar" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="8" r="3.5"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/></svg></span>
      <strong>{t(node.kind === 'steering' ? 'steering' : 'you')}</strong>
      {time && <time dateTime={time.toISOString()} title={time.toLocaleString()}>{time.toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit'})}</time>}
      {text && <button type="button" className="dlu-message-action" aria-label={t(copyState)} onBlur={()=>setCopyState('copy')} onClick={async()=>{try {await navigator.clipboard.writeText(text);setCopyState('copied');} catch {setCopyState('copyFailed');}}}>{t(copyState)}</button>}
    </header>
    {renderFactorySlot('conversation.chat.user.content', {
      content:{text,attachments,extraBlocks,...(data.referenceLabels === undefined ? {} : {referenceLabels:data.referenceLabels})},
      facts:{...(data.referenceLabels === undefined ? {} : {sessionLabels:data.referenceLabels}),...(data.skillNames === undefined ? {} : {skillNames:data.skillNames})},
      loadImage,interactive:true,
    })}
  </motion.article>;
}
interface ProcessProps {
  node:{data:{turn:number;messageCount:number;toolCallCount:number;subagentCount:number};location:{kind:string;turn?:{status:string;start?:{time:number};end?:{time:number;data:{reason:{kind:string}}}}}};
  turnProcess?:{hasContent:boolean;foldable:boolean;open:boolean;setOpen(open:boolean):void};
  t:(key:string)=>string;
}
function ProcessCard({ node, turnProcess, t }: ProcessProps) {
  const reduced = useCalmMotion();
  const turn = node.location.kind === 'turn' || node.location.kind === 'step' ? node.location.turn : undefined;
  if (!turnProcess || turn?.status !== 'closed') return null;
  const reason = turn.end?.data.reason.kind;
  const stopped = reason === 'aborted' || reason === 'interrupted';
  const failed = reason === 'error';
  const open = !turnProcess.foldable || turnProcess.open;
  const canCollapse = turnProcess.foldable && turnProcess.hasContent && !stopped && !failed;
  const seconds = turn.start && turn.end ? Math.max(1,Math.floor((turn.end.time-turn.start.time)/1000)) : undefined;
  const duration = seconds === undefined || stopped || failed ? undefined : seconds >= 60 ? `${Math.floor(seconds/60)}${t('minutes')} ${seconds%60}${t('seconds')}` : `${seconds}${t('seconds')}`;
  const label = t(stopped ? 'stopped' : failed ? 'failed' : 'activity');
  return <><span className="dlu-sr-only" role="status" aria-live="polite" aria-atomic="true">{t(stopped ? 'stopped' : failed ? 'failed' : 'finished')}</span><motion.button type="button" className="dlu-process-card" data-dlu="process-card" data-state={failed ? 'error' : stopped ? 'stopped' : 'settled'} data-turn-process={node.data.turn} data-turn-process-messages={node.data.messageCount} data-turn-process-tool-calls={node.data.toolCallCount} data-turn-process-subagents={node.data.subagentCount}
    disabled={!canCollapse} aria-expanded={turnProcess.hasContent ? open : undefined} onClick={event=>{event.currentTarget.focus();turnProcess.setOpen(!open);}} whileTap={reduced || !canCollapse ? undefined : {scale:.995}}>
    <span className="dlu-process-icon" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="m4 13 4-7 4 12 4-10 4 5" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
    <span className="dlu-process-info"><strong>{label}</strong><span className="dlu-process-counts">{[[node.data.toolCallCount,'tools'],[node.data.messageCount,'messages'],[node.data.subagentCount,'agents']].filter(([count])=>Number(count)>0).map(([count,key])=><span key={String(key)}><b>{count}</b> {t(String(key))}</span>)}</span></span>
    {duration && <span className="dlu-process-duration">{duration}</span>}
    {canCollapse && <motion.svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" animate={{rotate:open ? 0 : -90}} transition={{duration:reduced ? 0 : .18}} aria-hidden="true"><path d="m6 9 6 6 6-6"/></motion.svg>}
  </motion.button></>;
}
interface ReasoningProps { text:string; running:boolean; renderFactorySlot:RenderFactory; t:(key:string)=>string }
function ReasoningFrame({ text, running, renderFactorySlot, t }: ReasoningProps) {
  const reduced = useCalmMotion();
  return <motion.div className="dlu-reasoning" data-dlu="reasoning" initial={reduced ? false : {opacity:0,y:4}} animate={{opacity:1,y:0}} transition={{duration:reduced ? 0 : .2,ease}}>
    <div className="dlu-reasoning-label"><span className="dlu-reasoning-dot" aria-hidden="true"/>{t('reasoning')}</div>
    {renderFactorySlot('conversation.chat.reasoning.content', {text,running})}
  </motion.div>;
}
interface ImagesProps { images:readonly unknown[]; loadImage:unknown; align:'start'|'end'; compact?:boolean; thumbnail?:boolean; renderFactorySlot:RenderFactory }
function ImageFrame({ images, loadImage, align, compact, thumbnail, renderFactorySlot }: ImagesProps) {
  const reduced = useCalmMotion();
  if (!images.length) return null;
  return <motion.div className="dlu-images" data-dlu="images" initial={reduced ? false : {opacity:0}} animate={{opacity:1}} transition={{duration:reduced ? 0 : .16,ease}}>{renderFactorySlot('conversation.images.content', {images,loadImage,align,compact,thumbnail})}</motion.div>;
}
function Styles() { return <style>{css}</style>; }
export function registerChatLeaves(ctx: ClientContext) {
  ctx.effect(()=>ctx.locale.register(NS,dictionaries),'linear-ui: chat locale');
  ctx.slots.inject('shell.overlay',()=>ctx.slots.register({name:'shell.overlay',id:'linear-ui.scoped-styles'},Styles));
  for (const key of ['user','steering']) ctx.slots.inject('conversation.chat.node',()=>ctx.slots.register({name:'conversation.chat.node',key,priority:-20,locale:NS},UserCard));
  ctx.slots.inject('conversation.chat.node',()=>ctx.slots.register({name:'conversation.chat.node',key:'turn-process',priority:-20,locale:NS},ProcessCard));
  ctx.slots.inject('conversation.chat.reasoning.body',()=>ctx.slots.register({name:'conversation.chat.reasoning.body',priority:-20,locale:NS},ReasoningFrame));
  for (const name of ['conversation.chat.user.images','conversation.chat.message.images']) ctx.slots.inject(name,()=>ctx.slots.register({name,priority:-20},ImageFrame));
}
