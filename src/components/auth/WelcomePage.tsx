'use client';

import { useState, type FormEvent } from 'react';
import { ArrowUpRight, Eye, EyeOff, LockKeyhole, Wallet, CalendarDays, FolderOpen } from 'lucide-react';
import { supabase } from '@/lib/cloud';

export function WelcomePage({ onOpenLocal }: { onOpenLocal: () => void }) {
  const [creating, setCreating] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const configured = !!supabase;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || busy) return;
    setError(''); setMessage('');
    if (creating && password !== confirmation) { setError('Your passwords do not match.'); return; }
    setBusy(true);
    try {
      const credentials = { email: email.trim(), password };
      const result = creating
        ? await supabase.auth.signUp({ ...credentials, options: { emailRedirectTo: `${window.location.origin}/` } })
        : await supabase.auth.signInWithPassword(credentials);
      if (result.error) throw result.error;
      setPassword(''); setConfirmation('');
      if (creating && !result.data.session) {
        setMessage('Check your email for a confirmation link, then return here to sign in.');
        setCreating(false);
      } else {
        setMessage('Signed in. Opening your workspace…');
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to sign in. Please try again.');
    } finally { setBusy(false); }
  }

  return <div className="welcome-page">
    <header className="welcome-nav"><span className="brand-title">UK101<span className="welcome-brand-dot">.</span></span><span className="text-sm text-zinc-400">Your life in the UK, organised.</span></header>
    <main className="welcome-grid">
      <section className="welcome-story" aria-labelledby="welcome-title">
        <p className="welcome-eyebrow">A little clarity. Every day.</p>
        <h1 id="welcome-title">YOUR UK LIFE.<br/><span className="editorial-word">YOUR OWN SPACE.</span></h1>
        <p className="welcome-description">From your first day to your next big step. Bring your money, plans and important records together in one personal workspace.</p>
        <div className="welcome-features">
          {[{icon:Wallet,title:'Make money make sense',text:'Expenses, savings and loan planning.'},{icon:CalendarDays,title:'Stay one step ahead',text:'Keep your plans and deadlines together.'},{icon:FolderOpen,title:'Keep life in order',text:'Documents, notes and everyday essentials.'}].map(({icon:Icon,title,text})=><div key={title}><Icon aria-hidden="true" className="h-5 w-5"/><div><h2>{title}</h2><p>{text}</p></div></div>)}
        </div>
      </section>
      <section className="welcome-form-panel" aria-labelledby="auth-title">
        <div className="welcome-eyebrow flex items-center gap-2"><LockKeyhole aria-hidden="true" className="h-4 w-4"/>Your personal workspace</div>
        <h2 id="auth-title" className="page-title">{creating ? 'MAKE YOURSELF AT HOME.' : 'WELCOME BACK.'}</h2>
        <p className="text-sm text-zinc-400 mt-3 mb-7">{creating ? 'Create your account to start a workspace of your own.' : 'Sign in to pick up where you left off.'}</p>
        {!configured && <div className="welcome-notice" role="status"><strong>Accounts are coming online soon</strong><p>Sign-in and registration will be available once the site owner connects the account service. You can still open the local workspace on this device below.</p></div>}
        <form onSubmit={submit} className="space-y-5" aria-busy={busy}>
          <label className="block text-sm font-medium" htmlFor="login-username">Username <span className="font-normal text-zinc-400">(email address)</span>
            <input id="login-username" type="email" autoComplete="username" inputMode="email" required maxLength={254} disabled={!configured || busy} value={email} onChange={event=>setEmail(event.target.value)} placeholder="you@example.com" className="welcome-input"/>
          </label>
          <div><label className="block text-sm font-medium" htmlFor="login-password">Password</label><div className="relative">
            <input id="login-password" type={showPassword ? 'text' : 'password'} autoComplete={creating ? 'new-password' : 'current-password'} required minLength={creating ? 8 : undefined} maxLength={256} disabled={!configured || busy} value={password} onChange={event=>setPassword(event.target.value)} placeholder={creating ? 'At least 8 characters' : 'Enter your password'} className="welcome-input pr-14"/>
            <button type="button" disabled={!configured || busy} aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} onClick={()=>setShowPassword(!showPassword)} className="absolute right-3 top-3 p-1.5 text-zinc-400 disabled:opacity-40">{showPassword ? <EyeOff className="h-5 w-5"/> : <Eye className="h-5 w-5"/>}</button>
          </div></div>
          {creating && <label className="block text-sm font-medium" htmlFor="confirm-password">Confirm password<input id="confirm-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required minLength={8} maxLength={256} disabled={!configured || busy} value={confirmation} onChange={event=>setConfirmation(event.target.value)} className="welcome-input" placeholder="Enter your password again"/></label>}
          {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
          {message && <p role="status" className="text-sm text-emerald-300">{message}</p>}
          <button type="submit" disabled={!configured || busy} className="welcome-submit">{busy ? 'Please wait…' : creating ? 'Create account' : 'Sign in'}<ArrowUpRight aria-hidden="true" className="h-5 w-5"/></button>
        </form>
        <p className="text-sm text-zinc-400 mt-6">{creating ? 'Already have an account?' : 'New to UK101?'} <button type="button" disabled={busy} onClick={()=>{setCreating(!creating);setError('');setMessage('');setPassword('');setConfirmation('');setShowPassword(false);}} className="text-white underline underline-offset-4">{creating ? 'Sign in' : 'Create an account'}</button></p>
        {!configured && <div className="mt-7 border-t border-white/10 pt-5"><button onClick={onOpenLocal} className="text-sm text-indigo-400 underline underline-offset-4">Open this device’s local workspace</button><p className="text-xs text-zinc-400 mt-2">Local mode is shared by people using this browser. It is not a private user account.</p></div>}
      </section>
    </main>
    <footer className="welcome-footer">UK101 · A home for your everyday plans.</footer>
  </div>;
}
