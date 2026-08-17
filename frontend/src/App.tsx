import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

// Auth Pages
import { Login } from './pages/auth/Login';
import { Signup } from './pages/auth/Signup';
import { PendingApproval } from './pages/auth/PendingApproval';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentAssistant } from './pages/student/StudentAssistant';
import { StudyMaterials } from './pages/student/StudyMaterials';
import { PYQHub } from './pages/student/PYQHub';
import { TeachMe } from './pages/student/TeachMe';
import { PracticeMCQs } from './pages/student/PracticeMCQs';
import { StudentQuizzes } from './pages/student/StudentQuizzes';

// Teacher Pages
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';
import { UploadMaterial } from './pages/teacher/UploadMaterial';
import { QuizGenerator } from './pages/teacher/QuizGenerator';
import { TeacherQuizzes } from './pages/teacher/TeacherQuizzes';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserApprovals } from './pages/admin/UserApprovals';
import { DocumentManagement } from './pages/admin/DocumentManagement';

const ProtectedLayout: React.FC<{ allowedRoles?: string[] }> = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center text-sm text-blue-400">
        Loading Cognia AI Authentication...
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (user.status === 'pending') return <Navigate to="/pending" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8 overflow-y-auto">
          <Routes>
            <Route
              path="/"
              element={
                user.role === 'admin' ? (
                  <Navigate to="/admin/dashboard" replace />
                ) : user.role === 'teacher' ? (
                  <Navigate to="/teacher/dashboard" replace />
                ) : (
                  <Navigate to="/student/dashboard" replace />
                )
              }
            />

            {/* Student Routes */}
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/assistant" element={<StudentAssistant />} />
            <Route path="/student/materials" element={<StudyMaterials />} />
            <Route path="/student/pyqs" element={<PYQHub />} />
            <Route path="/student/learn" element={<TeachMe />} />
            <Route path="/student/practice" element={<PracticeMCQs />} />
            <Route path="/student/quizzes" element={<StudentQuizzes />} />

            {/* Teacher Routes */}
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
            <Route path="/teacher/assistant" element={<StudentAssistant />} />
            <Route path="/teacher/documents" element={<UploadMaterial />} />
            <Route path="/teacher/quiz-generator" element={<QuizGenerator />} />
            <Route path="/teacher/quizzes" element={<TeacherQuizzes />} />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserApprovals />} />
            <Route path="/admin/documents" element={<DocumentManagement />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/pending" element={<PendingApproval />} />
          <Route path="/*" element={<ProtectedLayout />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
