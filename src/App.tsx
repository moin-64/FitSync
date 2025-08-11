
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { AuthProvider } from './context/AuthContext';
import { SecureAuthProvider } from './context/SecureAuthContext';
import { UserProvider } from './context/UserContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import SecureLogin from './pages/SecureLogin';
import SecureRegister from './pages/SecureRegister';
import Home from './pages/Home';
import Onboarding from './pages/Onboarding';
import Profile from './pages/Profile';
import Workouts from './pages/Workouts';
import Friends from './pages/Friends';
import WorkoutSession from './pages/WorkoutSession';
import Analytics from './pages/Analytics';
import ConnectionStatus from './components/ConnectionStatus';
import './App.css';

function App() {
  const { toast } = useToast();

  useEffect(() => {
    const handleOnline = () => toast({ title: 'Online', description: 'Verbindung wiederhergestellt' });
    const handleOffline = () => toast({ title: 'Offline', description: 'Keine Internetverbindung', variant: 'destructive' });

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  return (
    <Router>
      <div className="App">
        <AuthProvider>
          <SecureAuthProvider>
            <UserProvider>
              <ConnectionStatus />
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/secure-login" element={<SecureLogin />} />
                <Route path="/secure-register" element={<SecureRegister />} />
                
                {/* Protected routes */}
                <Route path="/onboarding" element={
                  <ProtectedRoute>
                    <Onboarding />
                  </ProtectedRoute>
                } />
                <Route path="/home" element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/workouts" element={
                  <ProtectedRoute>
                    <Workouts />
                  </ProtectedRoute>
                } />
                <Route path="/friends" element={
                  <ProtectedRoute>
                    <Friends />
                  </ProtectedRoute>
                } />
                <Route path="/workout/:id" element={
                  <ProtectedRoute>
                    <WorkoutSession />
                  </ProtectedRoute>
                } />
                <Route path="/analytics" element={
                  <ProtectedRoute>
                    <Analytics />
                  </ProtectedRoute>
                } />
                
                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              <Toaster />
            </UserProvider>
          </SecureAuthProvider>
        </AuthProvider>
      </div>
    </Router>
  );
}

export default App;
