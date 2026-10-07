import React, { useState } from 'react';
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
  HeartPulse
} from 'lucide-react';
import { supabase } from '@/lib/db';
import { useDashboard } from '@/context/DashboardContext';

interface SidebarProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isDarkMode, onToggleTheme }) => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { profile } = useDashboard();

  const navItems = [
    { name: 'Dashboard Overview', path: '/', icon: LayoutDashboard },
    { name: 'Finances & Logs', path: '/finances', icon: Wallet },
    { name: 'Savings & Planning', path: '/planning', icon: Compass },
    { name: 'Knowledge & Docs', path: '/documents', icon: FileText },
    { name: 'Tenancy & Renting', path: '/renting', icon: Home },
    { name: 'Job Board (Kanban)', path: '/jobs', icon: Briefcase },
    { name: 'NHS GP & Health', path: '/health', icon: HeartPulse }
  ];

  const handleToggleMobile = () => setMobileOpen(!mobileOpen);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-zinc-950/80 dark:bg-zinc-950/95 border-r border-white/5 backdrop-blur-2xl p-5 text-zinc-400 select-none">
      {/* Brand Header */}
      <div className="pb-6 border-b border-white/5 space-y-3">
        <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-1.5">
          UKOS <Sparkles className="h-4 w-4 text-indigo-400 fill-indigo-400" />
        </h1>
        {/* User Profile Pill */}
        <div className="flex items-center gap-2.5 p-2 bg-white/5 rounded-xl border border-white/5">
          {profile.pfp ? (
            <img src={profile.pfp} alt="PFP" className="h-7 w-7 rounded-lg object-cover shrink-0" />
          ) : (
            <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-lg shadow-indigo-600/10">
              {profile.fullName.charAt(0).toUpperCase() || 'N'}
            </div>
          )}
          <div className="min-w-0">
            <span className="text-xs font-black text-white block truncate uppercase tracking-wider">{profile.fullName || 'NITTHIN'}</span>
            <span className="text-[9px] text-zinc-500 font-semibold block leading-none">MSc Student Surrey</span>
          </div>
        </div>
      </div>

      {/* Nav Menu Links */}
      <nav className="flex-1 py-6 space-y-1.5">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                isActive 
                  ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/25 shadow-md shadow-indigo-600/5' 
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
        {/* DB Connection Indicator */}
        <div className="p-3 bg-zinc-900/40 rounded-xl border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {supabase ? (
              <>
                <Server className="h-3.5 w-3.5 text-emerald-400" />
                <div>
                  <span className="text-[10px] text-white font-bold block leading-none">Supabase DB</span>
                  <span className="text-[8px] text-emerald-400 font-medium">Sync Active</span>
                </div>
              </>
            ) : (
              <>
                <HardDrive className="h-3.5 w-3.5 text-amber-400" />
                <div>
                  <span className="text-[10px] text-white font-bold block leading-none">Local Sand</span>
                  <span className="text-[8px] text-amber-400 font-medium">Offline Storage</span>
                </div>
              </>
            )}
          </div>
          <span className={`h-1.5 w-1.5 rounded-full ${supabase ? 'bg-emerald-400 shadow-[0_0_6px_#10b981]' : 'bg-amber-400 shadow-[0_0_6px_#f59e0b]'}`} />
        </div>

        {/* Theme and clock control */}
        <div className="flex items-center justify-between">
          <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold">Theme</span>
          <button
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
            <div className="h-6 w-6 rounded-md bg-indigo-600 flex items-center justify-center text-[10px] font-black text-white shrink-0">
              {profile.fullName.charAt(0).toUpperCase() || 'N'}
            </div>
          )}
          <h1 className="text-sm font-black text-white tracking-tight truncate max-w-[150px]">
            {profile.fullName.toUpperCase() || 'NITTHIN'}'s UKOS
          </h1>
        </div>
        <button
          onClick={handleToggleMobile}
          className="p-2 rounded-lg bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white transition-colors"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Mobile sidebar overlay drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleToggleMobile}
          />
          {/* Drawer content */}
          <div className="relative w-64 max-w-[80vw] h-full z-50">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
