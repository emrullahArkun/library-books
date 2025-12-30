import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Navbar from '../common/components/Navbar';
import MyBooks from '../features/my-books/MyBooks';
import BookStatsPage from '../features/my-books/pages/BookStatsPage';
import BookSearch from '../features/book-search/BookSearch';
import LoginPage from '../features/auth/LoginPage';
import RegisterPage from '../features/auth/RegisterPage';
import VerifyEmailPage from '../features/auth/VerifyEmailPage';
import { AuthProvider } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import PublicRoute from '../components/PublicRoute';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import './App.css'

// Layout component included Navbar
const MainLayout = () => {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
};

const TypewriterTitle = () => {
  const { t } = useTranslation();
  const fullText = t('search.welcomeMessage');
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Reset if text changes (e.g. language switch)
    if (currentIndex === 0) setDisplayedText('');

    if (currentIndex < fullText.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + fullText[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 50); // Typing speed
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, fullText]);

  // Handle language switch reset
  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
  }, [fullText]);

  return (
    <h1 style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "1.5em" }}>
      {displayedText}
      {currentIndex < fullText.length && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
          style={{ display: 'inline-block', marginLeft: '2px', width: '2px', height: '1em', backgroundColor: 'currentColor' }}
        />
      )}
    </h1>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Routes>
            {/* Routes with Navbar */}
            <Route element={<MainLayout />}>
              <Route path="/" element={
                <ProtectedRoute>
                  <div className="home-content">
                    <TypewriterTitle />
                    <BookSearch />
                  </div>
                </ProtectedRoute>
              } />
              <Route path="/my-books" element={
                <ProtectedRoute>
                  <MyBooks />
                </ProtectedRoute>
              } />
              <Route path="/books/:id/stats" element={
                <ProtectedRoute>
                  <BookStatsPage />
                </ProtectedRoute>
              } />
            </Route>

            {/* Routes without Navbar */}
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
            <Route path="/verify" element={<VerifyEmailPage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
