import './index.css'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Pages
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Worklogs from "./pages/Worklogs";
import NotFound from "./pages/NotFound";
import { Toaster } from 'sonner';
import { useAppSelector, useAppDispatch } from "./app/hooks";
import { selectIsAuthenticated, logout, setCredentials } from "./app/authSlice";
import { useGetMeQuery } from "./app/apiService";
import { useEffect } from "react";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const { data, isLoading, error } = useGetMeQuery(undefined, {
    skip: !isAuthenticated,
  });
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (error) {
      dispatch(logout());
    } else if (data) {
      dispatch(setCredentials({ user: data.user, accessToken: localStorage.getItem('accessToken') || '' }));
    }
  }, [data, error, dispatch]);

  if (isLoading && isAuthenticated) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  console.log(isAuthenticated)
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
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
          <Route
            path="/worklogs"
            element={
              <ProtectedRoute>
                <Worklogs />
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
