
import React, { useState, useEffect, useRef } from 'react';
import { Icons } from './Icons';
import { GoogleGenAI } from "@google/genai";
import { Medication, SkincareItem } from '../types';

// FALLBACK MODELS LIST
const MODELS = ['gemini-3-pro-preview', 'gemini-3-flash-preview', 'gemini-2.5-flash'];

// --- AI MODAL COMPONENT ---
const AiResponseModal = ({ query, response, onClose, isLoading }: { query: string, response: string, onClose: () => void, isLoading: boolean }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-fade-in">
        <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg p-8 animate-modal-in relative overflow-hidden">
            <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors">
                <Icons.Plus className="w-6 h-6 rotate-45" />
            </button>
            
            <div className="flex flex-col h-full">
                <div className="mb-6">
                    <p className="text-xs font-bold text-accentPink uppercase tracking-wider mb-2">You Asked</p>
                    <h3 className="font-serif font-bold text-xl text-slate-800 leading-tight">"{query}"</h3>
                </div>
                
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex-1 min-h-[150px] relative">
                    {isLoading ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-3">
                            <Icons.Sparkles className="w-8 h-8 text-accentPink animate-spin" />
                            <p className="text-sm font-medium animate-pulse">Consulting the Oracle...</p>
                        </div>
                    ) : (
                        <div className="prose prose-sm prose-pink max-w-none text-slate-600 leading-relaxed overflow-y-auto max-h-[400px] custom-scrollbar">
                            <React.Fragment>
                                {response.split('\n').map((line, i) => (
                                    <p key={i} className="mb-2">{line}</p>
                                ))}
                            </React.Fragment>
                        </div>
                    )}
                </div>

                <div className="mt-6 flex justify-end">
                    <button onClick={onClose} className="px-6 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
                        Thank you, Oracle 🦢
                    </button>
                </div>
            </div>
        </div>
    </div>
);

// --- SETTINGS MODAL ---
const SettingsModal = ({ onClose }: { onClose: () => void }) => {
    const [key, setKey] = useState(localStorage.getItem('snatched_api_key') || '');
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        localStorage.setItem('snatched_api_key', key);
        setSaved(true);
        setTimeout(() => {
            setSaved(false);
            onClose();
            window.location.reload(); // Reload to ensure all components pick up the new key if they cached it
        }, 1000);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-fade-in">
            <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-md p-6 animate-modal-in">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-serif font-bold text-xl text-slate-800">Settings</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><Icons.Plus className="w-6 h-6 rotate-45" /></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Google Gemini API Key</label>
                        <input 
                            type="password" 
                            placeholder="AIzaSy..." 
                            value={key}
                            onChange={(e) => setKey(e.target.value.trim())}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accentPink font-mono"
                        />
                        <p className="text-[10px] text-slate-400 mt-2">Required for Oracle, Meal Analysis, and Workout Design. Stored locally on your device.</p>
                    </div>
                    <button 
                        onClick={handleSave} 
                        className={`w-full py-3 rounded-xl font-bold text-sm text-white transition-all ${saved ? 'bg-emerald-500' : 'bg-slate-900 hover:bg-slate-800'}`}
                    >
                        {saved ? 'Saved!' : 'Save Configuration'}
                    </button>
                </div>
            </div>
        </div>
    );
};

interface NotificationItem {
    id: string;
    type: 'missed' | 'future';
    message: string;
    subtext: string;
}

