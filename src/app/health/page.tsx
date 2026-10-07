'use client';

import React, { useState } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { 
  HeartPulse, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  ShieldAlert, 
  Plus, 
  Trash2, 
  Calendar, 
  Clock, 
  Pill, 
  Stethoscope, 
  Contact, 
  CheckCircle2, 
  Edit3
} from 'lucide-react';

export default function HealthPage() {
  const {
    gpDetails,
    prescriptions,
    appointments,
    emergencyContacts,
    onUpdateGPDetails,
    onSavePrescription,
    onDeletePrescription,
    onSaveMedicalAppointment,
    onDeleteMedicalAppointment,
    onSaveEmergencyContact,
    onDeleteEmergencyContact
  } = useDashboard();

  // Modals state
  const [isEditGPOpen, setIsEditGPOpen] = useState(false);
  const [isAddPrescriptionOpen, setIsAddPrescriptionOpen] = useState(false);
  const [isAddAppointmentOpen, setIsAddAppointmentOpen] = useState(false);
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);

  // GP Edit Form state
  const [gpName, setGpName] = useState(gpDetails.gpName);
  const [gpAddress, setGpAddress] = useState(gpDetails.gpAddress);
  const [gpPhone, setGpPhone] = useState(gpDetails.gpPhone);
  const [gpEmail, setGpEmail] = useState(gpDetails.gpEmail);
  const [gpStatus, setGpStatus] = useState<typeof gpDetails.status>(gpDetails.status);

  // Prescription Form state
  const [pName, setPName] = useState('');
  const [pDosage, setPDosage] = useState('');
  const [pFrequency, setPFrequency] = useState('');
  const [pRepeat, setPRepeat] = useState(false);
  const [pNotes, setPNotes] = useState('');

  // Appointment Form state
  const [apptProvider, setApptProvider] = useState<'GP' | 'Dentist' | 'Optician' | 'Other'>('GP');
  const [apptDoctor, setApptDoctor] = useState('');
  const [apptDate, setApptDate] = useState('');
  const [apptTime, setApptTime] = useState('');
  const [apptReason, setApptReason] = useState('');
  const [apptNotes, setApptNotes] = useState('');

  // Emergency Contact Form state
  const [cName, setCName] = useState('');
  const [cRelationship, setCRelationship] = useState('');
  const [cPhone, setCPhone] = useState('');
  const [cEmail, setCEmail] = useState('');

  // GP Submit
  const handleUpdateGP = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateGPDetails({
      gpName: gpName.trim(),
      gpAddress: gpAddress.trim(),
      gpPhone: gpPhone.trim(),
      gpEmail: gpEmail.trim(),
      status: gpStatus
    });
    setIsEditGPOpen(false);
  };

  // Prescription Submit
  const handleAddPrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName.trim()) return;

    await onSavePrescription({
      id: `pr-${Date.now()}`,
      name: pName.trim(),
      dosage: pDosage.trim(),
      frequency: pFrequency.trim(),
      repeat: pRepeat,
      notes: pNotes.trim()
    });

    setPName('');
    setPDosage('');
    setPFrequency('');
    setPRepeat(false);
    setPNotes('');
    setIsAddPrescriptionOpen(false);
  };

  // Appointment Submit
  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apptDoctor.trim() || !apptDate || !apptTime) return;

    await onSaveMedicalAppointment({
      id: `ma-${Date.now()}`,
      provider: apptProvider,
      doctor: apptDoctor.trim(),
      date: apptDate,
      time: apptTime,
      reason: apptReason.trim(),
      notes: apptNotes.trim()
    });

    setApptDoctor('');
    setApptDate('');
    setApptTime('');
    setApptReason('');
    setApptNotes('');
    setIsAddAppointmentOpen(false);
  };

  // Emergency Contact Submit
  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cName.trim() || !cPhone.trim()) return;

    await onSaveEmergencyContact({
      id: `ec-${Date.now()}`,
      name: cName.trim(),
      relationship: cRelationship.trim(),
      phone: cPhone.trim(),
      email: cEmail.trim() || undefined
    });

    setCName('');
    setCRelationship('');
    setCPhone('');
    setCEmail('');
    setIsAddContactOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <header className="flex flex-col gap-1 select-none">
        <h2 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">
          NHS GP & Medical Health Log
        </h2>
        <p className="text-xs text-zinc-500">
          UK health credentials dashboard. Keep track of GP surgery registrations, medical appointments, prescriptions, and emergencies
        </p>
      </header>

      {/* NHS GP Card and Emergency Contacts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* GP Surgery Card */}
        <div className="lg:col-span-7 flex flex-col justify-stretch">
          <Card className="h-full">
            <CardHeader className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <HeartPulse className="h-4.5 w-4.5 text-indigo-500" />
                <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider">GP Surgery Registration</h3>
              </div>
              <button 
                onClick={() => {
                  setGpName(gpDetails.gpName);
                  setGpAddress(gpDetails.gpAddress);
                  setGpPhone(gpDetails.gpPhone);
                  setGpEmail(gpDetails.gpEmail);
                  setGpStatus(gpDetails.status);
                  setIsEditGPOpen(true);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 transition-all"
              >
                <Edit3 className="h-3 w-3" /> Edit GP Info
              </button>
            </CardHeader>
            <CardContent className="space-y-4 py-4">
              <div className="flex justify-between items-start">
                <div className="space-y-0.5">
                  <h4 className="text-base font-black text-zinc-900 dark:text-white">{gpDetails.gpName || 'No Surgery Configured'}</h4>
                  <span className="text-xs text-zinc-500 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {gpDetails.gpAddress || 'N/A'}
                  </span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wide ${
                  gpDetails.status === 'Registered' 
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                    : gpDetails.status === 'Pending' 
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' 
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                }`}>
                  {gpDetails.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2 border-t border-zinc-200/60 dark:border-white/5">
                <div className="flex items-center gap-2.5 text-xs text-zinc-600 dark:text-zinc-300">
                  <Phone className="h-4 w-4 text-zinc-400" />
                  <span>Call: <strong className="font-bold text-zinc-900 dark:text-white">{gpDetails.gpPhone || 'N/A'}</strong></span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-zinc-600 dark:text-zinc-300">
                  <Mail className="h-4 w-4 text-zinc-400" />
                  <span>Email: <strong className="font-bold text-zinc-900 dark:text-white">{gpDetails.gpEmail || 'N/A'}</strong></span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Emergency Contacts */}
        <div className="lg:col-span-5 flex flex-col justify-stretch">
          <Card className="h-full">
            <CardHeader className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4.5 w-4.5 text-rose-500 animate-pulse" />
                <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider">Emergency Contacts</h3>
              </div>
              <button 
                onClick={() => setIsAddContactOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
              >
                <Plus className="h-3 w-3" /> Add
              </button>
            </CardHeader>
            <CardContent className="space-y-3 py-4 max-h-[200px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-800">
              {emergencyContacts.length === 0 ? (
                <div className="text-center text-xs text-zinc-500 py-6">No emergency contacts logged.</div>
              ) : (
                emergencyContacts.map(c => (
                  <div key={c.id} className="p-3 bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-200 dark:border-white/5 rounded-xl flex justify-between items-start relative group">
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <span className="text-xs font-bold text-zinc-900 dark:text-white block">{c.name}</span>
                      <span className="text-[9px] uppercase tracking-wider text-rose-500 font-bold block">{c.relationship}</span>
                      <div className="flex flex-wrap gap-x-3 text-[10px] text-zinc-500 pt-0.5">
                        <span>{c.phone}</span>
                        {c.email && <span>• {c.email}</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => onDeleteEmergencyContact(c.id)}
                      className="text-zinc-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Prescriptions and Appointments row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Prescriptions */}
        <div className="lg:col-span-6 flex flex-col justify-stretch">
          <Card className="h-full">
            <CardHeader className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Pill className="h-4.5 w-4.5 text-indigo-500" />
                <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider">Active Prescriptions</h3>
              </div>
              <button 
                onClick={() => setIsAddPrescriptionOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" /> Log Medicine
              </button>
            </CardHeader>
            <CardContent className="space-y-3.5 py-4 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-800">
              {prescriptions.length === 0 ? (
                <div className="text-center text-xs text-zinc-500 py-10">No active prescriptions logged.</div>
              ) : (
                prescriptions.map(p => (
                  <div key={p.id} className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-200 dark:border-white/5 space-y-1 relative group">
                    <button
                      onClick={() => onDeletePrescription(p.id)}
                      className="absolute top-3 right-3 text-zinc-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>

                    <div className="flex justify-between items-start pr-4">
                      <div>
                        <span className="text-xs font-bold text-zinc-900 dark:text-white block">{p.name}</span>
                        <span className="text-[10px] text-indigo-500 font-semibold">{p.dosage} — {p.frequency}</span>
                      </div>
                      {p.repeat && (
                        <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[8px] font-bold uppercase tracking-wider">
                          Repeat
                        </span>
                      )}
                    </div>
                    {p.notes && (
                      <p className="text-[9px] text-zinc-500 dark:text-zinc-400 pt-1 leading-relaxed border-t border-zinc-200/40 dark:border-white/5 mt-1.5">
                        {p.notes}
                      </p>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Appointments Tracker */}
        <div className="lg:col-span-6 flex flex-col justify-stretch">
          <Card className="h-full">
            <CardHeader className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Stethoscope className="h-4.5 w-4.5 text-amber-500" />
                <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider">Medical Appointments</h3>
              </div>
              <button 
                onClick={() => setIsAddAppointmentOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" /> Schedule
              </button>
            </CardHeader>
            <CardContent className="space-y-3.5 py-4 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-800">
              {appointments.length === 0 ? (
                <div className="text-center text-xs text-zinc-500 py-10">No upcoming clinical appointments scheduled.</div>
              ) : (
                appointments.map(a => (
                  <div key={a.id} className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-200 dark:border-white/5 space-y-2 relative group">
                    <button
                      onClick={() => onDeleteMedicalAppointment(a.id)}
                      className="absolute top-3 right-3 text-zinc-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>

                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <span className="text-[8px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
                          {a.provider}
                        </span>
                        <span className="text-xs font-bold text-zinc-900 dark:text-white block pt-1">{a.doctor}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-zinc-900 dark:text-white block flex items-center gap-1 justify-end">
                          <Calendar className="h-3 w-3 text-zinc-400" /> {a.date}
                        </span>
                        <span className="text-[9px] text-zinc-400 flex items-center gap-1 justify-end">
                          <Clock className="h-3 w-3" /> {a.time}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-zinc-200/60 dark:border-white/5 text-[9px] text-zinc-550 dark:text-zinc-400 leading-normal">
                      <div><strong>Reason:</strong> {a.reason}</div>
                      {a.notes && <div className="mt-0.5"><strong>Notes:</strong> {a.notes}</div>}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

      </div>

      {/* MODAL 1: Edit GP surgery */}
      <Modal isOpen={isEditGPOpen} onClose={() => setIsEditGPOpen(false)} title="Update GP Surgery Info">
        <form onSubmit={handleUpdateGP} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">GP Surgery Name</label>
            <input
              type="text"
              required
              value={gpName}
              onChange={e => setGpName(e.target.value)}
              placeholder="e.g. Surrey Health Centre"
              className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Surgery Address</label>
            <input
              type="text"
              required
              value={gpAddress}
              onChange={e => setGpAddress(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Surgery Phone Number</label>
              <input
                type="text"
                value={gpPhone}
                onChange={e => setGpPhone(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Registration Status</label>
              <select
                value={gpStatus}
                onChange={e => setGpStatus(e.target.value as any)}
                className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Registered">Registered</option>
                <option value="Pending">Pending / In Review</option>
                <option value="Not Registered">Not Registered</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">NHS GP Email (Optional)</label>
            <input
              type="email"
              value={gpEmail}
              onChange={e => setGpEmail(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors text-sm"
            >
              Save GP Details
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Log Medicine Prescription */}
      <Modal isOpen={isAddPrescriptionOpen} onClose={() => setIsAddPrescriptionOpen(false)} title="Log New Prescription">
        <form onSubmit={handleAddPrescription} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Medicine Name</label>
            <input
              type="text"
              required
              value={pName}
              onChange={e => setPName(e.target.value)}
              placeholder="e.g. Albuterol Inhaler, Cetirizine"
              className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Dosage Amount</label>
              <input
                type="text"
                required
                value={pDosage}
                onChange={e => setPDosage(e.target.value)}
                placeholder="e.g. 10mg / 1 tablet"
                className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Frequency</label>
              <input
                type="text"
                required
                value={pFrequency}
                onChange={e => setPFrequency(e.target.value)}
                placeholder="e.g. Once daily, twice daily"
                className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 py-1 select-none">
            <input
              type="checkbox"
              id="repeat"
              checked={pRepeat}
              onChange={e => setPRepeat(e.target.checked)}
              className="rounded border-zinc-200 dark:border-white/10 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="repeat" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer">
              Is this a Repeat Prescription? (Requires regular re-order)
            </label>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Medication Notes</label>
            <textarea
              value={pNotes}
              onChange={e => setPNotes(e.target.value)}
              placeholder="e.g. Take after breakfast. Side effects alerts..."
              rows={3}
              className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors text-sm"
            >
              Add Medication
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: Schedule Appointment */}
      <Modal isOpen={isAddAppointmentOpen} onClose={() => setIsAddAppointmentOpen(false)} title="Schedule Medical Appointment">
        <form onSubmit={handleAddAppointment} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Clinical Provider</label>
              <select
                value={apptProvider}
                onChange={e => setApptProvider(e.target.value as any)}
                className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="GP">NHS GP Clinic</option>
                <option value="Dentist">Dentist</option>
                <option value="Optician">Optician</option>
                <option value="Other">Other Specialist / Hospital</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Doctor/Dentist Name</label>
              <input
                type="text"
                required
                value={apptDoctor}
                onChange={e => setApptDoctor(e.target.value)}
                placeholder="e.g. Dr. Finch"
                className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Appointment Date</label>
              <input
                type="date"
                required
                value={apptDate}
                onChange={e => setApptDate(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Appointment Time</label>
              <input
                type="time"
                required
                value={apptTime}
                onChange={e => setApptTime(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Reason for Visit</label>
            <input
              type="text"
              required
              value={apptReason}
              onChange={e => setApptReason(e.target.value)}
              placeholder="e.g. Back pain consultation, routine dental checkup"
              className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Additional Instructions</label>
            <textarea
              value={apptNotes}
              onChange={e => setApptNotes(e.target.value)}
              placeholder="e.g. Park in Zone B. Bring NHSC registration slip..."
              rows={2}
              className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors text-sm"
            >
              Schedule Appointment
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 4: Log Emergency Contact */}
      <Modal isOpen={isAddContactOpen} onClose={() => setIsAddContactOpen(false)} title="Log Emergency Contact">
        <form onSubmit={handleAddContact} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Full Name</label>
              <input
                type="text"
                required
                value={cName}
                onChange={e => setCName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Relationship</label>
              <input
                type="text"
                required
                value={cRelationship}
                onChange={e => setCRelationship(e.target.value)}
                placeholder="e.g. Brother, Friend, Local Guardian"
                className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Phone Number</label>
              <input
                type="text"
                required
                value={cPhone}
                onChange={e => setCPhone(e.target.value)}
                placeholder="e.g. +44 7700 900088"
                className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Email Address (Optional)</label>
              <input
                type="email"
                value={cEmail}
                onChange={e => setCEmail(e.target.value)}
                placeholder="e.g. email@address.com"
                className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors text-sm"
            >
              Add Emergency Contact
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
