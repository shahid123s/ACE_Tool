import './index.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Pages
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

// Placeholders for now - we will uncomment as we restore/create them
// import Attendance from "./pages/Attendance"; 
// import Worklogs from "./pages/Worklogs";
// import Reports from "./pages/Reports";
// import BlogPosts from "./pages/BlogPosts";
// import LeetCode from "./pages/LeetCode";
// import Meetings from "./pages/Meetings";
// import Concerns from "./pages/Concerns";
// import Requests from "./pages/Requests";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App
