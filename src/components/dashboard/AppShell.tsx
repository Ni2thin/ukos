'use client';

import React, { useState, useEffect } from 'react';
import { DashboardProvider } from '@/context/DashboardContext';
import { Sidebar } from './Sidebar';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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

  if (!mounted) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center select-none text-center">
        <h2 className="text-sm font-bold text-white tracking-wider">BOOTSTRAPPING UKOS</h2>
      </div>
    );
  }

  return (
    <DashboardProvider>
      <div className="min-h-screen flex flex-col md:flex-row bg-[#fcfcfd] dark:bg-[#030303] text-zinc-900 dark:text-white transition-colors duration-200 selection:bg-indigo-500/20">
        <Sidebar isDarkMode={isDarkMode} onToggleTheme={() => setIsDarkMode(!isDarkMode)} />
        <main className="flex-1 min-w-0 p-4 md:p-6 overflow-y-auto max-h-screen scrollbar-thin scrollbar-thumb-zinc-800">
          {children}
        </main>
      </div>
    </DashboardProvider>
  );
};
