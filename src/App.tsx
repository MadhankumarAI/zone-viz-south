import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardHeader } from "./components/DashboardHeader";
import Footer from "./components/Footer";
import Index from "./pages/Index";
import Map from "./pages/Map";
import { Dashboard } from "./pages/Dashboard";
import { CameraFeed } from "./pages/CameraFeed";
import { Alerts } from "./pages/Alerts";
import { LogsHistory } from "./pages/LogsHistory";
import SystemStatus from "./pages/SystemStatus";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Layout component to wrap pages with Header and Footer
const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col">
    <DashboardHeader />
    <main className="flex-1">
      {children}
    </main>
    <Footer />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout><Index /></Layout>} />
          <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
          <Route path="/camera-feed" element={<Layout><CameraFeed /></Layout>} />
          <Route path="/map" element={<Layout><Map /></Layout>} />
          <Route path="/alerts" element={<Layout><Alerts /></Layout>} />
          <Route path="/logs-history" element={<Layout><LogsHistory /></Layout>} />
          <Route path="/system-status" element={<Layout><SystemStatus /></Layout>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<Layout><NotFound /></Layout>} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
