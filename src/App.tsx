
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { UserProvider } from "./context/UserContext";

import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Onboarding from "./pages/Onboarding";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import CreateWorkout from "./pages/CreateWorkout";
import ExecuteWorkout from "./pages/ExecuteWorkout";
import NotFound from "./pages/NotFound";

// Verbesserte Komponente für geschützte Routen mit besserer Fehlerbehandlung
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // Robustere Authentifizierungsprüfung
  const isAuthenticated = Boolean(localStorage.getItem('user'));
  
  if (!isAuthenticated) {
    console.log("Benutzer nicht authentifiziert, Weiterleitung zur Anmeldeseite");
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Query-Client mit besseren Standardwerten für die Fehlerbehandlung konfigurieren
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      staleTime: 10 * 60 * 1000, // 10 Minuten
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <UserProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Welcome />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
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
              
              <Route path="/create-workout" element={
                <ProtectedRoute>
                  <CreateWorkout />
                </ProtectedRoute>
              } />
              
              <Route path="/workout/:id" element={
                <ProtectedRoute>
                  <ExecuteWorkout />
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </UserProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
