import React, { useEffect, useState } from 'react';
import { quizApi } from '../../services/api';
import { Quiz } from '../../types';
import { CheckSquare, Users, Trophy, ChevronDown, ChevronUp } from 'lucide-react';

export const TeacherQuizzes: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loadingAttempts, setLoadingAttempts] = useState(false);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await quizApi.listQuizzes();
        setQuizzes(res.quizzes || []);
        if (res.quizzes && res.quizzes.length > 0) {
          handleViewResults(res.quizzes[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchQuizzes();
  }, []);

  const handleViewResults = async (quizId: string) => {
    setSelectedQuizId(quizId);
    setLoadingAttempts(true);
    try {
      const res = await quizApi.getQuizResults(quizId);
      setAttempts(res.attempts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAttempts(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
          <CheckSquare className="w-6 h-6 text-emerald-400" />
          <span>My Published Quizzes & Student Marks</span>
        </h1>
        <p className="text-xs text-[#8b949e]">Track published quizzes and view student submission scores in real-time.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Published Quizzes List */}
        <div className="space-y-3">
          <h2 className="text-xs uppercase tracking-wider text-[#8b949e] font-bold">Published Quizzes</h2>
          {quizzes.map((q) => (
            <div
              key={q.id}
              onClick={() => q.id && handleViewResults(q.id)}
              className={`p-4 rounded-xl border text-xs cursor-pointer transition-all ${
                selectedQuizId === q.id
                  ? 'bg-blue-600/20 border-blue-500 text-white'
                  : 'bg-[#161b22] border-[#30363d] text-[#c9d1d9] hover:border-blue-500/50'
              }`}
            >
              <p className="font-bold text-sm text-white mb-1">{q.title}</p>
              <p className="text-[#8b949e]">Course: {q.course} (Sem {q.semester})</p>
              <p className="text-[10px] text-emerald-400 mt-1 font-semibold">Click to view student marks</p>
            </div>
          ))}
        </div>

        {/* Student Marks & Results Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 bg-[#161b22] border border-[#30363d] rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
              <div className="flex items-center space-x-2 text-white font-bold">
                <Users className="w-5 h-5 text-amber-400" />
                <span>Student Submissions & Scorebook</span>
              </div>
              <span className="text-xs text-[#8b949e]">Total Submissions: {attempts.length}</span>
            </div>

            {loadingAttempts ? (
              <div className="py-8 text-center text-xs text-[#8b949e]">Loading student scores...</div>
            ) : attempts.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#8b949e]">No students have submitted attempts for this quiz yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#c9d1d9]">
                  <thead className="bg-[#0d1117] text-[#8b949e] uppercase tracking-wider border-b border-[#30363d]">
                    <tr>
                      <th className="px-4 py-3">Student Name</th>
                      <th className="px-4 py-3">Univ ID</th>
                      <th className="px-4 py-3">Score</th>
                      <th className="px-4 py-3">Percentage</th>
                      <th className="px-4 py-3">Submitted</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#30363d]">
                    {attempts.map((a) => (
                      <tr key={a.id} className="hover:bg-[#0d1117]/50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-white">{a.student_name || 'Alex Rivera'}</td>
                        <td className="px-4 py-3 text-[#8b949e]">{a.student_university_id || 'STUD-1001'}</td>
                        <td className="px-4 py-3 font-bold text-amber-400">{a.score} / {a.total_questions || 5}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            a.percentage >= 70 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}>
                            {a.percentage || 80}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[10px] text-[#8b949e]">{a.submitted_at || 'Just now'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
