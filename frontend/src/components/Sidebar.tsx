import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  MessageSquare,
  BookOpen,
  GraduationCap,
  FileQuestion,
  CheckSquare,
  Upload,
  Sparkles,
  ShieldCheck,
  FileText,
  FolderOpen,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  if (!user || user.status !== 'approved') return null;

  return (
    <aside className="w-64 bg-[#161b22] border-r border-[#30363d] h-[calc(100vh-4rem)] sticky top-16 flex flex-col justify-between p-4">
      <div className="space-y-6">
        {/* Role Header */}
        <div className="px-3 py-2 bg-[#0d1117] rounded-lg border border-[#30363d]">
          <p className="text-xs uppercase tracking-wider text-[#8b949e] font-semibold">Workspace</p>
          <p className="text-sm font-bold text-white uppercase">{user.role} Portal</p>
        </div>

        <nav className="space-y-1">
          {user.role === 'student' && (
            <>
              <NavLink to="/student/dashboard" className={navLinkClass}>
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </NavLink>
              <NavLink to="/student/learn" className={navLinkClass}>
                <GraduationCap className="w-4 h-4 text-emerald-400" />
                <span>Learn Yourself</span>
              </NavLink>
              <NavLink to="/student/materials" className={navLinkClass}>
                <FolderOpen className="w-4 h-4 text-indigo-400" />
                <span>Study Materials</span>
              </NavLink>
              <NavLink to="/student/pyqs" className={navLinkClass}>
                <BookOpen className="w-4 h-4 text-purple-400" />
                <span>PYQ Hub & Trends</span>
              </NavLink>
              <NavLink to="/student/practice" className={navLinkClass}>
                <FileQuestion className="w-4 h-4 text-amber-400" />
                <span>Practice MCQs</span>
              </NavLink>
              <NavLink to="/student/quizzes" className={navLinkClass}>
                <CheckSquare className="w-4 h-4 text-rose-400" />
                <span>Assigned Quizzes</span>
              </NavLink>
            </>
          )}

          {user.role === 'teacher' && (
            <>
              <NavLink to="/teacher/dashboard" className={navLinkClass}>
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </NavLink>
              <NavLink to="/teacher/assistant" className={navLinkClass}>
                <MessageSquare className="w-4 h-4 text-blue-400" />
                <span>Faculty Assistant</span>
              </NavLink>
              <NavLink to="/teacher/documents" className={navLinkClass}>
                <Upload className="w-4 h-4 text-indigo-400" />
                <span>Course Material</span>
              </NavLink>
              <NavLink to="/teacher/quiz-generator" className={navLinkClass}>
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>AI Quiz Generator</span>
              </NavLink>
              <NavLink to="/teacher/quizzes" className={navLinkClass}>
                <CheckSquare className="w-4 h-4 text-emerald-400" />
                <span>My Published Quizzes</span>
              </NavLink>
            </>
          )}

          {user.role === 'admin' && (
            <>
              <NavLink to="/admin/dashboard" className={navLinkClass}>
                <LayoutDashboard className="w-4 h-4" />
                <span>Admin Dashboard</span>
              </NavLink>
              <NavLink to="/admin/users" className={navLinkClass}>
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>User Approvals</span>
              </NavLink>
              <NavLink to="/admin/documents" className={navLinkClass}>
                <FileText className="w-4 h-4 text-blue-400" />
                <span>Document Ingestion</span>
              </NavLink>
            </>
          )}
        </nav>
      </div>

      <div className="p-3 bg-[#0d1117] rounded-lg border border-[#30363d] text-xs space-y-1 text-[#8b949e]">
        <div className="flex items-center justify-between">
          <span>CRAG Pipeline:</span>
          <span className="text-emerald-400 font-semibold">Active</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Vector DB:</span>
          <span className="text-blue-400 font-semibold">ChromaDB</span>
        </div>
      </div>
    </aside>
  );
};

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
    isActive
      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
      : 'text-[#8b949e] hover:text-white hover:bg-[#21262d]'
  }`;
