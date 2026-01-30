import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import FloatingChatbot from "@/components/FloatingChatbot";

// Pages
import Analytics from "./pages/Analytics";
import Tickets from "./pages/Tickets";
import Reviews from "./pages/Reviews";
import Users from "./pages/Users";
import Bookings from "./pages/Bookings";
import Interactions from "./pages/Interactions";
import QnA from "./pages/QnA";
import Menu from "./pages/Menu";
import Campaigns from "./pages/Campaigns";
import Policies from "./pages/Policies";
import Agents from "./pages/Agents";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import RateManagement from "./pages/RateManagement";
import ChannelManagement from "./pages/ChannelManagement";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={true}
        disableTransitionOnChange={false}
      >
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Analytics />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/tickets" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Tickets />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/reviews" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Reviews />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/users" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Users />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/bookings" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Bookings />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/interactions" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Interactions />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/qna" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <QnA />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/menu" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Menu />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/campaigns" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Campaigns />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/policies" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Policies />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/agents" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Agents />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/rate-management" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <RateManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/channel-management" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <ChannelManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Settings />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <FloatingChatbot />
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
