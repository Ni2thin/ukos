'use client';

import React, { useState, useEffect } from 'react';
import { DashboardProvider } from '@/context/DashboardContext';
import { initializeStorage, getStorageStatus, subscribeStorage } from '@/lib/storage';
import { useSyncExternalStore } from 'react';
import { Sidebar } from './Sidebar';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const storageStatus = useSyncExternalStore(subscribeStorage,getStorageStatus,getStorageStatus);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [storageError, setStorageError] = useState('');

  useEffect(() => {
    initializeStorage().then(() => setMounted(true)).catch(error => setStorageError(error instanceof Error ? error.message : 'Storage could not be opened.'));
    // Read cached theme or use system preference
    const storedTheme = localStorage.getItem('ukos_theme');
    if (storedTheme === 'light') {
      setIsDarkMode(false);
    } else {
      setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('ukos_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('ukos_theme', 'light');
    }
  }, [isDarkMode, mounted]);

  if (storageError) return <div role="alert" className="p-8 text-sm text-rose-500">UKOS could not open its saved records: {storageError}. Existing storage has been preserved; do not clear browser data.</div>;

  if (!mounted) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center select-none text-center">
        <h2 className="text-sm font-bold text-white tracking-wider">BOOTSTRAPPING UKOS</h2>
      </div>
    );
  }

  return (
    <DashboardProvider key={storageStatus.scope}>
      <div className="min-h-screen flex flex-col md:flex-row ukos-shell text-zinc-900 dark:text-white transition-colors duration-200 selection:bg-indigo-500/20">
        <Sidebar isDarkMode={isDarkMode} onToggleTheme={() => setIsDarkMode(!isDarkMode)} />
        <main className="ukos-main flex-1 min-w-0 p-5 md:p-8 lg:p-10 pb-24 md:pb-10 overflow-y-auto md:max-h-screen">
          {children}
        </main>
      </div>
    </DashboardProvider>
  );
};
