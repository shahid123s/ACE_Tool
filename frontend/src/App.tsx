import './index.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Pages
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import { useAuth } from "./context/AuthContext";
import { Toaster } from 'sonner';

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  // if (!isAuthenticated) {
  //   return <Navigate to="/login" replace />;
  // }

  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}

export default App
