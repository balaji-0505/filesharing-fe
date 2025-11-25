import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { AnalyticsProvider } from './contexts/AnalyticsContext';
import { DataProvider } from './contexts/DataContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import Passhare from './pages/Passhare';
import SessionView from './pages/SessionView';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <AnalyticsProvider>
            <DataProvider>
              <Router>
                <div className="App min-h-screen flex flex-col">
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route 
                      path="/dashboard" 
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/analytics" 
                      element={
                        <ProtectedRoute>
                          <Analytics />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/profile" 
                      element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/passhare" 
                      element={
                        <ProtectedRoute>
                          <Passhare />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/passhare/session/:sessionId" 
                      element={
                        <ProtectedRoute>
                          <SessionView />
                        </ProtectedRoute>
                      } 
                    />
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                  
                  <Toaster 
                    position="top-right"
                    toastOptions={{
                      duration: 4000,
                      style: {
                        background: '#1e293b',
                        color: '#fff',
                        borderRadius: '12px',
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                      },
                    }}
                  />
                </div>
              </Router>
            </DataProvider>
          </AnalyticsProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
