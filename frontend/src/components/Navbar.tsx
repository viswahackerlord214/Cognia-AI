import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import { LogOut, ShieldAlert, Bell, CheckCircle2, FileText, CheckSquare } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, loginWithCredentials, logout } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifPopover, setShowNotifPopover] = useState(false);

  const fetchNotifs = async () => {
    try {
      if (user && user.status === 'approved') {
        const res = await authApi.getNotifications();
        setNotifications(res.notifications || []);
        setUnreadCount(res.unread_count || 0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const handleMarkRead = async (notifId: string) => {
    try {
      await authApi.markNotificationRead(notifId);
      await fetchNotifs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRoleSwitch = (email: string, pass: string) => {
    loginWithCredentials(email, pass);
  };

  return (
    <header className="h-16 bg-[#161b22] border-b border-[#30363d] px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center space-x-3">
        <span className="text-xl font-bold text-white tracking-wide">COGNIA AI</span>
        <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
          v2.0 SaaS
        </span>
      </div>

      <div className="flex items-center space-x-4">
        {/* Quick Demo Switcher */}
        <div className="flex items-center space-x-2 bg-[#0d1117] px-3 py-1.5 rounded-lg border border-[#30363d] text-xs">
          <span className="text-[#8b949e]">Quick Demo Role:</span>
          <select
            value={user?.email || 'student@univ.edu'}
            onChange={(e) => {
              const val = e.target.value;
              const pass = val.includes('teacher') ? 'teacher123' : val.includes('viswa') ? 'viswacool21' : val.includes('pending') ? 'pending123' : 'student123';
              handleRoleSwitch(val, pass);
            }}
            className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
          >
            <option value="student@univ.edu" className="bg-[#161b22]">Student (Alex Rivera)</option>
            <option value="teacher@univ.edu" className="bg-[#161b22]">Faculty (Prof. Turing)</option>
            <option value="viswaravindren@gmail.com" className="bg-[#161b22]">Super Admin (Viswa Ravindren)</option>
            <option value="pending_student@univ.edu" className="bg-[#161b22]">Pending Account (Jane Doe)</option>
          </select>
        </div>

        {/* Notification Bell Popover */}
        {user && user.status === 'approved' && (
          <div className="relative">
            <button
              onClick={() => setShowNotifPopover(!showNotifPopover)}
              className="p-2 text-[#8b949e] hover:text-white hover:bg-[#30363d] rounded-lg transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-blue-500 rounded-full animate-ping" />
              )}
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-[#161b22]">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Popover Dropdown */}
            {showNotifPopover && (
              <div className="absolute right-0 mt-2 w-80 bg-[#161b22] border border-[#30363d] rounded-2xl shadow-2xl overflow-hidden z-50 text-xs">
                <div className="p-3 bg-[#0d1117] border-b border-[#30363d] flex items-center justify-between">
                  <span className="font-bold text-white uppercase tracking-wider text-[11px]">
                    Notifications ({notifications.length})
                  </span>
                  <button
                    onClick={() => setShowNotifPopover(false)}
                    className="text-[#8b949e] hover:text-white text-[10px]"
                  >
                    Close
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-[#30363d]">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-[#8b949e]">No notifications yet.</div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleMarkRead(n.id)}
                        className={`p-3 space-y-1 cursor-pointer transition-colors ${
                          n.is_read ? 'bg-[#161b22] opacity-70' : 'bg-[#0d1117] border-l-2 border-blue-500'
                        }`}
                      >
                        <p className="font-semibold text-white">{n.title}</p>
                        <p className="text-[#8b949e] text-[11px] leading-relaxed">{n.message}</p>
                        <span className="text-[9px] text-blue-400 block">{n.created_at}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {user && (
          <div className="flex items-center space-x-3">
            <div className="text-right hidden md:block">
              <p className="text-sm font-semibold text-white">{user.full_name}</p>
              <p className="text-xs text-[#8b949e]">{user.email}</p>
            </div>
            
            {/* Status / Role Badge */}
            {user.status === 'pending' ? (
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center space-x-1">
                <ShieldAlert className="w-3 h-3" />
                <span>PENDING</span>
              </span>
            ) : (
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full uppercase border ${
                user.role === 'admin' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                user.role === 'teacher' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                'bg-blue-500/20 text-blue-400 border-blue-500/30'
              }`}>
                {user.role}
              </span>
            )}

            <button
              onClick={logout}
              className="p-2 text-[#8b949e] hover:text-white hover:bg-[#30363d] rounded-lg transition-colors"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
