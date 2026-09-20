import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  User,
  IndianRupee,
  Bot,
  RotateCcw,
  Save,
  Sparkles,
  Phone,
  MapPin,
  Briefcase,
  ShieldCheck,
  Globe,
} from 'lucide-react';
import { api } from '../../lib/api';
import { GoogleSignInButton } from '../common/GoogleSignInButton';
import { Card3D } from '../common/Card3D';

export const SettingsView: React.FC = () => {
  const { user, updateUserProfile, addToast, refreshData } = useApp();

  const [name, setName] = useState(user?.name || 'Aarav Sharma');
  const [bio, setBio] = useState(user?.bio || 'Sovereign Architect & Disciplined Operator');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  const [city, setCity] = useState(user?.city || 'Bengaluru, Karnataka');
  const [occupation, setOccupation] = useState(user?.occupation || 'Software Engineer / Architect');
  const [avatar, setAvatar] = useState(
    user?.avatar ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  );
  const [monthlyBudget, setMonthlyBudget] = useState(user?.monthlyBudget || 75000);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || 'Aarav Sharma');
      setBio(user.bio || 'Sovereign Architect & Disciplined Operator');
      setPhone(user.phone || '+91 98765 43210');
      setCity(user.city || 'Bengaluru, Karnataka');
      setOccupation(user.occupation || 'Software Engineer / Architect');
      setMonthlyBudget(user.monthlyBudget || 75000);
      if (user.avatar) setAvatar(user.avatar);
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateUserProfile({
        name,
        bio,
        avatar,
        phone,
        city,
        occupation,
        monthlyBudget: Number(monthlyBudget),
      });
      addToast({
        title: 'Parameters Updated',
        message: 'Your profile preferences and ₹ INR financial budget have been updated.',
        type: 'success',
      });
    } catch (err: any) {
      addToast({
        title: 'Error',
        message: err.message || 'Failed to update profile.',
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDemoData = async () => {
    if (!window.confirm('Reset all tasks, goals, habits, and expenses back to initial demo seeds?')) {
      return;
    }
    setIsResetting(true);
    try {
      await api.resetDemoData();
      await refreshData();
      addToast({
        title: 'Ledger Restored',
        message: 'Demo dataset restored to initial clean benchmark state.',
        type: 'info',
      });
    } catch (err: any) {
      addToast({
        title: 'Reset Error',
        message: err.message,
        type: 'error',
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div id="lifeops-settings-view" className="space-y-8 animate-in fade-in duration-300 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-[#1a1a1a] pb-6">
        <div className="text-[#7a7a7a] text-[10px] uppercase tracking-[0.35em] font-medium mb-1">
          System Control &bull; India Workspace
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif text-white tracking-tight">
          Parameters & Identity Configuration
        </h1>
        <p className="text-xs text-[#7a7a7a] mt-1 font-light">
          Configure personal operating parameters, AI coordination, and treasury constraints in Indian Rupees (₹).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="p-6 rounded-sm bg-[#080808] border border-[#1a1a1a] space-y-4 text-center">
          <div className="relative inline-block mx-auto">
            <img
              src={avatar}
              alt={name}
              className="w-24 h-24 rounded-sm object-cover border border-[#c5a059]/40 mx-auto"
            />
            <div className="absolute -bottom-1 -right-1 p-1.5 rounded-sm bg-[#c5a059] text-black">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <h3 className="text-base font-serif text-white">{name}</h3>
            <p className="text-xs text-[#7a7a7a] mt-1 font-light">{bio}</p>
            <div className="mt-2 text-[10px] text-[#888] space-y-0.5 font-mono">
              <div>{city}</div>
              <div className="text-[#c5a059]">{occupation}</div>
            </div>
            <span className="inline-block mt-3 px-3 py-1 rounded-sm bg-[#111] text-[#c5a059] border border-[#1a1a1a] text-[9px] font-mono uppercase tracking-widest">
              LIFEOPS OPERATOR &bull; ₹ INR
            </span>
          </div>
        </div>

        {/* Configuration Form */}
        <div className="md:col-span-2 p-6 rounded-sm bg-[#080808] border border-[#1a1a1a] space-y-4">
          <h3 className="text-xs uppercase tracking-widest text-[#7a7a7a] font-medium flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-[#c5a059]" />
            <span>Profile & System Parameters</span>
          </h3>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#7a7a7a] mb-1">Full Name</label>
                <input
                  id="settings-name-input"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-sm bg-[#050505] border border-[#1a1a1a] text-white text-xs focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#7a7a7a] mb-1">Monthly Budget (₹ INR)</label>
                <input
                  id="settings-budget-input"
                  type="number"
                  step="1000"
                  required
                  value={monthlyBudget}
                  onChange={(e) => setMonthlyBudget(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-sm bg-[#050505] border border-[#1a1a1a] text-white text-xs focus:outline-none focus:border-[#c5a059] font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#7a7a7a] mb-1">Phone Number (India)</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-[#555] absolute left-3 top-3" />
                  <input
                    id="settings-phone-input"
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-sm bg-[#050505] border border-[#1a1a1a] text-white text-xs focus:outline-none focus:border-[#c5a059] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#7a7a7a] mb-1">City / Region</label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-[#555] absolute left-3 top-3" />
                  <input
                    id="settings-city-input"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-sm bg-[#050505] border border-[#1a1a1a] text-white text-xs focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] uppercase tracking-widest text-[#7a7a7a] mb-1">Role / Occupation</label>
                <div className="relative">
                  <Briefcase className="w-3.5 h-3.5 text-[#555] absolute left-3 top-3" />
                  <input
                    id="settings-occupation-input"
                    type="text"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-sm bg-[#050505] border border-[#1a1a1a] text-white text-xs focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#7a7a7a] mb-1">Operating Principle / Creed</label>
              <input
                id="settings-bio-input"
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-sm bg-[#050505] border border-[#1a1a1a] text-white text-xs focus:outline-none focus:border-[#c5a059]"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#7a7a7a] mb-1">Avatar Image URL</label>
              <input
                id="settings-avatar-input"
                type="url"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-sm bg-[#050505] border border-[#1a1a1a] text-white text-xs focus:outline-none focus:border-[#c5a059] font-mono text-[11px]"
              />
            </div>

            <div className="flex justify-end pt-3">
              <button
                id="settings-save-btn"
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-sm bg-[#c5a059] text-black text-xs uppercase tracking-widest font-semibold hover:bg-[#d8b56f] transition-all"
              >
                <Save className="w-4 h-4 stroke-[2.5]" />
                <span>{isSaving ? 'Saving...' : 'Commit Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* AI Engine, Google Identity & Database Maintenance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Google Identity & Security */}
        <Card3D depth={8}>
          <div className="p-6 rounded-sm bg-[#080808] border border-[#1a1a1a] space-y-3 h-full flex flex-col justify-between">
            <div>
              <h3 className="text-xs uppercase tracking-widest text-[#7a7a7a] font-medium flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#c5a059]" />
                <span>Google Identity</span>
              </h3>
              <p className="text-xs text-[#7a7a7a] font-light leading-relaxed mt-2">
                Single sign-on authentication linked with Google Services and secure token encryption.
              </p>
            </div>
            <div className="pt-2">
              <GoogleSignInButton
                variant="minimal"
                label={user?.email ? `Connected: ${user.email.split('@')[0]}` : 'Link Google Account'}
              />
            </div>
          </div>
        </Card3D>

        {/* AI Engine Status */}
        <Card3D depth={8}>
          <div className="p-6 rounded-sm bg-[#080808] border border-[#1a1a1a] space-y-3 h-full">
            <h3 className="text-xs uppercase tracking-widest text-[#7a7a7a] font-medium flex items-center gap-2">
              <Bot className="w-3.5 h-3.5 text-[#c5a059]" />
              <span>Neural Engine</span>
            </h3>
            <p className="text-xs text-[#7a7a7a] font-light leading-relaxed">
              Coordinated by <strong>Gemini 2.5 Flash</strong> with server-side SDK execution and ₹ INR intelligence.
            </p>
            <div className="p-3 rounded-sm bg-[#050505] border border-[#141414] space-y-1 font-mono text-[9px]">
              <div className="flex justify-between text-[#7a7a7a]">
                <span>Model</span>
                <span className="text-[#c5a059]">gemini-2.5-flash</span>
              </div>
              <div className="flex justify-between text-[#7a7a7a]">
                <span>Status</span>
                <span className="text-emerald-400">Online (3000/API)</span>
              </div>
            </div>
          </div>
        </Card3D>

        {/* Database Management & Demo Reset */}
        <Card3D depth={8}>
          <div className="p-6 rounded-sm bg-[#080808] border border-[#1a1a1a] space-y-3 h-full flex flex-col justify-between">
            <div>
              <h3 className="text-xs uppercase tracking-widest text-[#7a7a7a] font-medium flex items-center gap-2">
                <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                <span>Ledger Maintenance</span>
              </h3>
              <p className="text-xs text-[#7a7a7a] font-light leading-relaxed mt-2">
                Restore sample directives, milestones, habits, and treasury transactions to initial benchmark states.
              </p>
            </div>
            <button
              id="settings-reset-demo-btn"
              onClick={handleResetDemoData}
              disabled={isResetting}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-sm bg-rose-950/30 hover:bg-rose-950/50 border border-rose-900/40 text-rose-400 text-[10px] uppercase tracking-widest font-semibold transition-all disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
              <span>{isResetting ? 'Restoring Ledger...' : 'Reset Benchmark Data'}</span>
            </button>
          </div>
        </Card3D>
      </div>
    </div>
  );
};
