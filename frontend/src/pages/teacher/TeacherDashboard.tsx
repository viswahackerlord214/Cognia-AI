import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { StatCard } from '../../components/StatCard';
import { MessageSquare, Upload, Sparkles, CheckSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="p-6 bg-gradient-to-r from-amber-950/40 to-[#161b22] border border-amber-500/30 rounded-2xl">
        <h1 className="text-2xl font-bold text-white mb-1">👨‍🏫 Faculty Teaching & Assessment Control</h1>
        <p className="text-xs text-amber-200">Welcome, {user?.full_name}! Upload course materials with granular visibility controls and generate RunnableParallel AI quizzes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Assigned Department" value={user?.department || 'CS'} subtitle="Faculty Member" icon={Sparkles} color="text-amber-400" />
        <StatCard title="Course Material" value="Active Docs" subtitle="RBAC Protected" icon={Upload} color="text-indigo-400" />
        <StatCard title="Published Quizzes" value="Ready" subtitle="Student Assessment" icon={CheckSquare} color="text-emerald-400" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/teacher/assistant" className="p-6 bg-[#161b22] border border-[#30363d] rounded-2xl hover:border-blue-500 transition-all group space-y-3">
          <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl w-fit text-blue-400 group-hover:scale-110 transition-transform">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Faculty Assistant</h3>
          <p className="text-xs text-[#8b949e]">Ask questions about course regulations, syllabus, and university notices.</p>
        </Link>

        <Link to="/teacher/documents" className="p-6 bg-[#161b22] border border-[#30363d] rounded-2xl hover:border-indigo-500 transition-all group space-y-3">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl w-fit text-indigo-400 group-hover:scale-110 transition-transform">
            <Upload className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Upload Material</h3>
          <p className="text-xs text-[#8b949e]">Upload lecture notes or question banks with private owner_only or course visibility.</p>
        </Link>

        <Link to="/teacher/quiz-generator" className="p-6 bg-[#161b22] border border-[#30363d] rounded-2xl hover:border-amber-500 transition-all group space-y-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl w-fit text-amber-400 group-hover:scale-110 transition-transform">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">AI Quiz Generator</h3>
          <p className="text-xs text-[#8b949e]">Multi-chain RunnableParallel generation & 7-point validation audit.</p>
        </Link>
      </div>
    </div>
  );
};
