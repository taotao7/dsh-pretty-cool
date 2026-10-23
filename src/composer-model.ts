import type { Observable } from './contracts';

/** Installed rc.2 ModelDirectory public contract; no native implementation import. */
export interface ModelSelection { readonly provider:string; readonly model:string; readonly reasoningEffort?:string }
export interface CatalogModel { readonly id:string; readonly name:string; readonly description?:string; readonly reasoning?:{readonly efforts:readonly {id:string;name:string;description?:string}[];readonly defaultEffort?:string} }
export interface ModelGroup { readonly id:string;readonly name:string;readonly models:readonly CatalogModel[] }
export interface DirectoryState {
  current:ModelSelection|null;
  retainedEffort?:string;
  routable:boolean|null;
  groups:readonly ModelGroup[];
  failures:readonly {id:string;name:string;message:string}[];
  status:'idle'|'loading'|'ready'|'selecting'|'error';
  pending:ModelSelection|null;
  error:string|null;
}
export interface ModelDirectory {
  readonly store:Observable<DirectoryState>;
  load():Promise<DirectoryState>;
  select(selection:ModelSelection):Promise<{ok:true;value:void}|{ok:false;error:{code:string;message:string}}>;
}
export interface ModelDirectories { directoryFor(sessionId:string):ModelDirectory }

export function currentModel(state:DirectoryState) {
  const group=state.groups.find(group=>group.id===state.current?.provider);
  const model=group?.models.find(model=>model.id===state.current?.model);
  return group && model ? {group,model} : undefined;
}
export function effortView(state:DirectoryState,autoLabel='Auto') {
  const model=currentModel(state)?.model;
  if(!model?.reasoning || !model.reasoning.efforts.length || !state.current) return undefined;
  const {reasoning}=model;
  const levels:{id:string|undefined;name:string}[]=reasoning.efforts.map(e=>({id:e.id,name:e.name}));
  // Native omission is representable only without a configured default. Never
  // invent a persisted Auto bit or send the string "auto" to a provider.
  if(reasoning.defaultEffort===undefined) levels.push({id:undefined,name:autoLabel});
  const effective=state.current.reasoningEffort??reasoning.defaultEffort;
  const index=levels.findIndex(level=>level.id===effective);
  const current=index<0?{id:effective,name:effective??autoLabel}:levels[index];
  const next=levels[(index+1)%levels.length];
  return {levels,index,current,next};
}
export function nextEffortSelection(state:DirectoryState,locked=false):ModelSelection|undefined {
  if(locked || state.pending!==null || state.routable===false || !state.current) return undefined;
  const view=effortView(state);
  if(!view || view.levels.length<2) return undefined;
  return {provider:state.current.provider,model:state.current.model,...(view.next.id===undefined?{}:{reasoningEffort:view.next.id})};
}
