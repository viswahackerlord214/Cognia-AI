import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Sparkles, AlertTriangle } from 'lucide-react';

export const Signup: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    university_id: '',
    requested_role: 'student', // student or teacher ONLY
    department: 'CS',
    course: 'CS501',
    semester: 5,
    section: 'A',
    designation: ''
  });

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await register(formData);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed.');
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-[#161b22] border border-[#30363d] rounded-2xl p-8 shadow-2xl text-center space-y-4">
          <div className="inline-flex p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">Registration Submitted!</h2>
          <p className="text-sm text-[#8b949e]">
            Your registration request for <strong className="text-white">{formData.email}</strong> has been submitted.
          </p>
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 text-xs">
            ⏳ <strong>Account Status: PENDING</strong><br />
            An administrator must review and approve your registration before you can access the Cognia AI platform.
          </div>
          <button
            onClick={() => navigate('/login')}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-[#161b22] border border-[#30363d] rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-white tracking-wide">University Account Registration</h1>
          <p className="text-xs text-[#8b949e]">Create your Cognia AI profile. Requires Admin Approval.</p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#8b949e] uppercase mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-blue-500"
                placeholder="Alex Rivera"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#8b949e] uppercase mb-1">University ID / Roll No</label>
              <input
                type="text"
                required
                value={formData.university_id}
                onChange={(e) => setFormData({ ...formData, university_id: e.target.value })}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-blue-500"
                placeholder="STUD-501"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#8b949e] uppercase mb-1">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-blue-500"
                placeholder="alex@univ.edu"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#8b949e] uppercase mb-1">Password</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-blue-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#8b949e] uppercase mb-1">Requested Role</label>
              <select
                value={formData.requested_role}
                onChange={(e) => setFormData({ ...formData, requested_role: e.target.value })}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher / Faculty</option>
              </select>
              <p className="text-[10px] text-[#8b949e] mt-0.5">*Admin registration is prohibited.</p>
            </div>
            <div>
              <label className="block font-semibold text-[#8b949e] uppercase mb-1">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="CS">CS - Computer Science</option>
                <option value="EC">EC - Electronics</option>
                <option value="ME">ME - Mechanical</option>
                <option value="EE">EE - Electrical</option>
              </select>
            </div>
          </div>

          {formData.requested_role === 'student' ? (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-[#8b949e] uppercase mb-1">Course</label>
                <input
                  type="text"
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-3 py-2.5 text-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#8b949e] uppercase mb-1">Semester</label>
                <input
                  type="number"
                  min={1}
                  max={8}
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) || 1 })}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-3 py-2.5 text-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#8b949e] uppercase mb-1">Section</label>
                <input
                  type="text"
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-3 py-2.5 text-white"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block font-semibold text-[#8b949e] uppercase mb-1">Faculty Designation</label>
              <input
                type="text"
                placeholder="e.g. Associate Professor"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-3 py-2.5 text-white"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-600/20 flex items-center justify-center space-x-2 text-sm mt-4"
          >
            <UserPlus className="w-4 h-4" />
            <span>Submit Registration for Admin Approval</span>
          </button>
        </form>

        <p className="text-xs text-center text-[#8b949e]">
          Already registered?{' '}
          <Link to="/login" className="text-blue-400 font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
