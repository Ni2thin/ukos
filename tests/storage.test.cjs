const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');const ts=require('typescript');
const cache={};
function load(name){
  if(cache[name])return cache[name];
  const module={exports:{}};cache[name]=module.exports;
  const code=ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/lib',name+'.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2021}}).outputText;
  new Function('require','module','exports',code)(id=>id.startsWith('./')?load(id.slice(2)):require(id),module,module.exports);
  return cache[name]=module.exports;
}
const {StorageEngine}=load('storage-engine');const {defaults,emptyData,validateSnapshot}=load('storage-schema');
class MemoryStorage {entries=new Map();getItem(key){return this.entries.get(key)||null;}setItem(key,value){this.entries.set(key,value);}}
const fixture=()=>({memory:new MemoryStorage(),data:structuredClone(defaults)});
function cloud(){let record=null;let writes=0;return{get record(){return record;},set record(value){record=value;},get writes(){return writes;},async read(){return structuredClone(record);},async write(snapshot,revision,id){writes++;if(record?.mutationId===id)return{status:'saved',record:structuredClone(record)};if((record?.revision||0)!==revision)return{status:'conflict',record:structuredClone(record)};record={snapshot:structuredClone(snapshot),revision:revision+1,mutationId:id};return{status:'saved',record:structuredClone(record)};}};}
test('backup round-trip preserves every collection, document bytes and recoverable entries',()=>{
 const {memory,data}=fixture();data.documents[0].fileData='data:application/pdf;base64,dGVzdA==';
 const source=new StorageEngine(memory,'guest',data);source.replaceList('notes',data.notes.slice(1));
 const backup=source.export();assert.equal(backup.trash.length,1);assert.equal(backup.app,'UKOS');assert.equal(backup.pendingId,undefined);
 const target=new StorageEngine(new MemoryStorage(),'user-b',emptyData());target.restore(backup);
 assert.deepEqual(target.snapshot(),source.snapshot());assert.ok(target.pending());assert.ok(target.previousBackup());
 target.restore(target.previousBackup());assert.equal(target.get('notes').length,0);
});
test('invalid and duplicate backup records are rejected without altering current records',()=>{
 const {memory,data}=fixture();const store=new StorageEngine(memory,'guest',data);const before=store.export();
 const invalid=structuredClone(before);invalid.data.expenses[0].amountGbp=-1;
 assert.throws(()=>store.restore(invalid),/Invalid/);assert.deepEqual(store.snapshot().data,before.data);
 const duplicate=structuredClone(before);duplicate.data.notes.push(duplicate.data.notes[0]);assert.throws(()=>validateSnapshot(duplicate),/Duplicate/);
 const prototype=structuredClone(before);prototype.data.user_profile.constructor='bad';assert.throws(()=>validateSnapshot(prototype),/Invalid/);
});
test('deletion and recovery retain records, and loan totals change atomically',()=>{
 const {memory,data}=fixture();const store=new StorageEngine(memory,'guest',data);const tx=data.loan_transactions[0];
 store.mutate((records,trash)=>{records.loan_transactions=records.loan_transactions.filter(item=>item.id!==tx.id);records.loan_details.amountRepaidInr-=tx.amountInr;trash.push({recoveryId:'recovery-test',resource:'loan_transactions',item:tx,deletedAt:new Date().toISOString()});});
 store.recover('recovery-test');assert.deepEqual(store.get('loan_details'),data.loan_details);assert.equal(store.get('loan_transactions').length,data.loan_transactions.length);assert.equal(store.snapshot().trash.length,0);
});
test('offline changes survive restart and upload when connection returns',async()=>{
 const {memory,data}=fixture();let store=new StorageEngine(memory,'user-a',data);store.mutate(records=>records.user_profile.fullName='Offline edit');
 await store.sync({read:async()=>{throw new Error('offline');},write:async()=>{throw new Error('offline');}});assert.equal(store.phase,'error');assert.ok(store.pending());
 store=new StorageEngine(memory,'user-a',emptyData());const remote=cloud();await store.sync(remote);assert.equal(remote.record.snapshot.data.user_profile.fullName,'Offline edit');assert.equal(store.phase,'ready');assert.equal(store.pending(),false);
});
test('new edits during upload are not acknowledged as if already uploaded',async()=>{
 const {memory,data}=fixture();const store=new StorageEngine(memory,'user-a',data);store.mutate(records=>records.user_profile.fullName='First');
 const remote=cloud();const original=remote.write.bind(remote);let edited=false;
 remote.write=async(...args)=>{if(!edited){edited=true;store.mutate(records=>records.user_profile.fullName='Second');}return original(...args);};
 await store.sync(remote);assert.equal(remote.writes,2);assert.equal(remote.record.snapshot.data.user_profile.fullName,'Second');assert.equal(store.pending(),false);
});
test('lost acknowledgement is retried idempotently rather than uploading twice',async()=>{
 const {memory,data}=fixture();let store=new StorageEngine(memory,'user-a',data);store.mutate(records=>records.user_profile.fullName='Saved once');const remote=cloud();const write=remote.write.bind(remote);
 remote.write=async(...args)=>{await write(...args);throw new Error('response lost');};await store.sync(remote);assert.ok(store.pending());
 store=new StorageEngine(memory,'user-a',emptyData());remote.write=write;await store.sync(remote);assert.equal(remote.record.revision,1);assert.equal(remote.writes,1);assert.equal(store.pending(),false);
});
test('different-device changes are flagged, and explicit resolution preserves the old local version',async()=>{
 const {memory,data}=fixture();const store=new StorageEngine(memory,'user-a',data);const remote=cloud();await store.sync(remote);store.mutate(records=>records.user_profile.fullName='Local edit');
 remote.record={snapshot:{schemaVersion:1,data:structuredClone(data),trash:[]},revision:4,mutationId:'other-device'};
 remote.record.snapshot.data.user_profile.fullName='Cloud edit';await store.sync(remote);assert.equal(store.phase,'conflict');assert.equal(store.get('user_profile').fullName,'Local edit');
 await store.resolve(remote,'cloud');assert.equal(store.get('user_profile').fullName,'Cloud edit');assert.equal(store.previousBackup().data.user_profile.fullName,'Local edit');
});
test('account scopes cannot read each other’s local records',()=>{
 const memory=new MemoryStorage();const a=new StorageEngine(memory,'user-a',emptyData());a.mutate(data=>data.user_profile.fullName='Private A');
 const b=new StorageEngine(memory,'user-b',emptyData());assert.equal(b.get('user_profile').fullName,'My UKOS');assert.equal(a.get('user_profile').fullName,'Private A');
});
test('quota failure leaves old snapshot and outbox intact',()=>{
 const {memory,data}=fixture();const store=new StorageEngine(memory,'user-a',data);const before=memory.getItem(store.key);memory.setItem=()=>{throw new Error('quota');};
 assert.throws(()=>store.mutate(data=>data.user_profile.fullName='Unsaved'),/quota/);assert.equal(memory.getItem(store.key),before);
});
