import './index.css'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Public + student pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import ForgotPassword from "./pages/ForgotPassword";
import Worklogs from "./pages/Worklogs";
import Reports from "./pages/Reports";
import BlogPosts from "./pages/BlogPosts";
import LeetCode from './pages/LeetCode';
import Meetings from './pages/Meetings';
import Concerns from './pages/Concerns';
import Requests from './pages/Requests';
import Attendance from './pages/Attendance';
import NotFound from "./pages/NotFound";

// Admin pages
import AdminOverview from "./pages/admin/AdminOverview";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminWorklogs from "./pages/admin/AdminWorklogs";
import AdminReports from "./pages/admin/AdminReports";
import AdminBlogPosts from "./pages/admin/AdminBlogPosts";
import AdminMeetings from "./pages/admin/AdminMeetings";
import AdminConcerns from "./pages/admin/AdminConcerns";
import AdminRequests from "./pages/admin/AdminRequests";
import AdminAlerts from "./pages/admin/AdminAlerts";

import { Toaster } from 'sonner';
import { useAppSelector, useAppDispatch } from "./app/hooks";
import { selectIsAuthenticated, selectIsAdmin, logout, setCredentials } from "./app/authSlice";
import { useGetMeQuery } from "./app/apiService";
import { useEffect } from "react";

const queryClient = new QueryClient();

// ─── Student / general protected route ───────────────────────────────────────
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isAdmin = useAppSelector(selectIsAdmin);
  const { data, isLoading, error } = useGetMeQuery(undefined, { skip: !isAuthenticated });
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (error) dispatch(logout());
    else if (data) dispatch(setCredentials({ user: data.user, accessToken: localStorage.getItem('accessToken') || '' }));
  }, [data, error, dispatch]);

  if (isLoading && isAuthenticated) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (isAdmin) return <Navigate to="/admin" replace />;
  return <>{children}</>;
};

// ─── Admin-only protected route ───────────────────────────────────────────────
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isAdmin = useAppSelector(selectIsAdmin);
  const { data, isLoading, error } = useGetMeQuery(undefined, { skip: !isAuthenticated });
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (error) dispatch(logout());
    else if (data) dispatch(setCredentials({ user: data.user, accessToken: localStorage.getItem('accessToken') || '' }));
  }, [data, error, dispatch]);

  if (isLoading && isAuthenticated) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* ─── Student routes ─── */}
          <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/worklogs" element={<ProtectedRoute><Worklogs /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          <Route path="/blogs" element={<ProtectedRoute><BlogPosts /></ProtectedRoute>} />
          <Route path="/leetcode" element={<ProtectedRoute><LeetCode /></ProtectedRoute>} />
          <Route path="/meetings" element={<ProtectedRoute><Meetings /></ProtectedRoute>} />
          <Route path="/concerns" element={<ProtectedRoute><Concerns /></ProtectedRoute>} />
          <Route path="/requests" element={<ProtectedRoute><Requests /></ProtectedRoute>} />
          <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />

          {/* ─── Admin routes ─── */}
          <Route path="/admin" element={<AdminRoute><AdminOverview /></AdminRoute>} />
          <Route path="/admin/students" element={<AdminRoute><AdminStudents /></AdminRoute>} />
          <Route path="/admin/worklogs" element={<AdminRoute><AdminWorklogs /></AdminRoute>} />
          <Route path="/admin/reports" element={<AdminRoute><AdminReports /></AdminRoute>} />
          <Route path="/admin/blogs" element={<AdminRoute><AdminBlogPosts /></AdminRoute>} />
          <Route path="/admin/meetings" element={<AdminRoute><AdminMeetings /></AdminRoute>} />
          <Route path="/admin/concerns" element={<AdminRoute><AdminConcerns /></AdminRoute>} />
          <Route path="/admin/requests" element={<AdminRoute><AdminRequests /></AdminRoute>} />
          <Route path="/admin/alerts" element={<AdminRoute><AdminAlerts /></AdminRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}

export default App
