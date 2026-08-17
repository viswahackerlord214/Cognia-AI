import React, { useState } from 'react';
import { quizApi } from '../../services/api';
import { FileQuestion, CheckCircle2 } from 'lucide-react';

export const PracticeMCQs: React.FC = () => {
  const [course, setCourse] = useState('CS501');
  const [topic, setTopic] = useState('Database Indexing & B+ Trees');
  const [numQ, setNumQ] = useState(5);
  const [difficulty, setDifficulty] = useState('medium');
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await quizApi.generateQuiz({ course, topic, num_questions: numQ, difficulty });
      setQuestions(res.quiz?.questions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
          <FileQuestion className="w-6 h-6 text-amber-400" />
          <span>Instant MCQ Practice Generator</span>
        </h1>
        <p className="text-xs text-[#8b949e]">Generate grounded self-practice questions on demand.</p>
      </div>

      <form onSubmit={handleGenerate} className="p-4 bg-[#161b22] border border-[#30363d] rounded-xl flex gap-3 text-xs">
        <select
          value={course}
          onChange={(e) => setCourse(e.target.value)}
          className="bg-[#0d1117] border border-[#30363d] rounded-xl px-3 py-2.5 text-white"
        >
          <option value="CS501">CS501</option>
          <option value="CS502">CS502</option>
        </select>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Topic e.g. B+ Trees"
          className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-2.5 text-white"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl transition-colors"
        >
          {loading ? 'Generating MCQs...' : 'Generate Practice MCQs'}
        </button>
      </form>

      <div className="space-y-4">
        {questions.map((q, idx) => (
          <div key={idx} className="p-5 bg-[#161b22] border border-[#30363d] rounded-2xl space-y-3 text-xs">
            <p className="text-sm font-bold text-white">Q{idx+1}: {q.question}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {q.options.map((opt: string, oIdx: number) => (
                <div key={oIdx} className="p-2.5 bg-[#0d1117] border border-[#30363d] rounded-xl text-[#c9d1d9]">
                  ⚪ {opt}
                </div>
              ))}
            </div>
            <details className="text-emerald-400 font-semibold cursor-pointer">
              <summary className="hover:underline">Reveal Correct Answer & Explanation</summary>
              <div className="mt-2 p-3 bg-[#0d1117] border border-emerald-500/30 rounded-xl text-xs space-y-1 text-[#c9d1d9]">
                <p>✅ <strong>Correct Answer:</strong> {q.correct_answer}</p>
                <p className="text-[#8b949e]">💡 {q.explanation}</p>
                <p className="text-[10px] text-blue-400">Source: {q.source} (Page {q.page})</p>
              </div>
            </details>
          </div>
        ))}
      </div>
    </div>
  );
};
