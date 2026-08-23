import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../api/users-api.ts';
import type { UserRole } from '../types/users.ts';

interface UserCreateFormProps {
  onSuccess: () => void;
}

export function UserCreateForm({ onSuccess }: UserCreateFormProps) {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'MEMBER'>('MEMBER');
  const [error, setError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      onSuccess();
    },
    onError: (err: unknown) => {
      setError(err instanceof Error ? err.message : 'Registration deployment failed.');
    },
  });

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !name || !password) {
      setError('All core credential fields are mandatory.');
      return;
    }
    createMutation.mutate({ email, name, password, role, isVerified: false  });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="p-3 text-xs text-red-400 bg-red-950/40 border border-red-900 rounded-lg">{error}</div>}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-400 uppercase">Profile Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500" placeholder="johndoe" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-400 uppercase">Email Address</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500" placeholder="john@stream.com" />
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-400 uppercase">Account Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500" placeholder="••••••••" />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-400 uppercase">System Clearance Role</label>
        <select value={role} onChange={(e) => setRole(e.target.value as UserRole)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500">
          <option value="MEMBER">MEMBER (Standard User)</option>
          <option value="ADMIN">ADMIN (System Administrator)</option>
        </select>
      </div>
      <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
        <button type="button" onClick={onSuccess} className="px-4 py-2 text-xs font-bold text-slate-400 bg-slate-800 rounded-lg">Cancel</button>
        <button type="submit" disabled={createMutation.isPending} className="px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-500 rounded-lg hover:bg-emerald-600">Create Account</button>
      </div>
    </form>
  );
}
