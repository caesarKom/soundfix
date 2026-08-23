import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../api/users-api.ts';
import { AdminModal } from '../../../components/admin-modal.tsx';
import { UserCreateForm } from './user-create-form.tsx';
import { UserEditForm } from './user-edit-form.tsx';
import type { AdminUser } from '../types/users.ts';
import { Avatar } from '../../../components/avatar.tsx';

const IMAGE_URL = import.meta.env.VITE_BACKEND_URL;

export function UsersPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modals visibility hooks
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  const { data: users, isLoading, isError } = useQuery({
    queryKey: ['admin-users'],
    queryFn: usersApi.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: usersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  const filteredUsers = users?.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.profile?.firstName && user.profile.firstName.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">User Accounts</h1>
          <p className="text-slate-400 text-sm mt-1">Deploy fresh accounts, manage profile registrations, and adjust system clearance roles.</p>
        </div>
        <button onClick={() => setIsCreateOpen(true)} className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-sm rounded-lg transition-transform active:scale-95 self-start sm:self-center">
          ＋ Add New User
        </button>
      </div>

      <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
        <input type="text" placeholder="Search by name, email, profile details..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="flex-1 bg-slate-950 border border-slate-800 px-4 py-2 text-sm rounded-lg text-white focus:outline-none focus:border-emerald-500 placeholder-slate-600" />
        <span className="text-xs font-mono font-bold text-slate-500 bg-slate-950 px-3 py-2 border border-slate-800 rounded-lg">Matches: {filteredUsers.length}</span>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <p className="p-12 text-center text-sm text-emerald-400 animate-pulse">Loading profiles base...</p>
          ) : isError ? (
            <p className="p-12 text-center text-sm text-red-400">Failed to load system users.</p>
          ) : (
            <>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 text-xs font-bold uppercase tracking-wider bg-slate-950/20">
                    <th className="py-4 px-6">Identities Name</th>
                    <th className="py-4 px-6">Email Address</th>
                    <th className="py-4 px-6 text-center">Status</th>
                    <th className="py-4 px-6 text-center">System Clearance</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 text-sm">
                  {paginatedUsers.length > 0 ? (
                    paginatedUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-800/10 transition-colors">
                        <td className="py-4 px-6">
                          <div className=''>
                            <Avatar name={user.name} imgUrl={user.profile?.avatar ? `${IMAGE_URL}/${user.profile.avatar}` : null} size={48} />
                            <p className="font-bold text-white leading-tight">{user.name}</p>
                            {user.profile?.firstName && (
                              <p className="text-xs text-slate-500 mt-0.5">{user.profile.firstName} {user.profile.lastName}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-slate-400 font-mono">{user.email}</td>
                        <td className="py-4 px-6 text-center">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${user.isVerified ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>{user.isVerified ? 'Verified' : 'Pending'}</span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`px-2.5 py-1 text-xs font-black rounded border uppercase ${user.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' : 'bg-slate-950 text-slate-400 border-slate-800'}`}>{user.role}</span>
                        </td>
                        <td className="py-4 px-6 text-right space-x-2">
                          <button onClick={() => setEditingUser(user)} className="text-xs font-bold text-emerald-400 hover:text-emerald-300 px-2 py-1 rounded hover:bg-emerald-950/10">Edit Profile</button>
                          <button onClick={() => { if (window.confirm(`Permanently delete account "${user.name}"?`)) deleteMutation.mutate(user.id as string); }} className="text-xs font-bold text-slate-500 hover:text-red-400 px-2 py-1 rounded hover:bg-red-950/10">Delete</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={5} className="py-12 text-center text-slate-500">No accounts matched criteria.</td></tr>
                  )}
                </tbody>
              </table>

              {totalPages > 1 && (
                <div className="p-4 border-t border-slate-800 bg-slate-950/30 flex items-center justify-between gap-4">
                  <span className="text-xs text-slate-400 font-medium">Page {currentPage} of {totalPages}</span>
                  <div className="flex gap-2">
                    <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-3 py-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-md">Previous</button>
                    <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-3 py-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-md">Next</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Deploy User Modal */}
      <AdminModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Register Fresh System Account">
        <UserCreateForm onSuccess={() => setIsCreateOpen(false)} />
      </AdminModal>

      {/* Modify User Modal */}
      <AdminModal isOpen={!!editingUser} onClose={() => setEditingUser(null)} title="Modify User Account & Profile">
        {editingUser && <UserEditForm user={editingUser} onSuccess={() => setEditingUser(null)} />}
      </AdminModal>
    </div>
  );
}
