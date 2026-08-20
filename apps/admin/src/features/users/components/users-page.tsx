import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../api/users-api.ts';
import type { UserRole } from '../types/users.ts';

export function UsersPage() {
  const queryClient = useQueryClient();

  // 1. Fetching user list
  const { data: users, isLoading, isError } = useQuery({
    queryKey: ['admin-users'],
    queryFn: usersApi.getAll,
  });

  // 2. Mutation for changing roles or status
  const updateMutation = useMutation({
    mutationFn: usersApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  // 3. Mutation for account deletion
  const deleteMutation = useMutation({
    mutationFn: usersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  const handleRoleToggle = (id: string, currentRole: UserRole) => {
    const newRole: UserRole = currentRole === 'ADMIN' ? 'MEMBER' : 'ADMIN';
    updateMutation.mutate({ id, dto: { role: newRole } });
  };

  const handleDeleteUser = (id: string, name: string) => {
    if (window.confirm(`Are you absolutely sure you want to permanently delete user "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-emerald-400 font-medium animate-pulse">Loading system user base...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 bg-red-950/40 border border-red-900 rounded-xl text-red-400">
        <p className="font-bold">Failed to load system users data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-white">User Accounts</h1>
        <p className="text-slate-400 text-sm mt-1">
          Monitor system members, adjust permissions, and manage profile registrations.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="py-4 px-6">Profile Name</th>
                <th className="py-4 px-6">Email Address</th>
                <th className="py-4 px-6 text-center">Verification</th>
                <th className="py-4 px-6 text-center">System Role</th>
                <th className="py-4 px-6 text-right">Actions Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {users && users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="py-4 px-6 font-semibold text-white">{user.name}</td>
                    <td className="py-4 px-6 text-slate-400 font-mono">{user.email}</td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.isVerified
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {user.isVerified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleRoleToggle(user.id, user.role)}
                        disabled={updateMutation.isPending}
                        className={`px-3 py-1 text-xs font-black rounded border tracking-wide uppercase transition-colors ${
                          user.role === 'ADMIN'
                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/30 hover:bg-purple-500/20'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        {user.role}
                      </button>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDeleteUser(user.id, user.name)}
                        disabled={deleteMutation.isPending}
                        className="text-xs font-bold text-slate-500 hover:text-red-400 px-3 py-1.5 rounded-md hover:bg-red-950/20 border border-transparent hover:border-red-900/30 transition-all"
                      >
                        Delete account
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500 font-medium">
                    No registered user accounts found in the database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
