import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Center, Spinner } from '@chakra-ui/react';

// Lazy Load Pages
const MyBooks = lazy(() => import('../features/my-books/MyBooks'));
const BookStatsPage = lazy(() => import('../features/my-books/pages/BookStatsPage'));
const ReadingSessionPage = lazy(() => import('../features/my-books/pages/ReadingSessionPage'));
const LoginPage = lazy(() => import('../features/auth/LoginPage'));
const RegisterPage = lazy(() => import('../features/auth/RegisterPage'));
const HomePage = lazy(() => import('../pages/HomePage'));
const DiscoveryPage = lazy(() => import('../features/discovery/DiscoveryPage'));

import { AuthProvider } from '../context/AuthContext';
import { AnimationProvider } from '../context/AnimationContext';
import { ReadingSessionProvider } from '../context/ReadingSessionContext';
import ProtectedRoute from '../shared/components/ProtectedRoute';
import PublicRoute from '../shared/components/PublicRoute';
import MainLayout from '../layouts/MainLayout';
import './App.css'

// Loading Component
const PageLoader = () => (
  <Center h="100vh" w="full" bg="transparent">
    <Spinner size="xl" color="teal.200" thickness="4px" />
  </Center>
);

function App() {
  return (
    <AuthProvider>
      <AnimationProvider>
        <ReadingSessionProvider>
          <Router>
            <div className="app-container">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Protected Routes Layout */}
                  <Route element={<ProtectedRoute />}>
                    {/* Standard Layout */}
                    <Route element={<MainLayout />}>
                      <Route path="/search" element={<HomePage />} />
                    </Route>

                    {/* Full Width Layout */}
                    <Route element={<MainLayout fullWidth={true} />}>
                      <Route path="/" element={<DiscoveryPage />} />
                      <Route path="/discovery" element={<DiscoveryPage />} />
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
              </Suspense>
            </div>
          </Router>
        </ReadingSessionProvider>
      </AnimationProvider>
    </AuthProvider>
  )
}

export default App

