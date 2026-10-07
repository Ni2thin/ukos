import React, { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Wallet,
  Compass,
  FileText,
  Menu,
  X,
  Sun,
  Moon,
  Server,
  HardDrive,
  Sparkles,
  Home,
  Briefcase,
  HeartPulse,
  ShieldCheck
} from 'lucide-react';
import { getStorageStatus, subscribeStorage } from '@/lib/storage';
import { useDashboard } from '@/context/DashboardContext';

interface SidebarProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isDarkMode, onToggleTheme }) => {
  const pathname = usePathname();
  const sync = useSyncExternalStore(subscribeStorage,getStorageStatus,getStorageStatus);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { profile } = useDashboard();

  const navItems = [
    { name: 'Overview', path: '/', icon: LayoutDashboard },
    { name: 'Money', path: '/finances', icon: Wallet },
    { name: 'Planning', path: '/planning', icon: Compass },
    { name: 'Documents', path: '/documents', icon: FileText },
    { name: 'Home & renting', path: '/renting', icon: Home },
    { name: 'Jobs', path: '/jobs', icon: Briefcase },
    { name: 'Health', path: '/health', icon: HeartPulse },
    { name: 'Backup & Sync', path: '/settings', icon: ShieldCheck }
  ];

  const handleToggleMobile = () => setMobileOpen(!mobileOpen);

  const sidebarContent = (
    <div className="sidebar-panel flex flex-col h-full overflow-y-auto bg-zinc-950/80 dark:bg-zinc-950/95 border-r border-white/5 backdrop-blur-2xl p-5 text-zinc-400 select-none">
      {/* Brand Header */}
      <div className="pb-6 border-b border-white/5 space-y-3">
        <h1 className="brand-title text-white flex items-center gap-1.5">
          UKOS <Sparkles className="h-4 w-4 text-indigo-400 fill-indigo-400" />
        </h1>
        {/* User Profile Pill */}
        <div className="flex items-center gap-2.5 p-2 bg-white/5 rounded-xl border border-white/5">
          {profile.pfp ? (
            <img src={profile.pfp} alt="PFP" className="h-7 w-7 rounded-lg object-cover shrink-0" />
          ) : (
            <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-lg shadow-indigo-600/10">
              {profile.fullName.charAt(0).toUpperCase() || 'N'}
            </div>
          )}
          <div className="min-w-0">
            <span className="text-sm font-black text-white block truncate uppercase tracking-wider">{profile.fullName || 'NITTHIN'}</span>
            <span className="text-xs text-zinc-500 font-semibold block leading-none">MSc Student Surrey</span>
          </div>
        </div>
      </div>

      {/* Nav Menu Links */}
      <nav aria-label="Main navigation" className="flex-1 py-6 space-y-1.5">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-400 px-3 mb-4">Your workspace</p>
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              href={item.path}
              aria-current={isActive ? "page" : undefined}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold tracking-wide transition-all ${
                isActive
                  ? 'bg-white/5 text-white border-l-2 border-indigo-400'
                  : 'hover:bg-white/5 hover:text-white border border-transparent'
              }`}
            >
              <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-indigo-400' : 'text-zinc-500'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer Docks */}
      <div className="border-t border-white/5 pt-4 space-y-4">
        <Link href="/settings" className="p-3 bg-zinc-900/40 rounded-xl border border-white/5 flex items-center gap-2">
          {sync.scope==='guest'?<HardDrive className="h-3.5 w-3.5 text-amber-400"/>:<Server className="h-3.5 w-3.5 text-indigo-400"/>}
          <div><span className="text-xs text-white font-bold block">{sync.scope==='guest'?'Local records':'Private account'}</span>
          <span className={`text-xs ${sync.phase==='ready'?'text-emerald-400':'text-amber-400'}`}>
            {sync.scope==='guest'?'Backup & sign-in':!sync.online?'Offline · saved locally':sync.phase==='syncing'?'Syncing…':sync.phase==='conflict'?'Conflict · review needed':sync.phase==='error'?'Sync failed · retrying':sync.pending?'Pending upload':sync.phase==='ready'?'All changes synced':'Checking cloud records'}
          </span></div>
        </Link>

        {/* Theme and clock control */}
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-zinc-500 font-bold">Theme</span>
          <button
            aria-label={isDarkMode ? "Switch to light theme" : "Switch to dark theme"}
            onClick={onToggleTheme}
            className="p-1.5 rounded-lg bg-zinc-900 border border-white/10 hover:border-white/20 text-zinc-400 hover:text-white transition-all duration-200"
          >
            {isDarkMode ? <Sun className="h-3.5 w-3.5 text-amber-400" /> : <Moon className="h-3.5 w-3.5 text-zinc-400" />}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar wrapper */}
      <aside className="hidden md:block w-64 shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile top bar navigation header */}
      <header className="md:hidden flex justify-between items-center bg-zinc-950/80 border-b border-white/5 p-4 backdrop-blur-xl sticky top-0 z-40 select-none">
        <div className="flex items-center gap-2">
          {profile.pfp ? (
            <img src={profile.pfp} alt="PFP" className="h-6 w-6 rounded-md object-cover shrink-0" />
          ) : (
            <div className="h-6 w-6 rounded-md bg-indigo-600 flex items-center justify-center text-xs font-black text-white shrink-0">
              {profile.fullName.charAt(0).toUpperCase() || 'N'}
            </div>
          )}
          <h1 className="text-sm font-black text-white tracking-tight truncate max-w-[150px]">
            {profile.fullName.toUpperCase() || 'NITTHIN'}'s UKOS
          </h1>
        </div>
        <button
          aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={mobileOpen}
          onClick={handleToggleMobile}
          className="p-2 rounded-lg bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white transition-colors"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      <nav aria-label="Quick navigation" className="mobile-dock md:hidden">
        {navItems.slice(0, 4).map(item => <Link key={item.path} href={item.path} aria-current={pathname === item.path ? 'page' : undefined}><item.icon className="h-5 w-5" /><span>{item.name}</span></Link>)}
      </nav>
      {/* Mobile sidebar overlay drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleToggleMobile}
          />
          {/* Drawer content */}
          <div className="relative w-72 max-w-[85vw] h-full z-50">
            <button onClick={() => setMobileOpen(false)} aria-label="Close navigation" className="absolute right-4 top-5 z-50 text-white p-2"><X className="h-5 w-5" /></button>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
