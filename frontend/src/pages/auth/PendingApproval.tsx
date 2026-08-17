import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, LogOut, Clock, RefreshCw } from 'lucide-react';

export const PendingApproval: React.FC = () => {
  const { user, logout, refetchUser } = useAuth();

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#161b22] border border-[#30363d] rounded-2xl p-8 shadow-2xl space-y-6 text-center">
        <div className="inline-flex p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400">
          <Clock className="w-10 h-10 animate-pulse" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">Account Pending Approval</h1>
          <p className="text-sm text-[#8b949e]">
            Your Cognia AI account is awaiting administrator approval.
          </p>
        </div>

        {user && (
          <div className="p-4 bg-[#0d1117] border border-[#30363d] rounded-xl text-left space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[#8b949e]">Full Name:</span>
              <span className="font-semibold text-white">{user.full_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8b949e]">Email:</span>
              <span className="font-semibold text-white">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8b949e]">University ID:</span>
              <span className="font-semibold text-white">{user.university_id || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8b949e]">Requested Role:</span>
              <span className="font-semibold text-amber-400 capitalize">{user.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8b949e]">Department:</span>
              <span className="font-semibold text-white">{user.department}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8b949e]">Account Status:</span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase font-bold text-[10px]">
                {user.status}
              </span>
            </div>
          </div>
        )}

        <div className="flex space-x-3 pt-2">
          <button
            onClick={refetchUser}
            className="flex-1 py-2.5 bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Check Approval Status</span>
          </button>
          <button
            onClick={logout}
            className="px-4 py-2.5 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 text-xs font-semibold rounded-xl transition-colors flex items-center space-x-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
