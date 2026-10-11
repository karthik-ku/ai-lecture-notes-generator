import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import GenerateNotesPage from './pages/GenerateNotesPage';
import MyNotesPage from './pages/MyNotesPage';
import NoteDetailPage from './pages/NoteDetailPage';
import AskAiPage from './pages/AskAiPage';
import QuizPage from './pages/QuizPage';
import SettingsPage from './pages/SettingsPage';

// Public route helper that redirects already-authenticated users to /dashboard
const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicOnlyRoute>
            <SignupPage />
          </PublicOnlyRoute>
        }
      />

      {/* Protected Student Dashboard Area */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/generate" element={<GenerateNotesPage />} />
          <Route path="/notes" element={<MyNotesPage />} />
          <Route path="/notes/:id" element={<NoteDetailPage />} />
          <Route path="/chat" element={<AskAiPage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/quiz/:noteId" element={<QuizPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
