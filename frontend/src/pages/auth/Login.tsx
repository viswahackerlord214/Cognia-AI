import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Sparkles, AlertTriangle } from 'lucide-react';

export const Login: React.FC = () => {
  const { loginWithCredentials } = useAuth();
  const [email, setEmail] = useState('student@univ.edu');
  const [password, setPassword] = useState('student123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginWithCredentials(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid credentials. Password check failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
    try {
      await loginWithCredentials(demoEmail, demoPass);
      navigate('/');
    } catch (err: any) {
      setError('Quick login failed.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#161b22] border border-[#30363d] rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-blue-500/10 border border-blue-500/30 rounded-2xl text-blue-400 mb-2">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide">COGNIA AI</h1>
          <p className="text-xs text-[#8b949e]">University Knowledge & Assessment Intelligence Platform</p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-2">
              University Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-3 text-sm text-white placeholder-[#8b949e] focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="e.g. viswaravindren@gmail.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-3 text-sm text-white placeholder-[#8b949e] focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-600/20 flex items-center justify-center space-x-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'Verifying Password...' : 'Sign In to Cognia AI'}</span>
          </button>
        </form>

        <div className="pt-4 border-t border-[#30363d] space-y-3">
          <p className="text-xs text-center text-[#8b949e] uppercase font-semibold tracking-wider">
            Quick Interview Demo Sign In
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickLogin('student@univ.edu', 'student123')}
              className="p-2.5 bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] rounded-lg text-blue-400 font-medium text-left"
            >
              🎓 Student (student123)
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('teacher@univ.edu', 'teacher123')}
              className="p-2.5 bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] rounded-lg text-amber-400 font-medium text-left"
            >
              👨‍🏫 Faculty (teacher123)
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('viswaravindren@gmail.com', 'viswacool21')}
              className="p-2.5 bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] rounded-lg text-red-400 font-medium text-left"
            >
              🛠️ Admin (viswacool21)
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('pending_student@univ.edu', 'pending123')}
              className="p-2.5 bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] rounded-lg text-purple-400 font-medium text-left"
            >
              ⏳ Pending (pending123)
            </button>
          </div>
        </div>

        <p className="text-xs text-center text-[#8b949e]">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-400 font-semibold hover:underline">
            Register as Student / Teacher
          </Link>
        </p>
      </div>
    </div>
  );
};
