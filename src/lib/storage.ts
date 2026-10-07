import { supabase } from './cloud';
import { StorageEngine, type CloudAdapter, type CloudRecord, type SyncPhase } from './storage-engine';
import { defaults, emptyData, resources, type RecordsData, type Snapshot } from './storage-schema';
export { supabase } from './cloud';
let engine:StorageEngine|null=null;
let timer:ReturnType<typeof setTimeout>|null=null;
let initialized=false;
let retryDelay=1000;
const listeners=new Set<()=>void>();
export interface StorageStatus {scope:string;email:string;configured:boolean;phase:SyncPhase;pending:boolean;error:string;online:boolean;initialized:boolean}
let status:StorageStatus={scope:'guest',email:'',configured:!!supabase,phase:'local',pending:false,error:'',online:true,initialized:false};
export const getStorageStatus=()=>status;
export const subscribeStorage=(listener:()=>void)=>{listeners.add(listener);return()=>{listeners.delete(listener);};};
function announce() {
  status={...status,phase:engine?.phase??'local',pending:engine?.pending()??false,error:engine?.error??'',online:typeof navigator==='undefined'||navigator.onLine};
  listeners.forEach(listener=>listener());
  window.dispatchEvent(new Event('ukos:data'));
}
function legacyData():RecordsData {
  const data=structuredClone(defaults);
  for(const resource of resources) {
    const value=localStorage.getItem(`ukos_${resource}`);
    if(value!==null)(data as Record<string,unknown>)[resource]=JSON.parse(value);
  }
  return data;
}
export function getEngine():StorageEngine {
  if(!engine)engine=new StorageEngine(localStorage,'guest',legacyData(),onChange);
  return engine;
}
function onChange() {announce();if(engine?.scope!=='guest'&&engine?.phase==='pending')schedule(250);}
export function cloudAdapter():CloudAdapter {
  if(!supabase || engine?.scope==='guest')throw new Error('Sign in to sync records.');
  const client=supabase;
  const owner=engine!.scope;
  const toRecord=(row:{snapshot:Snapshot;revision:number;last_mutation_id:string}):CloudRecord=>({snapshot:row.snapshot,revision:row.revision,mutationId:row.last_mutation_id});
  return {
    async read(){
      const {data,error}=await client.from('ukos_snapshots').select('snapshot,revision,last_mutation_id').eq('user_id',owner).abortSignal(AbortSignal.timeout(15000)).maybeSingle();
      if(error)throw new Error(`Cloud read failed: ${error.message}`);
      return data?toRecord(data):null;
    },
    async write(snapshot,revision,id){
      const {data,error}=await client.rpc('ukos_save_snapshot',{p_snapshot:snapshot,p_expected_revision:revision,p_mutation_id:id}).abortSignal(AbortSignal.timeout(15000));
      if(error)throw new Error(`Cloud save failed: ${error.message}`);
      if(!data || !['saved','conflict'].includes(data.status) || !data.record)throw new Error('Unexpected cloud response.');
      return {status:data.status,record:toRecord(data.record)};
    },
  };
}
function schedule(delay:number) {if(timer)clearTimeout(timer);timer=setTimeout(()=>{timer=null;void retrySync();},delay);}
export async function retrySync() {
  const current=getEngine();
  if(current.scope==='guest'||!supabase)return;
  if(!navigator.onLine){current.phase='pending';current.error='Offline. Changes are saved on this device.';announce();schedule(30000);return;}
  await current.sync(cloudAdapter());
  if(current!==engine)return;
  announce();
  if(current.phase==='error'){schedule(retryDelay);retryDelay=Math.min(retryDelay*2,60000);}
  else {retryDelay=1000;if(current.phase!=='conflict')schedule(current.pending()?500:30000);}
}
function changeScope(id:string,email:string) {
  if(engine?.scope===id){status={...status,email,initialized:true};announce();return;}
  engine?.deactivate();if(timer)clearTimeout(timer);
  engine=new StorageEngine(localStorage,id,id==='guest'?legacyData():emptyData(),onChange);
  status={...status,scope:id,email,initialized:true};announce();if(id!=='guest')schedule(0);
}
export async function initializeStorage() {
  if(initialized)return;
  initialized=true;
  if(supabase) {
    const {data}=await supabase.auth.getSession();
    changeScope(data.session?.user.id??'guest',data.session?.user.email??'');
    supabase.auth.onAuthStateChange((_event,session)=>{setTimeout(()=>changeScope(session?.user.id??'guest',session?.user.email??''),0);});
  } else changeScope('guest','');
  window.addEventListener('online',()=>{retryDelay=1000;void retrySync();});
  window.addEventListener('offline',announce);
  window.addEventListener('storage',event=>{if(event.key===engine?.key){announce();if(engine?.scope!=='guest')schedule(500);}});
}
export async function resolveConflict(choice:'local'|'cloud') {await getEngine().resolve(cloudAdapter(),choice);announce();}
