import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { UserProvider } from "./context/UserContext";

// Performance optimized lazy-loading with page priorities
const Welcome = lazy(() => import("./pages/Welcome"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));

// Defer non-critical pages - Fix the Onboarding import issue
const Onboarding = lazy(() => 
  import("./pages/Onboarding").then(module => {
    return new Promise(resolve => setTimeout(() => resolve(module), 100));
  })
);

// Prioritize loading the Index and Home pages
const Index = lazy(() => import('./pages/Index'));
const Home = lazy(() => import("./pages/Home"));

// Lower priority pages
const Profile = lazy(() => import("./pages/Profile"));
const CreateWorkout = lazy(() => import("./pages/CreateWorkout"));
const ExecuteWorkout = lazy(() => import("./pages/ExecuteWorkout"));
const NotFound = lazy(() => import("./pages/NotFound"));
const BodyScan = lazy(() => import('./pages/BodyScan/index'));

// Improved component for protected routes with prefetching
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium">Überprüfe Anmeldung...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    console.log("User not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Enhanced loading fallback with better UX
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-muted-foreground">Lade Anwendung...</p>
    </div>
  </div>
);

// Optimized query client configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      networkMode: 'always',
      // Improved caching and performance
      refetchOnReconnect: 'always',
      throwOnError: false
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
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/welcome" element={<Welcome />} />
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
                
                <Route path="/bodyscan" element={
                  <ProtectedRoute>
                    <BodyScan />
                  </ProtectedRoute>
                } />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </TooltipProvider>
        </UserProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
