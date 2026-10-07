'use client';

import React, { useState } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { 
  Briefcase, 
  Plus, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  FileText,
  DollarSign
} from 'lucide-react';

const COLUMNS = [
  { id: 'Applied', name: 'Applied', color: 'border-zinc-200 dark:border-white/10 text-zinc-500 bg-zinc-50/50 dark:bg-zinc-900/10' },
  { id: 'Shortlisted', name: 'Shortlisted', color: 'border-blue-500/20 text-blue-500 bg-blue-500/5' },
  { id: 'Interview', name: 'Interviewing', color: 'border-amber-500/25 text-amber-500 bg-amber-500/5' },
  { id: 'Offered', name: 'Offered', color: 'border-emerald-500/20 text-emerald-500 bg-emerald-500/5' },
  { id: 'Rejected', name: 'Rejected', color: 'border-rose-500/20 text-rose-500 bg-rose-500/5' }
] as const;

export default function JobsPage() {
  const {
    jobApplications,
    notes,
    onSaveJobApplication,
    onDeleteJobApplication
  } = useDashboard();

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form states
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [salaryGbp, setSalaryGbp] = useState(0);
  const [sponsorship, setSponsorship] = useState<'Yes' | 'No' | 'Unsure'>('Yes');
  const [status, setStatus] = useState<typeof COLUMNS[number]['id']>('Applied');
  const [cvLink, setCvLink] = useState('');
  const [notesText, setNotesText] = useState('');

  // Metrics details
  const totalApps = jobApplications.length;
  const offeredApps = jobApplications.filter(j => j.status === 'Offered').length;
  const interviewingApps = jobApplications.filter(j => j.status === 'Interview').length;
  const pendingApps = jobApplications.filter(j => j.status === 'Applied' || j.status === 'Shortlisted').length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !role.trim()) return;

    await onSaveJobApplication({
      id: `job-${Date.now()}`,
      company: company.trim(),
      role: role.trim(),
      salaryGbp: Number(salaryGbp),
      sponsorship,
      status,
      dateApplied: new Date().toISOString().split('T')[0],
      cvLink,
      notes: notesText.trim()
    });

    // Reset
    setCompany('');
    setRole('');
    setSalaryGbp(0);
    setSponsorship('Yes');
    setStatus('Applied');
    setCvLink('');
    setNotesText('');
    setIsAddOpen(false);
  };

  const handleUpdateStatus = async (id: string, nextStatus: typeof COLUMNS[number]['id']) => {
    const app = jobApplications.find(j => j.id === id);
    if (!app) return;
    await onSaveJobApplication({
      ...app,
      status: nextStatus
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="page-header">
        <h2 className="page-title">
          Job & Internship Application Board
        </h2>
        <p className="text-sm text-zinc-500">
          Track Graduate Schemes, internships, and part-time jobs. Keep notes and monitor visa sponsorship status
        </p>
      </header>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/5 rounded-2xl">
          <span className="text-xs uppercase font-bold tracking-wider text-zinc-500">Total Applications</span>
          <div className="text-2xl font-black text-zinc-900 dark:text-white mt-1">{totalApps}</div>
        </div>
        <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/5 rounded-2xl">
          <span className="text-xs uppercase font-bold tracking-wider text-zinc-500">Interviews Call</span>
          <div className="text-2xl font-black text-amber-500 mt-1">{interviewingApps}</div>
        </div>
        <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/5 rounded-2xl">
          <span className="text-xs uppercase font-bold tracking-wider text-zinc-500">Offers Secured</span>
          <div className="text-2xl font-black text-emerald-500 mt-1">{offeredApps}</div>
        </div>
        <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/5 rounded-2xl">
          <span className="text-xs uppercase font-bold tracking-wider text-zinc-500">Awaiting Response</span>
          <div className="text-2xl font-black text-indigo-500 mt-1">{pendingApps}</div>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-950/20 border border-zinc-200 dark:border-white/5 p-4 rounded-2xl">
        <span className="text-sm font-bold text-zinc-500">Kanban Board Mode</span>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-md shadow-indigo-600/10"
        >
          <Plus className="h-4 w-4" /> Add Application
        </button>
      </div>

      {/* Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
        {COLUMNS.map(col => {
          const colApps = jobApplications.filter(j => j.status === col.id);
          return (
            <div 
              key={col.id} 
              className={`p-3 rounded-2xl border ${col.color} space-y-3.5 min-h-[300px] flex flex-col`}
            >
              {/* Column Header */}
              <div className="flex justify-between items-center pb-2 border-b border-zinc-200/40 dark:border-white/5">
                <span className="text-sm font-black uppercase tracking-wider">{col.name}</span>
                <span className="h-5 w-5 rounded-full bg-zinc-200/50 dark:bg-zinc-900/50 text-xs font-black flex items-center justify-center text-zinc-600 dark:text-zinc-400">
                  {colApps.length}
                </span>
              </div>

              {/* Cards list */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[500px] pr-0.5 scrollbar-thin">
                {colApps.length === 0 ? (
                  <div className="text-center text-xs text-zinc-400 py-10 italic">Empty stack</div>
                ) : (
                  colApps.map(app => (
                    <div 
                      key={app.id} 
                      className="p-3 bg-white dark:bg-zinc-950/40 border border-zinc-200 dark:border-white/5 rounded-xl space-y-2.5 relative group hover:border-indigo-500/20 transition-all shadow-sm"
                    >
                      {/* Delete Icon */}
                      <button
                        onClick={() => onDeleteJobApplication(app.id)}
                        className="absolute top-2.5 right-2.5 text-zinc-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all duration-200"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>

                      {/* Job Header */}
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-zinc-400 block truncate max-w-[80%]">{app.company}</span>
                        <span className="text-sm font-black text-zinc-950 dark:text-white block truncate max-w-[90%] leading-tight">{app.role}</span>
                      </div>

                      {/* Badges / Metrics info */}
                      <div className="flex flex-wrap gap-1 items-center">
                        <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 text-xs font-bold text-zinc-500">
                          {app.salaryGbp > 100 ? `£${app.salaryGbp.toLocaleString()}` : `£${app.salaryGbp}/hr`}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${
                          app.sponsorship === 'Yes' 
                            ? 'bg-emerald-500/10 text-emerald-600' 
                            : app.sponsorship === 'No' 
                            ? 'bg-rose-500/10 text-rose-600' 
                            : 'bg-zinc-500/10 text-zinc-600'
                        }`}>
                          Sponsor: {app.sponsorship}
                        </span>
                      </div>

                      {/* Description & CV note details */}
                      {app.notes && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-normal line-clamp-3 bg-zinc-50/50 dark:bg-zinc-950/20 p-1.5 rounded-lg border border-zinc-200/40 dark:border-white/5">
                          {app.notes}
                        </p>
                      )}

                      {/* Linked Note Link */}
                      {app.cvLink && (
                        <div className="flex items-center gap-1 text-xs font-bold text-indigo-500">
                          <FileText className="h-3 w-3 shrink-0" /> Linked: <span className="underline truncate max-w-[100px]">{app.cvLink}</span>
                        </div>
                      )}

                      {/* Actions footer */}
                      <div className="pt-2 border-t border-zinc-150 dark:border-white/5 flex items-center justify-between">
                        <span className="text-xs text-zinc-400 font-mono">{app.dateApplied}</span>
                        <select
                          value={app.status}
                          onChange={e => handleUpdateStatus(app.id, e.target.value as any)}
                          className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded px-1 py-0.5 text-xs font-bold text-zinc-600 dark:text-zinc-400 focus:outline-none"
                        >
                          <option value="Applied">Applied</option>
                          <option value="Shortlisted">Shortlisted</option>
                          <option value="Interview">Interview</option>
                          <option value="Offered">Offered</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: Add Application */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Log Job Application">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Company Name</label>
              <input
                type="text"
                required
                value={company}
                onChange={e => setCompany(e.target.value)}
                placeholder="e.g. Amazon UK, Barclays"
                className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Job Role/Title</label>
              <input
                type="text"
                required
                value={role}
                onChange={e => setRole(e.target.value)}
                placeholder="e.g. Graduate Consultant"
                className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Salary (Annual £ or Hourly)</label>
              <input
                type="number"
                value={salaryGbp || ''}
                onChange={e => setSalaryGbp(Number(e.target.value))}
                placeholder="e.g. 45000 or 12.50"
                className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Visa Sponsorship Provided?</label>
              <select
                value={sponsorship}
                onChange={e => setSponsorship(e.target.value as any)}
                className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Yes">Yes (Sponsorship Available)</option>
                <option value="No">No (Student Working Hours / N/A)</option>
                <option value="Unsure">Unsure / Ask during interview</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Application Stage</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Applied">Applied</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="Interview">Interviewing</option>
                <option value="Offered">Offered</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Link CV Document Note</label>
              <select
                value={cvLink}
                onChange={e => setCvLink(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="">-- No linked document --</option>
                {notes.map(note => (
                  <option key={note.id} value={note.title}>{note.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Notes & Reminders</label>
            <textarea
              value={notesText}
              onChange={e => setNotesText(e.target.value)}
              placeholder="e.g. Interview preparation questions, login details, recruiter names..."
              rows={3}
              className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors text-sm"
            >
              Log Application Details
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
