import React, { useEffect, useState } from 'react';
import { adminApi, docApi } from '../../services/api';
import { StatCard } from '../../components/StatCard';
import { Users, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingApprovals: 0,
    totalDocs: 0,
    activeDocs: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const usersRes = await adminApi.getUsers();
        const docsRes = await docApi.listDocuments();
        const users = usersRes.users || [];
        const docs = docsRes.documents || [];

        setStats({
          totalUsers: users.length,
          pendingApprovals: users.filter((u: any) => u.status === 'pending').length,
          totalDocs: docs.length,
          activeDocs: docs.filter((d: any) => d.status === 'active').length,
        });
      } catch (err) {
        console.error('Error loading admin stats:', err);
      }
    };
    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">🛠️ Admin Control Center</h1>
        <p className="text-xs text-[#8b949e]">Manage registration approvals, system authorization, document ingestion, and Chroma vector indexation.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Registered Users" value={stats.totalUsers} icon={Users} color="text-blue-400" />
        <StatCard title="Pending Approvals" value={stats.pendingApprovals} subtitle="Requires Admin Action" icon={ShieldCheck} color="text-amber-400" />
        <StatCard title="Total Documents" value={stats.totalDocs} icon={FileText} color="text-purple-400" />
        <StatCard title="Active Vectors" value={stats.activeDocs} icon={CheckCircle2} color="text-emerald-400" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-[#161b22] border border-[#30363d] rounded-2xl space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <span>Pending Approvals</span>
          </h2>
          <p className="text-xs text-[#8b949e]">Review and approve requested user registrations.</p>
          <Link
            to="/admin/users"
            className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            Manage User Approvals ({stats.pendingApprovals})
          </Link>
        </div>

        <div className="p-6 bg-[#161b22] border border-[#30363d] rounded-2xl space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <span>Document Ingestion & Versioning</span>
          </h2>
          <p className="text-xs text-[#8b949e]">Upload official circulars, syllabus, regulations, and manage vector deletion.</p>
          <Link
            to="/admin/documents"
            className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            Manage Documents
          </Link>
        </div>
      </div>
    </div>
  );
};
