
import React from 'react';
import { Tab, NavItem } from '../types';
import { Icons } from './Icons';

interface SidebarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: Tab.HOME, label: 'Dashboard', Icon: Icons.Home },
    { id: Tab.MEALS, label: 'Nutrition', Icon: Icons.Utensils },
    { id: Tab.HISTORY, label: 'History', Icon: Icons.Calendar },
    { id: Tab.BODY, label: 'Wellness', Icon: Icons.Activity },
    { id: Tab.PHARMACY, label: 'Apothecary', Icon: Icons.Pill },
    { id: Tab.FINANCE, label: 'Finance', Icon: Icons.Wallet },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 h-full bg-white border-r border-slate-100 z-50">
      <div className="p-8 flex items-center gap-3">
        {/* Solid Pink Logo */}
        <div className="w-8 h-8 bg-accentPink rounded-lg flex items-center justify-center shadow-md shadow-pink-200">
            <Icons.Sparkles className="text-white w-5 h-5" />
        </div>
        <h1 className="text-xl font-serif font-bold text-slateText tracking-tight whitespace-nowrap">
          Pauline's Log
        </h1>
      </div>

      <div className="px-4 pb-4">
        <p className="px-4 text-xs font-bold text-mutedText uppercase tracking-wider mb-2">Menu</p>
        <nav className="space-y-1">
            {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
                <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                    isActive 
                    ? 'bg-softPink text-accentPink' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
                >
                <item.Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'stroke-2' : 'stroke-[1.5]'}`} />
                <span className={`text-sm font-medium ${isActive ? 'font-bold' : ''}`}>
                    {item.label}
                </span>
                {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accentPink"></div>
                )}
                </button>
            );
            })}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-slate-100">
         <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors">
             <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-accentPink">
                <Icons.User className="w-5 h-5" />
             </div>
             <div className="flex-1 overflow-hidden">
                 <p className="text-sm font-bold text-slateText truncate">Angel Energy</p>
                 <p className="text-xs text-mutedText truncate">Premium Plan</p>
             </div>
         </div>
      </div>
    </aside>
  );
};

export default Sidebar;
