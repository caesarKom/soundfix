import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../api/users-api.ts';
import type { AdminUser, Gender, UserRole } from '../types/users.ts';

interface UserEditFormProps {
  user: AdminUser;
  onSuccess: () => void;
}

export function UserEditForm({ user, onSuccess }: UserEditFormProps) {
  const queryClient = useQueryClient();
  const [role, setRole] = useState(user.role);
  const [isVerified, setIsVerified] = useState(user.isVerified);
  const [firstName, setFirstName] = useState(user.profile?.firstName || '');
  const [lastName, setLastName] = useState(user.profile?.lastName || '');
  const [bio, setBio] = useState(user.profile?.bio || '');
  const [gender, setGender] = useState(user.profile?.gender || 'OTHER');
  const [error, setError] = useState<string | null>(null);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const updateMutation = useMutation({
    mutationFn: usersApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      onSuccess();
    },
    onError: (err: unknown) => {
      setError(err instanceof Error ? err.message : 'Update failed');
    },
  });

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData();
formData.append('role', role);
formData.append('isVerified', String(isVerified));
formData.append('firstName', firstName);
formData.append('lastName', lastName);
formData.append('bio', bio);
formData.append('gender', gender);
if (avatarFile) {
  formData.append('avatar', avatarFile); 
}

updateMutation.mutate({ id: user.id, formData });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      {error && <div className="p-3 text-xs text-red-400 bg-red-950/40 border border-red-900 rounded-lg">{error}</div>}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-400 uppercase">First Name</label>
          <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-400 uppercase">Last Name</label>
          <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500" />
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-400 uppercase">Biography</label>
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={2} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500 resize-none" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-400 uppercase">System Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value as UserRole)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500">
            <option value="MEMBER">MEMBER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-400 uppercase">Gender Identity</label>
          <select value={gender} onChange={(e) => setGender(e.target.value as Gender)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500">
            <option value="MALE">MALE</option>
            <option value="FEMALE">FEMALE</option>
            <option value="OTHER">OTHER</option>
          </select>
        </div>
      </div>

      {/* Avatar */}
      <div className="space-y-1">
  <label className="text-xs font-bold text-slate-400 uppercase">Profile Avatar</label>
  <input 
    type="file" 
    accept="image/jpeg, image/png" 
    onChange={(e) => e.target.files && setAvatarFile(e.target.files[0])} 
    className="w-full text-xs text-slate-500" 
  />
</div>

      <div className="flex items-center gap-3 py-1">
        <input type="checkbox" id="editIsVerified" checked={isVerified} onChange={(e) => setIsVerified(e.target.checked)} className="w-4 h-4 text-emerald-500 bg-slate-950 border-slate-800 rounded cursor-pointer focus:ring-0" />
        <label htmlFor="editIsVerified" className="text-sm font-semibold text-slate-300 cursor-pointer select-none">Verify User Account</label>
      </div>
      <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
        <button type="button" onClick={onSuccess} className="px-4 py-2 text-xs font-bold text-slate-400 bg-slate-800 rounded-lg">Cancel</button>
        <button type="submit" disabled={updateMutation.isPending} className="px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-500 rounded-lg">Save Profile</button>
      </div>
    </form>
  );
}
