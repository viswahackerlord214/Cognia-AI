import React, { useState, useEffect } from 'react';
import { quizApi } from '../../services/api';
import { Quiz } from '../../types';
import { CheckSquare, Trophy, AlertCircle } from 'lucide-react';

export const StudentQuizzes: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await quizApi.listQuizzes();
        setQuizzes(res.quizzes || []);
        if (res.quizzes && res.quizzes.length > 0) {
          setSelectedQuiz(res.quizzes[0]);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchQuizzes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuiz?.id) return;
    setLoading(true);
    try {
      const res = await quizApi.submitAttempt(selectedQuiz.id, answers);
      setResult(res);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Submission failed.');
    } finally {
      setLoading(false);
    }
  };

  const questions = selectedQuiz?.quiz_questions || selectedQuiz?.questions || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
          <CheckSquare className="w-6 h-6 text-rose-400" />
          <span>Assigned Course Quizzes</span>
        </h1>
        <p className="text-xs text-[#8b949e]">Complete assigned quizzes, submit attempts, and view scoring breakdowns.</p>
      </div>

      {quizzes.length === 0 ? (
        <div className="p-8 bg-[#161b22] border border-[#30363d] rounded-2xl text-center text-xs text-[#8b949e]">
          No assigned quizzes found for your semester.
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-4 bg-[#161b22] border border-[#30363d] rounded-xl flex items-center justify-between text-xs">
            <span className="text-[#8b949e]">Select Quiz:</span>
            <select
              value={selectedQuiz?.id || ''}
              onChange={(e) => {
                const found = quizzes.find((q) => q.id === e.target.value);
                if (found) {
                  setSelectedQuiz(found);
                  setAnswers({});
                  setResult(null);
                }
              }}
              className="bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-2 text-white font-semibold"
            >
              {quizzes.map((q) => (
                <option key={q.id} value={q.id}>{q.title}</option>
              ))}
            </select>
          </div>

          {result ? (
            <div className="p-6 bg-[#161b22] border border-[#30363d] rounded-2xl space-y-4 text-xs">
              <div className="flex items-center space-x-3 text-emerald-400">
                <Trophy className="w-8 h-8" />
                <div>
                  <h2 className="text-xl font-bold text-white">Quiz Attempt Result</h2>
                  <p>Score: <strong className="text-emerald-400">{result.score}/{result.total} ({result.percentage}%)</strong></p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                {result.breakdown.map((item: any, idx: number) => (
                  <div key={idx} className={`p-4 rounded-xl border ${item.is_correct ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                    <p className="font-bold text-white">Q{idx+1}: {item.question_text}</p>
                    <p className="mt-1">Your Answer: <code className="text-amber-300">{item.user_answer || 'None'}</code> | Correct: <code className="text-emerald-400">{item.correct_answer}</code></p>
                    <p className="text-[#8b949e] mt-1">💡 {item.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {questions.map((q: any, idx: number) => {
                const opts = typeof q.options === 'string' ? JSON.parse(q.options) : q.options || [];
                return (
                  <div key={idx} className="p-5 bg-[#161b22] border border-[#30363d] rounded-2xl space-y-3 text-xs">
                    <p className="text-sm font-bold text-white">Q{idx+1}: {q.question_text || q.question}</p>
                    <div className="space-y-2">
                      {opts.map((opt: string, oIdx: number) => (
                        <label key={oIdx} className="flex items-center space-x-3 p-3 bg-[#0d1117] border border-[#30363d] rounded-xl hover:border-blue-500/50 cursor-pointer">
                          <input
                            type="radio"
                            name={`q_${idx}`}
                            value={opt}
                            checked={answers[idx] === opt}
                            onChange={() => setAnswers({ ...answers, [idx]: opt })}
                            className="text-blue-600 focus:ring-0"
                          />
                          <span className="text-[#c9d1d9]">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors text-sm shadow-lg"
              >
                {loading ? 'Submitting Attempt...' : 'Submit Quiz Attempt'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
