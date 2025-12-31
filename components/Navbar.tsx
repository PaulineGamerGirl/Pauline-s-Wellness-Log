import React from 'react';
import { Tab, NavItem } from '../types';
import { Icons } from './Icons';

interface NavbarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
    const navItems = [
        { id: Tab.HOME, label: 'Home', Icon: Icons.Home },
        { id: Tab.MEALS, label: 'Meals', Icon: Icons.Utensils },
        { id: Tab.HISTORY, label: 'History', Icon: Icons.Calendar },
        { id: Tab.BODY, label: 'Body', Icon: Icons.Activity },
        { id: Tab.PHARMACY, label: 'Meds', Icon: Icons.Pill },
        { id: Tab.FINANCE, label: 'Finance', Icon: Icons.Wallet },
    ];

  return (
    <nav className="absolute bottom-6 left-6 right-6 h-16 bg-white/90 backdrop-blur-xl rounded-2xl shadow-glass z-50 flex items-center justify-between px-2 border border-white/20 ring-1 ring-slate-900/5">
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className="relative flex-1 flex flex-col items-center justify-center h-full group"
          >
            <div className={`transition-all duration-300 ${isActive ? 'text-accentPink -translate-y-1' : 'text-slate-400'}`}>
                <item.Icon className="w-6 h-6" />
            </div>
            {isActive && (
                 <div className="absolute bottom-2 w-1 h-1 bg-accentPink rounded-full shadow-[0_0_8px_#FB7185]"></div>
            )}
          </button>
        );
      })}
    </nav>
  );
};

export default Navbar;