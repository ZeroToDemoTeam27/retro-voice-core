import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminRoute } from "@/components/AdminRoute";
import { AdminLayout } from "@/components/AdminLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/Dashboard";
import Assistants from "./pages/admin/Assistants";
import AssistantForm from "./pages/admin/AssistantForm";
import AssistantDetail from "./pages/admin/AssistantDetail";
import McpServers from "./pages/admin/McpServers";
import KnowledgeBase from "./pages/admin/KnowledgeBase";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminRoute><AdminLayout><AdminDashboard /></AdminLayout></AdminRoute>} />
            <Route path="/admin/assistants" element={<AdminRoute><AdminLayout><Assistants /></AdminLayout></AdminRoute>} />
            <Route path="/admin/assistants/new" element={<AdminRoute><AdminLayout><AssistantForm /></AdminLayout></AdminRoute>} />
            <Route path="/admin/assistants/:id" element={<AdminRoute><AdminLayout><AssistantDetail /></AdminLayout></AdminRoute>} />
            <Route path="/admin/assistants/:id/edit" element={<AdminRoute><AdminLayout><AssistantForm /></AdminLayout></AdminRoute>} />
            <Route path="/admin/mcp-servers" element={<AdminRoute><AdminLayout><McpServers /></AdminLayout></AdminRoute>} />
            <Route path="/admin/knowledge-base" element={<AdminRoute><AdminLayout><KnowledgeBase /></AdminLayout></AdminRoute>} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
