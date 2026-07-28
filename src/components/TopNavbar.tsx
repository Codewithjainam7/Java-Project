import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Bell,
  FileEdit,
  PieChart,
  FileCheck2,
  LayoutDashboard,
  User,
  Settings,
  LogOut,
  Sparkles,
} from 'lucide-react';

interface TopNavbarProps {
  userDisplayName?: string;
  onLogout?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  userDisplayName = 'JANE DOE',
  onLogout,
}) => {
  const navigate = useNavigate();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/reminders', label: 'Reminders', icon: Bell },
    { path: '/letter-drafter', label: 'Letter Drafter', icon: FileEdit },
    { path: '/expenses', label: 'Expense Organizer', icon: PieChart },
    { path: '/notices', label: 'Notice Simplifier', icon: FileCheck2 },
  ];

  return (
    <>
      {/* Desktop & Tablet Top Navbar */}
      <header className="w-full bg-[#FFF9EC] border-b-4 border-black sticky top-0 z-40 shadow-[0_4px_0_#111111]">
        <div className="max-w-[1000px] mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Logo / Wordmark */}
          <NavLink
            to="/dashboard"
            className="flex items-center gap-2 group transition-transform hover:-translate-y-0.5"
          >
            <div className="bg-[#FFE066] border-3 border-black p-1.5 shadow-[3px_3px_0_#111111]">
              <Sparkles className="w-6 h-6 stroke-[2.5] text-black" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading text-lg md:text-xl font-black tracking-tight text-black leading-none">
                LIFE-ADMIN
              </span>
              <span className="font-heading text-xs font-bold bg-black text-[#FFE066] px-1 py-0.2 tracking-widest text-center mt-0.5">
                COPILOT
              </span>
            </div>
          </NavLink>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3 py-2 font-heading font-extrabold text-xs uppercase tracking-wide border-2 transition-all ${
                      isActive
                        ? 'bg-[#FFE066] border-black text-black shadow-[3px_3px_0_#111111]'
                        : 'bg-transparent border-transparent text-gray-800 hover:border-black hover:bg-white'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 stroke-[2.5]" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* User Profile Avatar & Settings */}
          <div className="flex items-center gap-2">
            <NavLink
              to="/settings"
              className="flex items-center gap-2 bg-white border-3 border-black px-2.5 py-1.5 shadow-[3px_3px_0_#111111] hover:bg-[#FFE066] transition-all"
            >
              {/* Square avatar with thick border */}
              <div className="w-7 h-7 bg-[#4ECDC4] border-2 border-black flex items-center justify-center font-heading font-black text-xs">
                {userDisplayName.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:inline font-heading font-bold text-xs uppercase text-black">
                {userDisplayName}
              </span>
              <Settings className="w-4 h-4 stroke-[2.5] text-black ml-0.5" />
            </NavLink>

            {onLogout && (
              <button
                onClick={onLogout}
                title="Sign out"
                className="p-2 bg-white border-3 border-black shadow-[3px_3px_0_#111111] hover:bg-[#FF6B6B] transition-all"
              >
                <LogOut className="w-4 h-4 stroke-[2.5] text-black" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Fixed Navigation Bar (<768px) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#FFF9EC] border-t-4 border-black z-50 p-1.5 flex items-center justify-around shadow-[0_-4px_0_#111111]">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1.5 px-2 border-2 transition-all ${
                  isActive
                    ? 'bg-[#FFE066] border-black text-black shadow-[2px_2px_0_#111111]'
                    : 'border-transparent text-gray-800'
                }`
              }
            >
              <Icon className="w-5 h-5 stroke-[2.5]" />
              <span className="text-[10px] font-heading font-extrabold uppercase mt-0.5 tracking-tighter">
                {item.label === 'Expense Organizer' ? 'Expenses' : item.label === 'Notice Simplifier' ? 'Notices' : item.label === 'Letter Drafter' ? 'Letters' : item.label}
              </span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
};
