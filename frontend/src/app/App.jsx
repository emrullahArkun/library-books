import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MyBooks from '../features/my-books/MyBooks';
import BookStatsPage from '../features/my-books/pages/BookStatsPage';
import ReadingSessionPage from '../features/my-books/pages/ReadingSessionPage';
import LoginPage from '../features/auth/LoginPage';
import RegisterPage from '../features/auth/RegisterPage';

import { AuthProvider } from '../context/AuthContext';
import { AnimationProvider } from '../context/AnimationContext';
import { ReadingSessionProvider } from '../context/ReadingSessionContext';
import ProtectedRoute from '../shared/components/ProtectedRoute';
import PublicRoute from '../shared/components/PublicRoute';
import MainLayout from '../layouts/MainLayout';
import HomePage from '../pages/HomePage';
import './App.css'

function App() {
  return (
    <AuthProvider>
      <AnimationProvider>
        <ReadingSessionProvider>
          <Router>
            <div className="app-container">
              <Routes>
                {/* Protected Routes Layout */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<MainLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/my-books" element={<MyBooks />} />
                    <Route path="/books/:id/stats" element={<BookStatsPage />} />
                    <Route path="/books/:id/session" element={<ReadingSessionPage />} />
                  </Route>
                </Route>

                {/* Public Routes */}
                <Route path="/login" element={
                  <PublicRoute>
                    <LoginPage />
                  </PublicRoute>
                } />
                <Route path="/register" element={
                  <PublicRoute>
                    <RegisterPage />
                  </PublicRoute>
                } />
              </Routes>
            </div>
          </Router>
        </ReadingSessionProvider>
      </AnimationProvider>
    </AuthProvider>
  )
}

export default App

