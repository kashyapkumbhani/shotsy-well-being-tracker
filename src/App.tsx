
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/Layout";
import Summary from "@/pages/Summary";
import Shots from "@/pages/Shots";
import Results from "@/pages/Results";
import Calendar from "@/pages/Calendar";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/Login";
import { useEffect, useState } from "react";

const queryClient = new QueryClient();

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const loggedIn = localStorage.getItem("shotsy_logged_in") === "true";
    setIsLoggedIn(loggedIn);
  }, []);

  // Show nothing while checking login status
  if (isLoggedIn === null) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>
          <Routes>
            {!isLoggedIn ? (
              <>
                <Route path="/login" element={<Login />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </>
            ) : (
              <>
                <Route element={<Layout />}>
                  <Route path="/" element={<Summary />} />
                  <Route path="/shots" element={<Shots />} />
                  <Route path="/results" element={<Results />} />
                  <Route path="/calendar" element={<Calendar />} />
                  <Route path="/settings" element={<Settings />} />
                </Route>
                <Route path="/login" element={<Navigate to="/" replace />} />
                <Route path="*" element={<NotFound />} />
              </>
            )}
          </Routes>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
