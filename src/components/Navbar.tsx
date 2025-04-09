
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ClipboardList, Syringe, LineChart, Calendar, Settings } from "lucide-react";

const Navbar: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string): boolean => {
    return location.pathname === path;
  };
  
  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-shotsy-100 shadow-lg">
      <div className="max-w-md mx-auto h-full">
        <nav className="flex justify-around items-center h-full">
          <NavItem 
            to="/" 
            icon={<ClipboardList size={20} />} 
            label="Summary" 
            isActive={isActive("/")}
          />
          <NavItem 
            to="/shots" 
            icon={<Syringe size={20} />} 
            label="Shots" 
            isActive={isActive("/shots")}
          />
          <NavItem 
            to="/results" 
            icon={<LineChart size={20} />} 
            label="Results" 
            isActive={isActive("/results")}
          />
          <NavItem 
            to="/calendar" 
            icon={<Calendar size={20} />} 
            label="Calendar" 
            isActive={isActive("/calendar")}
          />
          <NavItem 
            to="/settings" 
            icon={<Settings size={20} />} 
            label="Settings" 
            isActive={isActive("/settings")}
          />
        </nav>
      </div>
    </div>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, isActive }) => {
  return (
    <Link 
      to={to}
      className={`flex flex-col items-center justify-center w-1/5 p-1 transition-colors ${
        isActive 
          ? "text-shotsy-600 font-medium" 
          : "text-gray-500 hover:text-shotsy-500"
      }`}
    >
      <div className={`p-1 rounded-full ${isActive ? "bg-shotsy-50" : ""}`}>
        {icon}
      </div>
      <span className="text-xs mt-1">{label}</span>
    </Link>
  );
};

export default Navbar;
