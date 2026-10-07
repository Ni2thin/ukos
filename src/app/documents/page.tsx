'use client';

import React from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { NotesWidget } from '@/components/dashboard/NotesWidget';
import { DocumentVault } from '@/components/dashboard/DocumentVault';
import { ProfileCard } from '@/components/dashboard/ProfileCard';

export default function DocumentsPage() {
  const {
    loading,
    notes,
    documents,
    profile,
    onSaveNote,
    onDeleteNote,
    onUploadDocument,
    onDeleteDocument,
    onUpdateProfile
  } = useDashboard();

  if (loading) return null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <header className="page-header">
        <h2 className="page-title">
          Knowledge & File Vault
        </h2>
        <p className="text-sm text-zinc-500">
          Maintain your university notes checklist, register Prof details and securely back up visa and passport credentials
        </p>
      </header>

      {/* Profile Identity Details Card */}
      <div className="w-full">
        <ProfileCard 
          profile={profile} 
          onUpdateProfile={onUpdateProfile} 
        />
      </div>

      {/* Asymmetrical Grid: Notes & Document Vault */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 flex flex-col justify-stretch">
          <NotesWidget
            notes={notes}
            onSaveNote={onSaveNote}
            onDeleteNote={onDeleteNote}
          />
        </div>
        <div className="lg:col-span-5 flex flex-col justify-stretch">
          <DocumentVault
            documents={documents}
            onUploadDocument={onUploadDocument}
            onDeleteDocument={onDeleteDocument}
          />
        </div>
      </div>
    </div>
  );
}
