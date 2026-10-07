import React, { useState } from 'react';
import { Card, CardContent } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { 
  User, 
  Camera, 
  Copy, 
  Check, 
  Edit3, 
  Globe, 
  ShieldAlert, 
  Lock, 
  Hash, 
  Eye, 
  EyeOff,
  Phone
} from 'lucide-react';
import { UserProfile } from '@/lib/db';

interface ProfileCardProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => Promise<void>;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  onUpdateProfile,
}) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [obscuredFields, setObscuredFields] = useState<{ [key: string]: boolean }>({
    passportNo: true,
    niNumber: true,
    shareCode: true,
    brpNumber: true,
    nhsNumber: true,
  });

  // Form states
  const [fullName, setFullName] = useState(profile.fullName);
  const [passportNo, setPassportNo] = useState(profile.passportNo);
  const [niNumber, setNiNumber] = useState(profile.niNumber);
  const [shareCode, setShareCode] = useState(profile.shareCode);
  const [brpNumber, setBrpNumber] = useState(profile.brpNumber);
  const [nhsNumber, setNhsNumber] = useState(profile.nhsNumber);
  const [ukPhone, setUkPhone] = useState(profile.ukPhone);

  const handleCopy = (text: string, fieldName: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const handleToggleObscure = (field: string) => {
    setObscuredFields(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handlePfpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Data = event.target?.result as string;
        await onUpdateProfile({
          ...profile,
          pfp: base64Data
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fullName.trim()) {
      await onUpdateProfile({
        fullName: fullName.trim(),
        pfp: profile.pfp,
        passportNo: passportNo.trim(),
        niNumber: niNumber.trim(),
        shareCode: shareCode.trim(),
        brpNumber: brpNumber.trim(),
        nhsNumber: nhsNumber.trim(),
        ukPhone: ukPhone.trim(),
      });
      setIsEditOpen(false);
    }
  };

  const renderValue = (val: string, field: string) => {
    if (!val) return <span className="text-zinc-600 italic">Not set</span>;
    if (obscuredFields[field]) {
      return '•••• •••• ••••';
    }
    return val;
  };

  return (
    <Card className="select-none overflow-hidden" glow>
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-6 items-center lg:items-start">
          {/* Avatar Section */}
          <div className="relative group shrink-0">
            <div className="h-24 w-24 rounded-2xl border-2 border-zinc-200 dark:border-white/5 bg-zinc-100 dark:bg-zinc-900 overflow-hidden shadow-2xl flex items-center justify-center">
              {profile.pfp ? (
                <img src={profile.pfp} alt="PFP" className="h-full w-full object-cover" />
              ) : (
                <User className="h-12 w-12 text-zinc-500" />
              )}
            </div>
            {/* Hover overlay to change PFP */}
            <label className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity duration-200">
              <input
                type="file"
                accept="image/*"
                onChange={handlePfpChange}
                className="hidden"
              />
              <Camera className="h-6 w-6 text-white" />
            </label>
          </div>

          {/* Profile Details Container */}
          <div className="flex-1 space-y-4 w-full">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-3 border-b border-zinc-200 dark:border-white/5 pb-3.5">
              <div className="text-center sm:text-left">
                <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                  {profile.fullName || 'NITTHIN'}
                </h3>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold block mt-0.5">
                  UK Student Identity Vault & Keys
                </span>
              </div>
              
              <button
                onClick={() => {
                  setFullName(profile.fullName);
                  setPassportNo(profile.passportNo);
                  setNiNumber(profile.niNumber);
                  setShareCode(profile.shareCode);
                  setBrpNumber(profile.brpNumber);
                  setNhsNumber(profile.nhsNumber);
                  setUkPhone(profile.ukPhone);
                  setIsEditOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-md shadow-indigo-600/10"
              >
                <Edit3 className="h-3.5 w-3.5" /> Edit Profile Details
              </button>
            </div>

            {/* Profile Grid fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* FIELD 1: Passport */}
              <div className="p-3 bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-200 dark:border-white/5 rounded-xl space-y-1 relative">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">Passport Number</span>
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => handleToggleObscure('passportNo')}
                      className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                    >
                      {obscuredFields.passportNo ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    </button>
                    <button 
                      onClick={() => handleCopy(profile.passportNo, 'passportNo')}
                      className="text-zinc-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
                    >
                      {copiedField === 'passportNo' ? <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="text-xs font-bold font-mono text-zinc-900 dark:text-white tracking-wide">
                  {renderValue(profile.passportNo, 'passportNo')}
                </div>
              </div>

              {/* FIELD 2: NI Number */}
              <div className="p-3 bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-200 dark:border-white/5 rounded-xl space-y-1 relative">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">NI Number (Work & Tax)</span>
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => handleToggleObscure('niNumber')}
                      className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                    >
                      {obscuredFields.niNumber ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    </button>
                    <button 
                      onClick={() => handleCopy(profile.niNumber, 'niNumber')}
                      className="text-zinc-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
                    >
                      {copiedField === 'niNumber' ? <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="text-xs font-bold font-mono text-zinc-900 dark:text-white tracking-wide">
                  {renderValue(profile.niNumber, 'niNumber')}
                </div>
              </div>

              {/* FIELD 3: Share Code */}
              <div className="p-3 bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-200 dark:border-white/5 rounded-xl space-y-1 relative">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">Share Code (Employer Verification)</span>
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => handleToggleObscure('shareCode')}
                      className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                    >
                      {obscuredFields.shareCode ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    </button>
                    <button 
                      onClick={() => handleCopy(profile.shareCode, 'shareCode')}
                      className="text-zinc-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
                    >
                      {copiedField === 'shareCode' ? <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="text-xs font-bold font-mono text-indigo-600 dark:text-indigo-400 tracking-wide">
                  {renderValue(profile.shareCode, 'shareCode')}
                </div>
              </div>

              {/* FIELD 4: BRP Card Number */}
              <div className="p-3 bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-200 dark:border-white/5 rounded-xl space-y-1 relative">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">BRP Card Number</span>
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => handleToggleObscure('brpNumber')}
                      className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                    >
                      {obscuredFields.brpNumber ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    </button>
                    <button 
                      onClick={() => handleCopy(profile.brpNumber, 'brpNumber')}
                      className="text-zinc-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
                    >
                      {copiedField === 'brpNumber' ? <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="text-xs font-bold font-mono text-zinc-900 dark:text-white tracking-wide">
                  {renderValue(profile.brpNumber, 'brpNumber')}
                </div>
              </div>

              {/* FIELD 5: NHS NHS Number */}
              <div className="p-3 bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-200 dark:border-white/5 rounded-xl space-y-1 relative">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">GP / NHS Medical Number</span>
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => handleToggleObscure('nhsNumber')}
                      className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                    >
                      {obscuredFields.nhsNumber ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    </button>
                    <button 
                      onClick={() => handleCopy(profile.nhsNumber, 'nhsNumber')}
                      className="text-zinc-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
                    >
                      {copiedField === 'nhsNumber' ? <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="text-xs font-bold font-mono text-zinc-900 dark:text-white tracking-wide">
                  {renderValue(profile.nhsNumber, 'nhsNumber')}
                </div>
              </div>

              {/* FIELD 6: UK Phone */}
              <div className="p-3 bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-200 dark:border-white/5 rounded-xl space-y-1 relative">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">UK Mobile Number</span>
                  <button 
                    onClick={() => handleCopy(profile.ukPhone, 'ukPhone')}
                    className="text-zinc-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
                  >
                    {copiedField === 'ukPhone' ? <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <div className="text-xs font-bold text-zinc-900 dark:text-white tracking-wide flex items-center gap-1.5">
                  <Phone className="h-3 w-3 text-zinc-400 dark:text-zinc-500" /> {profile.ukPhone || <span className="text-zinc-500 dark:text-zinc-650 italic">Not set</span>}
                </div>
              </div>

            </div>
          </div>
        </div>
      </CardContent>

      {/* MODAL: Edit Profile */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Identity Profile Vault">
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Passport Number</label>
              <input
                type="text"
                value={passportNo}
                onChange={(e) => setPassportNo(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">NI Number (Work/Tax)</label>
              <input
                type="text"
                value={niNumber}
                onChange={(e) => setNiNumber(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Share Code</label>
              <input
                type="text"
                value={shareCode}
                onChange={(e) => setShareCode(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">BRP Card Number</label>
              <input
                type="text"
                value={brpNumber}
                onChange={(e) => setBrpNumber(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">GP / NHS Number</label>
              <input
                type="text"
                value={nhsNumber}
                onChange={(e) => setNhsNumber(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">UK Mobile Phone</label>
              <input
                type="text"
                value={ukPhone}
                onChange={(e) => setUkPhone(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors text-sm"
            >
              Securely Save Profile
            </button>
          </div>
        </form>
      </Modal>
    </Card>
  );
};
