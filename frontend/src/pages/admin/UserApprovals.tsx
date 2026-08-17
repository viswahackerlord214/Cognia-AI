import React, { useEffect, useState } from 'react';
import { adminApi } from '../../services/api';
import { UserProfile } from '../../types';
import { ShieldCheck, UserX, CheckCircle, Clock, RefreshCw, Filter } from 'lucide-react';

export const UserApprovals: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [roleFilter, setRoleFilter] = useState<string>('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getUsers(statusFilter, roleFilter);
      setUsers(res.users || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [statusFilter, roleFilter]);

  const handleApprove = async (userId: string, role: string) => {
    try {
      await adminApi.approveUser(userId, role);
      await fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to approve user.');
    }
  };

  const handleReject = async (userId: string) => {
    try {
      await adminApi.rejectUser(userId);
      await fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to reject user.');
    }
  };

  const handleSuspend = async (userId: string) => {
    try {
      await adminApi.suspendUser(userId);
      await fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to suspend user.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
            <span>Admin User Approvals & Management</span>
          </h1>
          <p className="text-xs text-[#8b949e]">Review registration requests, approve/reject accounts, and assign system roles.</p>
        </div>

        <button
          onClick={fetchUsers}
          className="p-2 bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] rounded-lg text-xs text-white flex items-center space-x-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 bg-[#161b22] border border-[#30363d] rounded-xl flex items-center space-x-4 text-xs">
        <div className="flex items-center space-x-2 text-[#8b949e]">
          <Filter className="w-4 h-4" />
          <span className="font-semibold uppercase tracking-wider">Status:</span>
        </div>
        {['pending', 'approved', 'rejected', 'suspended', ''].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-colors ${
              statusFilter === st
                ? 'bg-blue-600 text-white'
                : 'bg-[#0d1117] text-[#8b949e] hover:text-white border border-[#30363d]'
            }`}
          >
            {st || 'All Statuses'}
          </button>
        ))}
      </div>

      {/* Users Table */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs text-[#c9d1d9]">
          <thead className="bg-[#0d1117] text-[#8b949e] uppercase tracking-wider border-b border-[#30363d]">
            <tr>
              <th className="px-4 py-3">Applicant Name</th>
              <th className="px-4 py-3">Email & Univ ID</th>
              <th className="px-4 py-3">Req Role</th>
              <th className="px-4 py-3">Dept / Sem</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#30363d]">
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-[#8b949e]">Loading user profiles...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-[#8b949e]">No users found for this filter.</td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-[#0d1117]/50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-white">{u.full_name}</td>
                  <td className="px-4 py-3">
                    <div>{u.email}</div>
                    <div className="text-[10px] text-[#8b949e]">{u.university_id || 'N/A'}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="capitalize font-semibold text-amber-400">{u.role}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div>{u.department}</div>
                    <div className="text-[10px] text-[#8b949e]">Sem {u.semester}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                      u.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                      u.status === 'pending' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                      'bg-red-500/20 text-red-400 border-red-500/30'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    {u.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(u.id, u.role)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium text-[11px]"
                        >
                          Approve ({u.role})
                        </button>
                        <button
                          onClick={() => handleReject(u.id)}
                          className="px-2.5 py-1 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 rounded font-medium text-[11px]"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {u.status === 'approved' && u.role !== 'admin' && (
                      <button
                        onClick={() => handleSuspend(u.id)}
                        className="px-2.5 py-1 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/30 text-amber-400 rounded font-medium text-[11px]"
                      >
                        Suspend
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
