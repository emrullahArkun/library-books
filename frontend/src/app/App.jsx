import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Navbar from '../common/components/Navbar';
import MyBooks from '../features/my-books/MyBooks';
import BookSearch from '../features/book-search/BookSearch';
import LoginPage from '../features/auth/LoginPage';
import RegisterPage from '../features/auth/RegisterPage';
import VerifyEmailPage from '../features/auth/VerifyEmailPage';
import { AuthProvider } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import PublicRoute from '../components/PublicRoute';
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
                    <h1>Welcome to Library Books</h1>
                    <BookSearch />
                  </div>
                </ProtectedRoute>
              } />
              <Route path="/my-books" element={
                <ProtectedRoute>
                  <MyBooks />
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