const Header: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // AI Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Notification States
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Settings State
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    // Clock Timer
    const timer = setInterval(() => {
        setCurrentTime(new Date());
    }, 1000); 

    // Outside Click Handler for Dropdown
    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setShowDropdown(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
        clearInterval(timer);
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // --- NOTIFICATION ENGINE ---
  useEffect(() => {
      const checkAlerts = () => {
          const today = new Date().toISOString().split('T')[0];
          const hour = new Date().getHours();
          
          const meds: Medication[] = JSON.parse(localStorage.getItem('snatched_meds') || '[]');
          const skincare: SkincareItem[] = JSON.parse(localStorage.getItem('snatched_skincare') || '[]');
          const history = JSON.parse(localStorage.getItem('snatched_history') || '{}');
          const todayLogs: any[] = history[today] || [];

          let newAlerts: NotificationItem[] = [];

          // Helper: Check if item is taken today
          const isTaken = (dateStr?: string) => dateStr?.startsWith(today);

          // 1. Morning Rituals (6 AM - 12 PM Check)
          if (hour >= 6) {
              const amMeds = meds.filter(m => m.timeOfDay === 'Morning');
              const amSkin = skincare.filter(s => s.timeOfDay === 'Morning');
              
              [...amMeds, ...amSkin].forEach(item => {
                 const takenDate = (item as Medication).lastTakenDate || (item as SkincareItem).lastUsedDate;
                 if (!isTaken(takenDate)) {
                     // If it's past noon, it's missed. Else it's up next.
                     if (hour >= 12) {
                         newAlerts.push({ id: item.id, type: 'missed', message: item.name, subtext: 'Morning Ritual Missed' });
                     } else {
                         // Only add to 'Up Next' if specifically asked, but here we focus on notifications.
                         // We can add "Due Now"
                         newAlerts.push({ id: item.id, type: 'future', message: item.name, subtext: 'Due this Morning' });
                     }
                 }
              });
          }

          // 2. Midday Rituals (12 PM - 5 PM Check)
          if (hour >= 12) {
              const noonMeds = meds.filter(m => m.timeOfDay === 'Midday');
              const noonSkin = skincare.filter(s => s.timeOfDay === 'Midday');

              [...noonMeds, ...noonSkin].forEach(item => {
                  const takenDate = (item as Medication).lastTakenDate || (item as SkincareItem).lastUsedDate;
                  if (!isTaken(takenDate)) {
                      if (hour >= 17) {
                          newAlerts.push({ id: item.id, type: 'missed', message: item.name, subtext: 'Midday Ritual Missed' });
                      } else {
                          newAlerts.push({ id: item.id, type: 'future', message: item.name, subtext: 'Due this Afternoon' });
                      }
                  }
              });

              // Check Lunch Log (After 2PM)
              if (hour >= 14 && hour < 17) {
                  const hasLunch = todayLogs.some(l => l.mealType === 'Lunch' || l.name.toLowerCase().includes('lunch'));
                  if (!hasLunch) {
                      newAlerts.push({ id: 'lunch-miss', type: 'future', message: 'Log Lunch', subtext: 'Fuel your body angel 🥗' });
                  }
              }
          }

          // 3. Night Rituals (5 PM+ Check)
          if (hour >= 17) {
              const pmMeds = meds.filter(m => m.timeOfDay === 'Night');
              const pmSkin = skincare.filter(s => s.timeOfDay === 'Night');

              [...pmMeds, ...pmSkin].forEach(item => {
                  const takenDate = (item as Medication).lastTakenDate || (item as SkincareItem).lastUsedDate;
                  if (!isTaken(takenDate)) {
                       // Night meds are rarely "missed" until next morning, so mostly "future"
                       newAlerts.push({ id: item.id, type: 'future', message: item.name, subtext: 'Night Routine Pending' });
                  }
              });

              // Check Dinner (After 8PM)
              if (hour >= 20) {
                  const hasDinner = todayLogs.some(l => l.mealType === 'Dinner' || l.name.toLowerCase().includes('dinner'));
                  if (!hasDinner) {
                      newAlerts.push({ id: 'dinner-miss', type: 'future', message: 'Log Dinner', subtext: 'Close your kitchen 🌙' });
                  }
              }
          }
          
          setNotifications(newAlerts);
      };

      // Run check on mount and whenever local storage might change (via window event in other components)
      checkAlerts();
      window.addEventListener('storage', checkAlerts);
      // Also poll every minute to update based on time passing
      const interval = setInterval(checkAlerts, 60000); 

      return () => {
          window.removeEventListener('storage', checkAlerts);
          clearInterval(interval);
      };
  }, []);

  const handleSearchSubmit = async (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && searchQuery.trim()) {
          setShowAiModal(true);
          setIsAiLoading(true);
          setAiResponse(""); // Clear previous
          
          try {
              // Retrieve Key from LocalStorage or Env
              const apiKey = localStorage.getItem('snatched_api_key') || process.env.API_KEY || "";
              
              if (!apiKey) {
                  setAiResponse("I need a key to the spirit realm. Please add your API Key in Settings.");
                  setIsAiLoading(false);
                  return;
              }

              const ai = new GoogleGenAI({ apiKey });
              
              const prompt = `
                You are a sophisticated, "Coquette" aesthetic fitness, health, and beauty expert. 
                Your tone is supportive, elegant, and knowledgeable (like a ballet instructor or a high-end wellness coach).
                
                User Question: "${searchQuery}"
                
                Provide a concise, helpful, and scientifically accurate answer (max 150 words). 
                Use an occasional emoji (🦢, 🎀, ✨) but keep it readable.
              `;
              
              let result = null;
              let lastError = null;

              // --- FALLBACK LOGIC ---
              for (const modelName of MODELS) {
                  try {
                      result = await ai.models.generateContent({
                          model: modelName,
                          contents: [{ role: 'user', parts: [{ text: prompt }] }]
                      });
                      if(result) break; // Success, exit loop
                  } catch (err) {
                      console.warn(`Model ${modelName} failed in Oracle:`, err);
                      lastError = err;
                      // Continue to next model
                  }
              }
              
              if (!result && lastError) throw lastError;

              setAiResponse(result?.text || "The stars are silent on this matter. Please try again.");
          } catch (error) {
              console.error("AI Error:", error);
              setAiResponse("My connection to the spirit realm was interrupted (Quota Limit). Please try again later.");
          } finally {
              setIsAiLoading(false);
          }
      }
  };

  const missedCount = notifications.filter(n => n.type === 'missed').length;
  const futureCount = notifications.filter(n => n.type === 'future').length;

  return (
    <>
        <header className="w-full pt-6 pb-2 px-6 md:px-8 lg:px-12 flex items-center justify-between z-20">
        {/* Mobile Title */}
        <div className="md:hidden flex items-center space-x-2">
            <h1 className="text-xl font-serif font-bold text-slateText">
            Diary
            </h1>
        </div>

        {/* Search & Actions */}
        <div className="hidden md:flex items-center flex-1 max-w-xl">
            <div className="relative w-full group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-accentPink transition-colors">
                    <Icons.Sparkles className="w-4 h-4" />
                </div>
                <input 
                    type="text" 
                    placeholder="Ask the Oracle about fitness, beauty, or health..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchSubmit}
                    className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-10 pr-4 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-pink-100 focus:bg-white transition-all outline-none shadow-sm"
                />
            </div>
        </div>

        <div className="flex items-center gap-4 ml-auto relative" ref={dropdownRef}>
            
            {/* ALERT BADGE - Only shows if notifications exist */}
            {notifications.length > 0 && !showDropdown && (
                <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 animate-fade-in hidden md:block">
                    <div className="bg-accentPink text-white px-3 py-1.5 rounded-lg shadow-lg shadow-pink-200 relative">
                        <span className="text-xs font-bold whitespace-nowrap">Check Notification!</span>
                        {/* Triangle pointing right */}
                        <div className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-3 h-3 bg-accentPink transform rotate-45 rounded-sm"></div>
                    </div>
                </div>
            )}

            <button 
                onClick={() => setShowSettings(true)}
                className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-500 hover:text-accentBlue hover:shadow-sm bg-white transition-all"
            >
                <Icons.Settings className="w-5 h-5" />
            </button>

            <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all relative ${showDropdown ? 'bg-accentPink text-white border-accentPink shadow-md' : 'bg-white border-slate-100 text-slate-500 hover:text-accentBlue hover:shadow-sm'}`}
            >
                <Icons.Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                    <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-400 rounded-full border-2 border-white animate-pulse"></span>
                )}
            </button>
            
            {/* NOTIFICATION DROPDOWN */}
            {showDropdown && (
                <div className="absolute top-full right-0 mt-3 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 ring-1 ring-slate-900/5 overflow-hidden animate-slide-up z-50 origin-top-right">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                        <h3 className="font-serif font-bold text-slate-800">Daily Briefing</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            {missedCount} Missed • {futureCount} Pending
                        </p>
                    </div>
                    
                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-slate-400">
                                <Icons.Check className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                <p className="text-xs italic">All caught up, angel.</p>
                            </div>
                        ) : (
                            <>
                                {/* Missed Section */}
                                {missedCount > 0 && (
                                    <div className="p-2">
                                        <p className="px-2 py-1 text-[10px] font-bold text-red-400 uppercase tracking-wider">Missed Rituals</p>
                                        {notifications.filter(n => n.type === 'missed').map(n => (
                                            <div key={n.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-red-50 transition-colors">
                                                <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0"></div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-700 leading-tight">{n.message}</p>
                                                    <p className="text-xs text-red-400/80 mt-0.5">{n.subtext}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Future Section */}
                                {futureCount > 0 && (
                                    <div className="p-2 border-t border-slate-50">
                                        <p className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Up Next</p>
                                        {notifications.filter(n => n.type === 'future').map(n => (
                                            <div key={n.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                                                <div className="w-1.5 h-1.5 rounded-full bg-accentPink mt-1.5 shrink-0"></div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-700 leading-tight">{n.message}</p>
                                                    <p className="text-xs text-slate-400 mt-0.5">{n.subtext}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

            <div className="text-right hidden lg:block">
                <p className="text-xs font-bold text-slateText uppercase tracking-wide">
                    {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </p>
                <p className="text-sm font-serif text-slate-400 font-medium">
                    {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </p>
            </div>
        </div>
        </header>

        {/* INJECTED STYLES FOR ANIMATION */}
        <style>{`
            @keyframes modalEnter {
            from { opacity: 0; transform: scale(0.95) translateY(10px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
            }
            .animate-modal-in { animation: modalEnter 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        `}</style>

        {showAiModal && (
            <AiResponseModal 
                query={searchQuery} 
                response={aiResponse} 
                isLoading={isAiLoading} 
                onClose={() => setShowAiModal(false)} 
            />
        )}
        
        {showSettings && (
            <SettingsModal onClose={() => setShowSettings(false)} />
        )}
    </>
  );
};

export default Header;
