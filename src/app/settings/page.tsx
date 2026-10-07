'use client';
import { useState, useSyncExternalStore } from 'react';
import { Download, Upload, RotateCcw, Cloud, ShieldCheck } from 'lucide-react';
import { getEngine, getStorageStatus, subscribeStorage, supabase, retrySync, cloudAdapter, resolveConflict } from '@/lib/storage';
import { validateSnapshot, resources, type Backup } from '@/lib/storage-schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
const button='rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40';
function download(value:unknown,name:string) {
  const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}));
  const link=document.createElement('a');link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export default function Settings() {
  const status=useSyncExternalStore(subscribeStorage,getStorageStatus,getStorageStatus);
  const [email,setEmail]=useState('');const [password,setPassword]=useState('');const [creating,setCreating]=useState(false);
  const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');const [error,setError]=useState('');
  const [preview,setPreview]=useState<Backup|null>(null);const [approved,setApproved]=useState(false);
  const [conflictChoice,setConflictChoice]=useState<'local'|'cloud'|null>(null);
  const engine=getEngine();const trash=engine.snapshot().trash;
  const action=async(fn:()=>Promise<void>|void)=>{setBusy(true);setError('');setMessage('');try{await fn();}catch(e){setError(e instanceof Error?e.message:'The operation failed. Your records have not been intentionally discarded.');}finally{setBusy(false);}};
  const filename=`ukos-backup-${new Date().toISOString().slice(0,10)}.json`;
  return <div className="max-w-4xl mx-auto space-y-6">
    <header className="page-header"><h2 className="page-title">Backup & Sync</h2><p className="mt-1 text-sm text-zinc-500">Protect your records, recover deleted entries, and sync your own account across devices.</p></header>
    {error&&<p role="alert" className="rounded-xl bg-rose-500/10 p-3 text-sm text-rose-500">{error}</p>}
    {message&&<p role="status" className="rounded-xl bg-emerald-500/10 p-3 text-sm text-emerald-600 dark:text-emerald-400">{message}</p>}
    <Card><CardHeader><CardTitle><span className="flex items-center gap-2"><Cloud className="h-4 w-4"/>Private cloud sync</span></CardTitle></CardHeader><CardContent className="space-y-4">
      <p className="text-sm text-zinc-500">Every change is saved on this device first. Pending changes retry automatically when online. Different-device edits are flagged for review instead of silently overwritten.</p>
      {!status.configured?<div className="rounded-xl border border-amber-500/20 p-4 text-sm space-y-2"><p className="font-bold text-amber-600">Cloud setup required</p><p>Backups and recovery work now. To activate cloud sync, create a Supabase project, run the included migration, and configure its public URL and publishable key.</p><p>See the repository’s README and supabase/SETUP.md for the exact steps. Never put a service-role key in this app.</p></div>:status.scope==='guest'?<form onSubmit={e=>{e.preventDefault();void action(async()=>{
        if(!supabase)return;
        const result=creating?await supabase.auth.signUp({email,password,options:{emailRedirectTo:`${window.location.origin}/settings`}}):await supabase.auth.signInWithPassword({email,password});
        if(result.error)throw result.error;setPassword('');setMessage(creating&&!result.data.session?'Check your email to confirm your account, then sign in.':'Signed in. Your private records are loading.');
      });}} className="space-y-3 max-w-md">
        <label className="block text-sm">Email<input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} className="mt-1 w-full rounded-lg border border-zinc-300 dark:border-white/10 bg-transparent p-2"/></label>
        <label className="block text-sm">Password<input type="password" autoComplete={creating?'new-password':'current-password'} required minLength={creating?8:undefined} value={password} onChange={e=>setPassword(e.target.value)} className="mt-1 w-full rounded-lg border border-zinc-300 dark:border-white/10 bg-transparent p-2"/></label>
        <div className="flex gap-3 items-center"><button className={button} disabled={busy}>{creating?'Create account':'Sign in'}</button><button type="button" onClick={()=>setCreating(!creating)} className="text-sm text-indigo-500">{creating?'Already have an account?':'Create an account'}</button></div>
        <p className="text-sm text-zinc-500">Local records stay separate from account records. Export a local backup, sign in, then restore it to upload those records to your account.</p>
      </form>:<div className="space-y-3">
        <p className="text-sm"><ShieldCheck className="inline h-4 w-4 mr-2 text-emerald-500"/>{status.email}</p>
        <p className="text-sm text-zinc-500">{status.phase==='ready'?'All changes synced':status.phase==='syncing'?'Syncing…':status.phase==='conflict'?'Conflict needs review':status.pending?'Changes pending upload':'Checking cloud records'}{!status.online?' · Offline':''}</p>
        {status.error&&<p role="status" className="text-sm text-amber-600 dark:text-amber-400">{status.error}</p>}
        <div className="flex flex-wrap gap-2"><button disabled={busy||status.phase==='syncing'} className={button} onClick={()=>void action(()=>retrySync())}>Retry sync</button><button disabled={busy} className="text-sm border border-zinc-300 dark:border-white/10 rounded-xl px-4 py-2" onClick={()=>void action(async()=>{const result=await supabase!.auth.signOut({scope:'local'});if(result.error)throw result.error;setMessage('Signed out. This account’s local records and pending uploads remain on this device.');})}>Sign out</button></div>
        {status.phase==='conflict'&&<div className="rounded-xl border border-amber-500/30 p-3 space-y-3 text-sm">
          <p>Two versions exist. Export your local backup and the cloud version before choosing. The selected snapshot replaces the other version; your local pre-change snapshot remains available below.</p>
          <button className={button} disabled={busy} onClick={()=>void action(async()=>{const record=await cloudAdapter().read();if(!record)throw new Error('No cloud snapshot found.');download({app:'UKOS',exportedAt:new Date().toISOString(),...record.snapshot},'ukos-cloud-backup.json');})}>Export cloud version</button>
          <div className="flex gap-4"><label><input type="radio" name="conflict" checked={conflictChoice==='local'} onChange={()=>setConflictChoice('local')}/> Keep this device’s version</label><label><input type="radio" name="conflict" checked={conflictChoice==='cloud'} onChange={()=>setConflictChoice('cloud')}/> Use cloud version</label></div>
          <button className={button} disabled={busy||!conflictChoice} onClick={()=>void action(async()=>{await resolveConflict(conflictChoice!);setConflictChoice(null);setMessage('Selected version applied. Review the sync status above.');})}>Apply selected version</button>
        </div>}
      </div>}
    </CardContent></Card>
    <Card><CardHeader><CardTitle>Export and restore</CardTitle></CardHeader><CardContent className="space-y-4">
      <p className="text-sm text-zinc-500">A backup includes all record collections, uploaded documents and recoverable deleted entries. It excludes login credentials and sync tokens. The JSON file is not encrypted and may contain identity and health data; store it privately.</p>
      <button className={button} disabled={busy} onClick={()=>void action(()=>{download(engine.export(),filename);setMessage('Backup download started. Keep the file somewhere private.');})}><Download className="inline h-3.5 w-3.5 mr-2"/>Export backup</button>
      <label className="block text-sm">Choose a UKOS backup<input type="file" accept="application/json,.json" disabled={busy} onChange={e=>{const file=e.target.files?.[0];setPreview(null);setApproved(false);if(!file)return;void action(async()=>{if(file.size>20*1024*1024)throw new Error('Choose a backup smaller than 20MB.');const value=JSON.parse(await file.text());if(value.app!=='UKOS')throw new Error('This is not a UKOS backup.');validateSnapshot(value);setPreview(value as Backup);});}} className="block mt-2 text-sm"/></label>
      {preview&&<div className="rounded-xl border border-indigo-500/20 p-4 space-y-3">
        <p className="text-sm font-bold">Restore preview · {preview.exportedAt||'Date unavailable'}</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">{resources.map(key=><span key={key}>{key.replaceAll('_',' ')}: {Array.isArray(preview.data[key])?(preview.data[key] as unknown[]).length:'1 record'}</span>)}<span>Recovery entries: {preview.trash.length}</span></div>
        <label className="flex gap-2 text-sm"><input type="checkbox" checked={approved} onChange={e=>setApproved(e.target.checked)}/><span>Replace this {status.scope==='guest'?'local workspace':'account’s records'} with the previewed backup. Signed-in records will be queued for cloud sync. A pre-restore snapshot will be saved locally.</span></label>
        <button className={button} disabled={!approved||busy} onClick={()=>void action(()=>{engine.restore(preview);setPreview(null);setApproved(false);setMessage('Backup restored locally. Signed-in changes are queued for sync.');})}><Upload className="inline h-3.5 w-3.5 mr-2"/>Restore this backup</button>
      </div>}
      {engine.previousBackup()&&<button className="text-sm text-indigo-500 underline" disabled={busy} onClick={()=>void action(()=>{setPreview(engine.previousBackup());setApproved(false);setMessage('Pre-restore snapshot loaded into the preview. Review it before applying.');})}>Review previous snapshot to undo a restore</button>}
    </CardContent></Card>
    <Card><CardHeader><CardTitle>Recover deleted entries</CardTitle></CardHeader><CardContent>
      <p className="text-sm text-zinc-500 mb-3">Deleted list entries stay here until recovered or replaced by a restored backup.</p>
      {trash.length===0?<p className="text-sm text-zinc-500">No deleted entries to recover.</p>:<div className="space-y-2">{trash.map(entry=><div key={entry.recoveryId} className="flex items-center justify-between gap-3 border border-zinc-200 dark:border-white/10 rounded-xl p-3"><div className="min-w-0"><p className="text-sm font-bold truncate">{String(entry.item.title||entry.item.name||entry.item.company||entry.item.subject||entry.item.month||entry.item.type||'Deleted entry')}</p><p className="text-xs text-zinc-500">{entry.resource.replaceAll('_',' ')} · {new Date(entry.deletedAt).toLocaleString()}</p></div><button disabled={busy} onClick={()=>void action(()=>{engine.recover(entry.recoveryId);setMessage('Entry recovered. Loan payment totals are updated when applicable.');})} className="text-sm text-indigo-500 shrink-0 flex items-center gap-1"><RotateCcw className="h-3 w-3"/>Recover</button></div>)}</div>}
    </CardContent></Card>
  </div>;
}
