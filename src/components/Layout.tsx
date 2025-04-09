
import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { ShotsyProvider } from "@/contexts/ShotsyContext";

const Layout: React.FC = () => {
  return (
    <ShotsyProvider>
      <div className="min-h-screen bg-shotsy-gradient">
        <div className="max-w-md mx-auto pb-20 min-h-screen bg-white/80 shadow-md">
          <main className="animate-fade-in">
            <Outlet />
          </main>
          <Navbar />
        </div>
      </div>
    </ShotsyProvider>
  );
};

export default Layout;
