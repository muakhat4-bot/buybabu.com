'use client';

import * as React from 'react';
import { Button, Card, Input } from '@villex/ui';
import { useCustomerAuth } from '@/context/customer-auth-context';
import { supabaseClient } from '@villex/supabase';

interface DeviceSession {
  id: string;
  device: string;
  os: string;
  ip: string;
  location: string;
  isCurrent: boolean;
  lastActive: string;
}

export function ProfilePanel() {
  const { profile: authProfile, refreshProfile } = useCustomerAuth();
  
  const [profile, setProfile] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const [isEditing, setIsEditing] = React.useState(false);
  const [saveSuccess, setSaveSuccess] = React.useState(false);
  const [passwordSuccess, setPasswordSuccess] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);
  const [isSavingPassword, setIsSavingPassword] = React.useState(false);

  const [passwords, setPasswords] = React.useState({
    current: '',
    new: '',
    confirm: '',
  });

  const [sessions, setSessions] = React.useState<DeviceSession[]>([
    {
      id: 'sess-1',
      device: 'Chrome Browser',
      os: 'Windows 11',
      ip: '39.34.192.122',
      location: 'Islamabad, PK',
      isCurrent: true,
      lastActive: 'Active Now',
    },
    {
      id: 'sess-2',
      device: 'Safari Mobile',
      os: 'iOS 17.4',
      ip: '182.176.45.89',
      location: 'Lahore, PK',
      isCurrent: false,
      lastActive: '2 hours ago',
    },
    {
      id: 'sess-3',
      device: 'Villex Mobile App',
      os: 'Android 14',
      ip: '110.37.210.15',
      location: 'Karachi, PK',
      isCurrent: false,
      lastActive: '3 days ago',
    },
  ]);

  React.useEffect(() => {
    if (authProfile) {
      setProfile({
        firstName: authProfile.first_name || '',
        lastName: authProfile.last_name || '',
        email: authProfile.email || '',
        phone: authProfile.phone || '',
      });
    }
  }, [authProfile]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSaveSuccess(false);
    setIsSaving(true);

    try {
      // 1. Update user metadata in Supabase
      const { error } = await supabaseClient.auth.updateUser({
        data: {
          firstName: profile.firstName,
          lastName: profile.lastName,
          phone: profile.phone
        }
      });
      if (error) throw error;

      // 2. Refresh profile (triggers backend sync)
      await refreshProfile();

      setSaveSuccess(true);
      // Wait for 2.5 seconds to display the success message, then close editing state
      setTimeout(() => {
        setIsEditing(false);
        setSaveSuccess(false);
      }, 2500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (passwords.new !== passwords.confirm) {
      setErrorMsg('New passwords do not match.');
      return;
    }

    setIsSavingPassword(true);

    try {
      const { error } = await supabaseClient.auth.updateUser({
        password: passwords.new
      });
      if (error) throw error;

      setPasswords({ current: '', new: '', confirm: '' });
      setPasswordSuccess(true);
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to change password.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleRevokeSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Tab Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Profile Details</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage your account information, security configurations, and active login sessions.</p>
      </div>

      {/* Profile Info Form Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
          <div>
            <h3 className="font-bold text-lg">Personal Information</h3>
            <p className="text-xs text-muted-foreground">Keep your contact details up to date.</p>
          </div>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          )}
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {errorMsg}
          </div>
        )}

        {saveSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Profile updated successfully.
          </div>
        )}

        <form onSubmit={handleProfileSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">First Name</label>
              <Input
                disabled={!isEditing || isSaving}
                value={profile.firstName}
                onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                className="bg-secondary/20"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Last Name</label>
              <Input
                disabled={!isEditing || isSaving}
                value={profile.lastName}
                onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                className="bg-secondary/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                <span>Email Address</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full font-bold uppercase tracking-normal">
                  ✓ Verified
                </span>
              </label>
              <Input
                type="email"
                disabled={true}
                value={profile.email}
                className="bg-secondary/10 opacity-70 cursor-not-allowed"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phone Number</label>
              <Input
                type="tel"
                disabled={!isEditing || isSaving}
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="bg-secondary/20"
              />
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end space-x-3 pt-4 border-t border-border mt-6">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditing(false)} disabled={isSaving}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isSaving}>
                {isSaving ? (
                  <span className="flex items-center gap-1.5">
                    <svg className="animate-spin h-3.5 w-3.5 text-foreground" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </span>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          )}
        </form>
      </Card>

      {/* Security (Change Password) Card */}
      <Card className="p-6">
        <div className="border-b border-border pb-4 mb-6">
          <h3 className="font-bold text-lg">Account Security</h3>
          <p className="text-xs text-muted-foreground">Modify your password to keep your account secure.</p>
        </div>

        {passwordSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Password changed successfully.
          </div>
        )}

        <form onSubmit={handlePasswordSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Current Password</label>
              <Input
                type="password"
                required
                value={passwords.current}
                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                placeholder="••••••••"
                className="bg-secondary/20"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">New Password</label>
              <Input
                type="password"
                required
                value={passwords.new}
                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                placeholder="••••••••"
                className="bg-secondary/20"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Confirm New Password</label>
              <Input
                type="password"
                required
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                placeholder="••••••••"
                className="bg-secondary/20"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border mt-6">
            <Button type="submit" size="sm">
              Update Password
            </Button>
          </div>
        </form>
      </Card>

      {/* Active Sessions Device Card */}
      <Card className="p-6">
        <div className="border-b border-border pb-4 mb-6">
          <h3 className="font-bold text-lg">Active Sessions</h3>
          <p className="text-xs text-muted-foreground">Devices currently logged into your Villex account. Revoke session access if you see unrecognized devices.</p>
        </div>

        <div className="divide-y divide-border">
          {sessions.map((sess) => (
            <div key={sess.id} className="py-4 flex items-center justify-between first:pt-0 last:pb-0 gap-4">
              <div className="flex items-start space-x-3.5">
                <div className={`p-2.5 rounded-xl border ${sess.isCurrent ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-secondary/20 border-border text-muted-foreground'}`}>
                  {sess.device.includes('Mobile') || sess.device.includes('App') ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground">{sess.device}</span>
                    <span className="text-[10px] text-muted-foreground">({sess.os})</span>
                    {sess.isCurrent && (
                      <span className="text-[9px] bg-primary/20 text-primary font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                        Current
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-muted-foreground mt-1">
                    <span>IP: {sess.ip}</span>
                    <span>•</span>
                    <span>{sess.location}</span>
                    <span>•</span>
                    <span className={sess.isCurrent ? 'text-primary font-medium' : ''}>{sess.lastActive}</span>
                  </div>
                </div>
              </div>

              {!sess.isCurrent && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRevokeSession(sess.id)}
                  className="text-destructive border-destructive/20 hover:bg-destructive/10 hover:border-destructive text-xs"
                >
                  Revoke
                </Button>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
