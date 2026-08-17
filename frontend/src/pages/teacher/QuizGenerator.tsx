import React, { useState } from 'react';
import { quizApi } from '../../services/api';
import { Sparkles, Trash2, Plus, Edit3, Send, CheckCircle2, AlertCircle } from 'lucide-react';

interface CustomQuestion {
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  difficulty: string;
  topic: string;
  source: string;
  page: number;
}

export const QuizGenerator: React.FC = () => {
  const [course, setCourse] = useState('CS501');
  const [topic, setTopic] = useState('Normalization (1NF, 2NF, 3NF, BCNF)');
  const [numQ, setNumQ] = useState(5);
  const [difficulty, setDifficulty] = useState('medium');

  // Draft Quiz State
  const [draftQuiz, setDraftQuiz] = useState<any>(null);
  const [validation, setValidation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // Custom Question Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);

  const [newQuestion, setNewQuestion] = useState<CustomQuestion>({
    question: '',
    options: ['', '', '', ''],
    correct_answer: '',
    explanation: '',
    difficulty: 'medium',
    topic: 'Database Systems',
    source: 'Faculty Custom Question',
    page: 1
  });

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await quizApi.generateQuiz({
        course,
        topic,
        num_questions: numQ,
        difficulty,
      });
      setDraftQuiz(res.quiz);
      setValidation(res.validation);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Quiz generation failed.');
    } finally {
      setLoading(false);
    }
  };

  // Start Draft manually if no AI generation
  const handleStartManualQuiz = () => {
    setDraftQuiz({
      title: `${course} Quiz - ${topic}`,
      course,
      semester: 5,
      topic,
      questions: []
    });
  };

  // Delete Question
  const handleDeleteQuestion = (indexToDelete: number) => {
    if (!draftQuiz) return;
    const updated = draftQuiz.questions.filter((_: any, idx: number) => idx !== indexToDelete);
    setDraftQuiz({ ...draftQuiz, questions: updated });
  };

  // Add / Edit Question Handler
  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.question.trim()) return alert('Question text is required.');
    if (newQuestion.options.some(o => !o.trim())) return alert('All 4 options must be filled.');
    if (!newQuestion.correct_answer.trim()) return alert('Correct answer selection is required.');

    if (!draftQuiz) {
      setDraftQuiz({
        title: `${course} Quiz - ${topic}`,
        course,
        semester: 5,
        topic,
        questions: [newQuestion]
      });
    } else {
      let updatedQuestions = [...draftQuiz.questions];
      if (editingIdx !== null) {
        updatedQuestions[editingIdx] = newQuestion;
      } else {
        updatedQuestions.push(newQuestion);
      }
      setDraftQuiz({ ...draftQuiz, questions: updatedQuestions });
    }

    // Reset Form
    setShowAddModal(false);
    setEditingIdx(null);
    setNewQuestion({
      question: '',
      options: ['', '', '', ''],
      correct_answer: '',
      explanation: '',
      difficulty: 'medium',
      topic: topic || 'Database Systems',
      source: 'Faculty Custom Question',
      page: 1
    });
  };

  const handleEditQuestion = (indexToEdit: number) => {
    const q = draftQuiz.questions[indexToEdit];
    setNewQuestion({ ...q });
    setEditingIdx(indexToEdit);
    setShowAddModal(true);
  };

  const handlePublish = async () => {
    if (!draftQuiz || draftQuiz.questions.length === 0) {
      return alert('Cannot publish a quiz with no questions.');
    }
    setPublishing(true);
    try {
      await quizApi.publishQuiz('new', {
        title: draftQuiz.title,
        course: draftQuiz.course,
        semester: draftQuiz.semester || 5,
        topic: draftQuiz.topic,
        questions: draftQuiz.questions,
      });
      alert('Quiz published and assigned to students successfully!');
      setDraftQuiz(null);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Publish failed.');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
          <Sparkles className="w-6 h-6 text-amber-400" />
          <span>AI-Powered & Custom Quiz Builder</span>
        </h1>
        <p className="text-xs text-[#8b949e]">
          Generate quizzes via AI, delete unneeded questions, or add custom faculty questions manually.
        </p>
      </div>

      {/* Generator Form Toolbar */}
      <form onSubmit={handleGenerate} className="p-6 bg-[#161b22] border border-[#30363d] rounded-2xl space-y-4 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-[#8b949e] font-semibold mb-1">Course</label>
            <select
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl p-2.5 text-white"
            >
              <option value="CS501">CS501 - Database Systems</option>
              <option value="CS502">CS502 - Operating Systems</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-[#8b949e] font-semibold mb-1">Quiz Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Normalization and BCNF"
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl p-2.5 text-white"
            />
          </div>
          <div>
            <label className="block text-[#8b949e] font-semibold mb-1">AI MCQs Count ({numQ})</label>
            <input
              type="range"
              min={3}
              max={10}
              value={numQ}
              onChange={(e) => setNumQ(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl transition-colors flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? 'Executing AI Generator...' : 'Generate AI Quiz'}</span>
          </button>
          
          <button
            type="button"
            onClick={handleStartManualQuiz}
            className="px-5 py-2.5 bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] text-white font-semibold rounded-xl transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Start Blank Manual Quiz</span>
          </button>
        </div>
      </form>

      {/* Review & Edit Quiz Draft */}
      {draftQuiz && (
        <div className="p-6 bg-[#161b22] border border-[#30363d] rounded-2xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#30363d] pb-4">
            <div>
              <h2 className="text-lg font-bold text-white">{draftQuiz.title}</h2>
              <p className="text-xs text-[#8b949e]">
                Total Questions: <strong className="text-white">{draftQuiz.questions.length}</strong>
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => {
                  setEditingIdx(null);
                  setNewQuestion({
                    question: '',
                    options: ['', '', '', ''],
                    correct_answer: '',
                    explanation: '',
                    difficulty: 'medium',
                    topic: topic || 'Database Systems',
                    source: 'Faculty Custom Question',
                    page: 1
                  });
                  setShowAddModal(true);
                }}
                className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs font-semibold rounded-xl transition-colors flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Custom Question</span>
              </button>

              <button
                onClick={handlePublish}
                disabled={publishing || draftQuiz.questions.length === 0}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-colors flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>{publishing ? 'Publishing...' : 'Publish to Students'}</span>
              </button>
            </div>
          </div>

          {draftQuiz.questions.length === 0 ? (
            <div className="p-8 bg-[#0d1117] border border-[#30363d] rounded-xl text-center text-xs text-[#8b949e]">
              No questions in draft. Click <strong>"+ Add Custom Question"</strong> above to add your own question.
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              {draftQuiz.questions.map((q: any, idx: number) => (
                <div key={idx} className="p-4 bg-[#0d1117] border border-[#30363d] rounded-xl space-y-3 relative group">
                  <div className="flex items-start justify-between">
                    <p className="font-bold text-white text-sm pr-16">Q{idx+1}: {q.question}</p>

                    {/* Question Actions: Edit / Delete */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditQuestion(idx)}
                        className="p-1.5 bg-[#161b22] hover:bg-[#30363d] text-blue-400 border border-[#30363d] rounded-lg transition-colors"
                        title="Edit Question"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(idx)}
                        className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg transition-colors"
                        title="Delete Question"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {q.options.map((opt: string, oIdx: number) => (
                      <div
                        key={oIdx}
                        className={`p-2 rounded border ${
                          opt === q.correct_answer
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-semibold'
                            : 'bg-[#161b22] text-[#c9d1d9] border-[#30363d]'
                        }`}
                      >
                        {opt === q.correct_answer ? '✅ ' : '⚪ '}{opt}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-[#8b949e]">
                    <span>💡 {q.explanation}</span>
                    <span className="text-amber-400 font-semibold">{q.source || 'Custom Question'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal for Adding / Editing Custom Question */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-[#161b22] border border-[#30363d] rounded-2xl p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="text-base font-bold text-white border-b border-[#30363d] pb-3">
              {editingIdx !== null ? 'Edit Question' : 'Add Custom Faculty Question'}
            </h3>

            <form onSubmit={handleSaveQuestion} className="space-y-4">
              <div>
                <label className="block text-[#8b949e] font-semibold mb-1">Question Prompt</label>
                <textarea
                  required
                  rows={2}
                  value={newQuestion.question}
                  onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                  placeholder="Enter custom question text..."
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[#8b949e] font-semibold">Answer Options (4 Options)</label>
                {newQuestion.options.map((opt, oIdx) => (
                  <input
                    key={oIdx}
                    type="text"
                    required
                    value={opt}
                    onChange={(e) => {
                      const updatedOpts = [...newQuestion.options];
                      updatedOpts[oIdx] = e.target.value;
                      setNewQuestion({ ...newQuestion, options: updatedOpts });
                    }}
                    placeholder={`Option ${oIdx + 1}`}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl p-2.5 text-white"
                  />
                ))}
              </div>

              <div>
                <label className="block text-[#8b949e] font-semibold mb-1">Select Correct Answer</label>
                <select
                  required
                  value={newQuestion.correct_answer}
                  onChange={(e) => setNewQuestion({ ...newQuestion, correct_answer: e.target.value })}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl p-2.5 text-white"
                >
                  <option value="">Select which option is correct...</option>
                  {newQuestion.options.map((opt, oIdx) => (
                    opt.trim() ? <option key={oIdx} value={opt}>{opt}</option> : null
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#8b949e] font-semibold mb-1">Explanation</label>
                <input
                  type="text"
                  value={newQuestion.explanation}
                  onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
                  placeholder="Explanation for why this option is correct..."
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-[#0d1117] border border-[#30363d] text-[#8b949e] hover:text-white rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl"
                >
                  {editingIdx !== null ? 'Save Changes' : 'Add Question to Quiz'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
