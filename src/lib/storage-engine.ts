import { emptyData, resources, validateSnapshot, type Backup, type RecordsData, type Resource, type Snapshot, type TrashEntry } from './storage-schema';
export interface StorageAdapter {getItem(key:string):string|null;setItem(key:string,value:string):void}
export interface CloudRecord {snapshot:Snapshot;revision:number;mutationId:string}
export interface CloudAdapter {read():Promise<CloudRecord|null>;write(snapshot:Snapshot,revision:number,id:string):Promise<{status:'saved'|'conflict';record:CloudRecord}>}
interface Envelope extends Snapshot {revision:number;pendingId:string|null;inFlight?:{id:string;snapshot:Snapshot;revision:number};cloudKnown:boolean}
export type SyncPhase = 'local'|'ready'|'syncing'|'pending'|'conflict'|'error';
export class StorageEngine {
  readonly key: string;
  phase: SyncPhase = 'local';
  error = '';
  private running = false;
  private active = true;
  constructor(private storage:StorageAdapter, readonly scope:string, initial:RecordsData, private notify:()=>void = () => {}) {
    this.key = `ukos.store.v1:${scope}`;
    if (!storage.getItem(this.key)) this.persist({schemaVersion:1,data:structuredClone(initial),trash:[],revision:0,pendingId:null,cloudKnown:false});
    this.read();
  }
  private persist(value:Envelope) {this.storage.setItem(this.key,JSON.stringify(value));}
  private read():Envelope {
    const value:Envelope = JSON.parse(this.storage.getItem(this.key)!);
    validateSnapshot(value);
    if (!Number.isInteger(value.revision) || value.revision < 0) throw new Error('Invalid storage revision. Export your records before changing storage.');
    if ((value.pendingId !== null && typeof value.pendingId !== 'string') || typeof value.cloudKnown !== 'boolean') throw new Error('Invalid sync queue metadata. Saved records have been preserved.');
    if (value.inFlight) {
      validateSnapshot(value.inFlight.snapshot);
      if (typeof value.inFlight.id !== 'string' || !Number.isInteger(value.inFlight.revision) || value.inFlight.revision < 0) throw new Error('Invalid pending upload. Saved records have been preserved.');
    }
    return value;
  }
  snapshot():Snapshot {const {schemaVersion,data,trash} = this.read(); return {schemaVersion,data,trash};}
  pending():boolean {return !!this.read().pendingId;}
  deactivate() {this.active = false;}
  get<K extends Resource>(key:K):RecordsData[K] {return structuredClone(this.read().data[key]);}
  mutate(update:(data:RecordsData,trash:TrashEntry[])=>void) {
    const envelope = this.read();
    update(envelope.data,envelope.trash);
    validateSnapshot(envelope);
    envelope.pendingId = this.scope === 'guest' ? null : crypto.randomUUID();
    this.persist(envelope); // Atomic local snapshot + outbox. A quota failure leaves the old state intact.
    this.phase = this.scope === 'guest' ? 'local' : 'pending';
    this.error = ''; this.notify();
  }
  replaceList<K extends Resource>(key:K,items:RecordsData[K]) {
    this.mutate((data,trash) => {
      const previous = data[key] as unknown as {id:string}[];
      const next = items as unknown as {id:string}[];
      if (!Array.isArray(previous) || !Array.isArray(next)) throw new Error('Expected a record list.');
      for (const item of previous) if (!next.some(entry => entry.id === item.id)) trash.push({recoveryId:crypto.randomUUID(),resource:key,item:structuredClone(item),deletedAt:new Date().toISOString()});
      data[key] = structuredClone(items);
    });
  }
  recover(id:string) {
    this.mutate((data,trash) => {
      const index = trash.findIndex(item => item.recoveryId === id);
      if (index < 0) throw new Error('Recovery record not found.');
      const entry = trash[index];
      const list = data[entry.resource] as unknown as {id:string}[];
      if (list.some(item => item.id === entry.item.id)) throw new Error('That record already exists. Export both versions before choosing one.');
      list.push(structuredClone(entry.item) as {id:string});
      if (entry.resource === 'loan_transactions') data.loan_details.amountRepaidInr += entry.item.amountInr as number;
      trash.splice(index,1);
    });
  }
  export():Backup {return {app:'UKOS',exportedAt:new Date().toISOString(),...this.snapshot()};}
  restore(value:unknown) {
    if (!value || typeof value !== 'object' || (value as {app?:string}).app !== 'UKOS') throw new Error('Choose a UKOS backup file.');
    validateSnapshot(value);
    this.storage.setItem(`${this.key}:before-restore`,JSON.stringify(this.export()));
    this.mutate((data,trash) => {for (const resource of resources) (data as Record<string,unknown>)[resource] = structuredClone(value.data[resource]); trash.splice(0,trash.length,...structuredClone(value.trash));});
  }
  previousBackup():Backup|null {const value=this.storage.getItem(`${this.key}:before-restore`); return value ? JSON.parse(value):null;}
  private acknowledge(id:string,record:CloudRecord) {
    const current=this.read();
    current.revision=record.revision; current.cloudKnown=true;
    if(current.pendingId===id) current.pendingId=null;
    delete current.inFlight;
    this.persist(current);
  }
  async sync(cloud:CloudAdapter):Promise<void> {
    if(this.running || !this.active || this.scope==='guest') return;
    this.running=true; this.phase='syncing'; this.error=''; this.notify();
    try {
      let remote=await cloud.read();
      if(!this.active) return;
      if(remote) validateSnapshot(remote.snapshot);
      let current=this.read();
      if(current.inFlight && remote?.mutationId===current.inFlight.id) {this.acknowledge(current.inFlight.id,remote);current=this.read();}
      if(!current.pendingId) {
        if(remote) {const changed=JSON.stringify(current.data)!==JSON.stringify(remote.snapshot.data)||JSON.stringify(current.trash)!==JSON.stringify(remote.snapshot.trash);this.persist({...remote.snapshot,revision:remote.revision,pendingId:null,cloudKnown:true});if(changed)this.notify();}
        else {if(current.revision>0){this.phase='conflict';this.error='The cloud snapshot is missing. Review your local version before syncing.';return;}current.cloudKnown=true;this.persist(current);}
        this.phase='ready';return;
      }
      if((remote?.revision ?? 0)!==current.revision) {this.phase='conflict';this.error='Another device changed your records. Export both versions, then choose which snapshot to keep.';return;}
      for(let attempt=0;attempt<5 && current.pendingId;attempt++) {
        const flight=current.inFlight ?? {id:current.pendingId,snapshot:{schemaVersion:1 as const,data:current.data,trash:current.trash},revision:current.revision};
        current.inFlight=flight;this.persist(current);
        const result=await cloud.write(flight.snapshot,flight.revision,flight.id);
        if(!this.active)return;
        validateSnapshot(result.record.snapshot);
        if(result.status==='conflict') {this.phase='conflict';this.error='Cloud records changed. Choose a version in Backup & Sync.';return;}
        this.acknowledge(flight.id,result.record);remote=result.record;current=this.read();
      }
      this.phase=current.pendingId?'pending':'ready';
    } catch(error) {if(this.active){this.phase='error';this.error=error instanceof Error?error.message:'Sync failed. Your changes remain saved locally.';}}
    finally {this.running=false;if(this.active)this.notify();}
  }
  async resolve(cloud:CloudAdapter,choice:'local'|'cloud') {
    const remote=await cloud.read();
    if(!this.active)throw new Error('Account changed.');
    if(remote)validateSnapshot(remote.snapshot);
    this.storage.setItem(`${this.key}:before-restore`,JSON.stringify(this.export()));
    const current=this.read();
    if(choice==='cloud') this.persist({...remote?.snapshot ?? {schemaVersion:1,data:emptyData(),trash:[]},revision:remote?.revision??0,pendingId:null,cloudKnown:true});
    else {current.revision=remote?.revision??0;current.cloudKnown=true;delete current.inFlight;current.pendingId=crypto.randomUUID();this.persist(current);}
    this.phase=choice==='cloud'?'ready':'pending';this.notify();if(choice==='local')await this.sync(cloud);
  }
}
export { resources };
