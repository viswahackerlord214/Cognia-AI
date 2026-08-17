import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { StatCard } from '../../components/StatCard';
import { MessageSquare, BookOpen, GraduationCap, CheckSquare, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="p-6 bg-gradient-to-r from-blue-950/40 to-[#161b22] border border-blue-500/30 rounded-2xl">
        <h1 className="text-2xl font-bold text-white mb-1">🎓 Student Learning Portal</h1>
        <p className="text-xs text-blue-300">Welcome back, {user?.full_name}! Access university information, search past question papers, learn complex topics, and solve quizzes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Enrolled Course" value={user?.course || 'CS501'} subtitle="Database Systems" icon={BookOpen} color="text-blue-400" />
        <StatCard title="Semester" value={`Sem ${user?.semester || 5}`} subtitle="Academic Semester" icon={GraduationCap} color="text-emerald-400" />
        <StatCard title="Department" value={user?.department || 'CS'} subtitle="Computer Science" icon={Sparkles} color="text-purple-400" />
        <StatCard title="Assigned Quizzes" value="2 Active" subtitle="Pending Attempt" icon={CheckSquare} color="text-amber-400" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/student/assistant" className="p-6 bg-[#161b22] border border-[#30363d] rounded-2xl hover:border-blue-500 transition-all group space-y-3">
          <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl w-fit text-blue-400 group-hover:scale-110 transition-transform">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">AI Assistant</h3>
          <p className="text-xs text-[#8b949e]">Ask questions about circulars, exam dates, syllabus, and regulations with exact citations.</p>
        </Link>

        <Link to="/student/pyqs" className="p-6 bg-[#161b22] border border-[#30363d] rounded-2xl hover:border-purple-500 transition-all group space-y-3">
          <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl w-fit text-purple-400 group-hover:scale-110 transition-transform">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">PYQ Search & Trends</h3>
          <p className="text-xs text-[#8b949e]">Search Previous Year Questions and analyze topic occurrence frequencies.</p>
        </Link>

        <Link to="/student/learn" className="p-6 bg-[#161b22] border border-[#30363d] rounded-2xl hover:border-emerald-500 transition-all group space-y-3">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl w-fit text-emerald-400 group-hover:scale-110 transition-transform">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Teach Me Mode</h3>
          <p className="text-xs text-[#8b949e]">Structured 6-section lesson plans grounded in university course materials.</p>
        </Link>
      </div>
    </div>
  );
};
