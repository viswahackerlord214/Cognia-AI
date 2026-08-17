import React, { useState } from 'react';
import { ragApi } from '../../services/api';
import { BookOpen, Search, BarChart3, Info } from 'lucide-react';

export const PYQHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'search' | 'analyze'>('search');
  const [course, setCourse] = useState('CS501');
  const [query, setQuery] = useState('Normalization BCNF 3NF');
  const [results, setResults] = useState<any[]>([]);
  const [analysisText, setAnalysisText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await ragApi.searchPyqs(course, query);
      setResults(res.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const res = await ragApi.analyzePyqs(course);
      setAnalysisText(res.analysis);
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
          <BookOpen className="w-6 h-6 text-purple-400" />
          <span>Previous Year Questions (PYQs) Hub</span>
        </h1>
        <p className="text-xs text-[#8b949e]">Search past examination question papers and analyze historical topic occurrences.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#30363d] space-x-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('search')}
          className={`pb-3 border-b-2 transition-colors flex items-center space-x-2 ${
            activeTab === 'search' ? 'border-purple-500 text-purple-400' : 'border-transparent text-[#8b949e] hover:text-white'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Search PYQs</span>
        </button>
        <button
          onClick={() => setActiveTab('analyze')}
          className={`pb-3 border-b-2 transition-colors flex items-center space-x-2 ${
            activeTab === 'analyze' ? 'border-purple-500 text-purple-400' : 'border-transparent text-[#8b949e] hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Historical Topic Frequency</span>
        </button>
      </div>

      {activeTab === 'search' ? (
        <div className="space-y-6">
          <form onSubmit={handleSearch} className="p-4 bg-[#161b22] border border-[#30363d] rounded-xl flex gap-3 text-xs">
            <select
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              className="bg-[#0d1117] border border-[#30363d] rounded-xl px-3 py-2.5 text-white"
            >
              <option value="CS501">CS501 - Database Systems</option>
              <option value="CS502">CS502 - Operating Systems</option>
            </select>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search topic e.g. Normalization, Transactions, B+ Trees"
              className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-2.5 text-white"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition-colors"
            >
              {loading ? 'Searching...' : 'Search PYQs'}
            </button>
          </form>

          <div className="space-y-3">
            {results.map((r, idx) => (
              <div key={idx} className="p-4 bg-[#161b22] border border-[#30363d] rounded-xl text-xs space-y-2">
                <div className="flex justify-between text-white font-bold">
                  <span>Match #{idx+1} — {r.filename}</span>
                  <span className="text-purple-400">Page {r.page_number}</span>
                </div>
                <p className="text-[#c9d1d9] bg-[#0d1117] p-3 rounded-lg border border-[#30363d]">{r.content}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            {loading ? 'Analyzing...' : 'Generate Historical PYQ Frequency Report'}
          </button>

          {analysisText && (
            <div className="p-6 bg-[#161b22] border border-[#30363d] rounded-2xl whitespace-pre-wrap text-sm text-[#c9d1d9] leading-relaxed">
              {analysisText}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
