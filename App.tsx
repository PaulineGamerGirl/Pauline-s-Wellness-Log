import React, { useState } from 'react';
import { Tab } from './types';
import Header from './components/Header';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import HomeView from './components/views/HomeView';
import MealsView from './components/views/MealsView';
import BodyView from './components/views/BodyView';
import PharmacyView from './components/views/PharmacyView';
import FinanceView from './components/views/FinanceView';
import HistoryView from './components/views/HistoryView';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.HOME);

  const renderContent = () => {
    switch (activeTab) {
      case Tab.HOME:
        return <HomeView />;
      case Tab.MEALS:
        return <MealsView />;
      case Tab.HISTORY:
        return <HistoryView />;
      case Tab.BODY:
        return <BodyView />;
      case Tab.PHARMACY:
        return <PharmacyView />;
      case Tab.FINANCE:
        return <FinanceView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-white relative overflow-hidden text-slateText">
      
      {/* Desktop/iPad Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full relative z-10 overflow-hidden bg-white">
        <Header />
        
        <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth p-6 md:p-8 lg:px-12 lg:py-8 pb-32 md:pb-8">
          <div className="max-w-[1600px] mx-auto w-full transition-all duration-500 ease-in-out">
            {renderContent()}
          </div>
        </div>

        {/* Mobile/Tablet Portrait Bottom Nav */}
        <div className="md:hidden">
            <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      </main>
    </div>
  );
};

export default App;