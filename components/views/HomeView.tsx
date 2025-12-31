
import React, { useState, useEffect, useMemo } from 'react';
import Card from '../Card';
import { Icons } from '../Icons';

// --- ICONS ---
const EditIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
);

const HeartPulseIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
);

const TrendIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
);

const BarChartIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>
);

// --- PHOTO WIDGET COMPONENT ---
interface PhotoWidgetProps {
    storageKey: string;
    defaultSrc: string;
    className?: string;
}

const PhotoWidget: React.FC<PhotoWidgetProps> = ({ storageKey, defaultSrc, className }) => {
    const [src, setSrc] = useState(defaultSrc);
    const [isEditing, setIsEditing] = useState(false);
    const [inputVal, setInputVal] = useState('');

    useEffect(() => {
        const saved = localStorage.getItem(storageKey);
        if (saved) setSrc(saved);
    }, [storageKey]);

    const handleSave = (e: React.MouseEvent | React.KeyboardEvent) => {
        e.stopPropagation(); // Prevent re-triggering edit on button click
        if (inputVal) {
            setSrc(inputVal);
            localStorage.setItem(storageKey, inputVal);
        }
        setIsEditing(false);
    };

    return (
        <div 
            onClick={() => setIsEditing(true)}
            className={`relative overflow-hidden rounded-[32px] group ${className} shadow-lg transition-all hover:shadow-xl cursor-pointer`}
        >
            <img src={src} alt="Widget" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            
            {/* Edit Hint Icon */}
            <div className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:text-slate-900 z-10 pointer-events-none">
                <EditIcon className="w-4 h-4" />
            </div>

            {/* Edit Modal Overlay */}
            {isEditing && (
                <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 animate-fade-in" onClick={(e) => e.stopPropagation()}>
                    <p className="text-white text-sm font-bold mb-3">Update Image URL</p>
                    <input 
                        type="text" 
                        placeholder="Paste image link..." 
                        value={inputVal}
                        onChange={(e) => setInputVal(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSave(e)}
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white text-sm mb-3 focus:outline-none focus:border-accentPink"
                        autoFocus
                    />
                    <div className="flex gap-2 w-full">
                        <button onClick={(e) => { e.stopPropagation(); setIsEditing(false); }} className="flex-1 py-2 rounded-lg text-white/60 text-xs font-bold hover:bg-white/10">Cancel</button>
                        <button onClick={handleSave} className="flex-1 py-2 rounded-lg bg-accentPink text-white text-xs font-bold hover:bg-pink-500">Save</button>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- DATA TYPES ---
interface Medication {
    id: string;
    name: string;
    timeOfDay: 'Morning' | 'Midday' | 'Night';
    lastTakenDate?: string;
    frequency: string;
    surgerySafe: boolean;
}

interface WeightLog {
    date: string;
    weight: number;
}

const HomeView: React.FC = () => {
  // --- STATE ---
  const [calories, setCalories] = useState(0);
  const [steps, setSteps] = useState(0);
  const [meds, setMeds] = useState<Medication[]>([]);
  const [weightHistory, setWeightHistory] = useState<WeightLog[]>([]);
  const [surgeryMode, setSurgeryMode] = useState(false);
  const [greeting, setGreeting] = useState("Good Morning");
  const [fullHistory, setFullHistory] = useState<any>({});
  
  const [calorieGoal, setCalorieGoal] = useState(1300);
  const STEP_GOAL = 10000;

  // New Graph State
  const [graphMetric, setGraphMetric] = useState<'CALORIES' | 'WEIGHT'>('CALORIES');

  // --- DATA LOADING ---
  useEffect(() => {
      const loadData = () => {
          // 1. Calories
          const savedHistory = localStorage.getItem('snatched_history');
          if (savedHistory) {
              const history = JSON.parse(savedHistory);
              setFullHistory(history);
              const todayKey = new Date().toISOString().split('T')[0];
              const todayLogs = history[todayKey] || [];
              const totalCals = todayLogs.reduce((acc: number, item: any) => acc + item.calories, 0);
              setCalories(totalCals);
          }

          // 2. Steps
          const savedSteps = localStorage.getItem('snatched_steps');
          if (savedSteps) setSteps(parseInt(savedSteps));

          // 3. Meds
          const savedMeds = localStorage.getItem('snatched_meds');
          if (savedMeds) setMeds(JSON.parse(savedMeds));

          // 4. Weight
          const savedWeights = localStorage.getItem('snatched_weight_history');
          if (savedWeights) setWeightHistory(JSON.parse(savedWeights));

          // 5. Surgery Mode
          const savedMode = localStorage.getItem('snatched_surgery_mode');
          if (savedMode) setSurgeryMode(JSON.parse(savedMode));
          
          // 6. Goals
          const savedGoals = localStorage.getItem('snatched_goals');
          if (savedGoals) {
              try {
                const g = JSON.parse(savedGoals);
                if(g.calories) setCalorieGoal(g.calories);
              } catch(e) {}
          }
      };

      loadData();
      
      // Update greeting based on time
      const hour = new Date().getHours();
      if (hour < 12) setGreeting("Good Morning");
      else if (hour < 18) setGreeting("Good Afternoon");
      else setGreeting("Good Evening");

      window.addEventListener('storage', loadData);
      return () => window.removeEventListener('storage', loadData);
  }, []);

  // --- CALCULATIONS ---
  
  // 1. Next Medication Logic
  const nextMed = useMemo(() => {
      const today = new Date().toISOString().split('T')[0];
      const activeMeds = meds.filter(m => surgeryMode ? m.surgerySafe : true);
      
      // Filter out meds taken today (assuming daily frequency for simplicity of "next up")
      const pending = activeMeds.filter(m => !m.lastTakenDate?.startsWith(today));
      
      if (pending.length === 0) return null; // All done
      
      // Simple ordering: Morning -> Midday -> Night
      const order = { 'Morning': 1, 'Midday': 2, 'Night': 3 };
      return pending.sort((a, b) => order[a.timeOfDay] - order[b.timeOfDay])[0];
  }, [meds, surgeryMode]);

  // 2. Snatched Score
  const snatchedScore = useMemo(() => {
      const calScore = Math.min((calories / calorieGoal), 1.0) * 40;
      const stepScore = Math.min((steps / STEP_GOAL), 1.0) * 40;
      const activeMeds = meds.filter(m => surgeryMode ? m.surgerySafe : true);
      if (activeMeds.length === 0) return calScore + stepScore + 20; 
      const today = new Date().toISOString().split('T')[0];
      const takenCount = activeMeds.filter(m => m.lastTakenDate?.startsWith(today)).length;
      const medScore = (takenCount / activeMeds.length) * 20;
      return Math.round(calScore + stepScore + medScore);
  }, [calories, steps, meds, surgeryMode, calorieGoal]);

  // 3. Weight Trend (Last 7 entries for small widget)
  const recentWeights = useMemo(() => {
      return weightHistory.slice(-7).map(w => w.weight);
  }, [weightHistory]);

  // 4. GRAPH WIDGET DATA CALCULATION
  const graphData = useMemo(() => {
      const days = [];
      // Generate last 7 days keys (reverse order so left is oldest)
      for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const key = d.toISOString().split('T')[0];
          const dayName = d.toLocaleDateString('en-US', { weekday: 'narrow' }); // M, T, W
          
          let value = 0;
          if (graphMetric === 'CALORIES') {
             const dayLogs = fullHistory[key] || [];
             value = dayLogs.reduce((acc: number, item: any) => acc + item.calories, 0);
          } else {
             const weightLog = weightHistory.find(w => w.date === key);
             value = weightLog ? weightLog.weight : 0;
          }
          days.push({ day: dayName, value, date: key });
      }
      return days;
  }, [fullHistory, weightHistory, graphMetric]);

  // 5. Donut Chart Calculations
  const calPercent = Math.min((calories / calorieGoal) * 100, 100);
  const donutRadius = 36;
  const donutCircumference = 2 * Math.PI * donutRadius;
  const donutOffset = donutCircumference - (calPercent / 100) * donutCircumference;

  return (
    <div className="space-y-8 animate-fade-in pb-16">
        
        {/* COMPACT GRID LAYOUT: Using CSS Grid Stretch for Alignment */}
        {/* gap-6 for tighter layout, removed items-start to allow stretch */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* === COL 1 (LEFT): TALL WIDGET (Fills Height Dynamically) === */}
            <div className="hidden lg:block lg:col-span-3">
                <PhotoWidget 
                    storageKey="snatched_photo_tall" 
                    defaultSrc="https://i.pinimg.com/736x/2a/3b/68/2a3b680785c40131494793d5a4980630.jpg"
                    // Use h-full to automatically match the right column's height
                    className="h-full w-full"
                />
            </div>

            {/* === COL 2 (RIGHT): MAIN CONTENT AREA === */}
            <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-min">
                
                {/* --- ROW 1: GREETING (No Box) & SCORE (Restored height 200->220) --- */}
                {/* Removed bg-white, border, shadow, group classes from Greeting container */}
                <div className="md:col-span-8 flex flex-col justify-center p-8 relative min-h-[220px]">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${surgeryMode ? 'bg-red-50 text-red-500' : 'bg-pink-50 text-accentPink'}`}>
                                {surgeryMode ? 'Surgery Prep' : 'Snatched Mode'}
                            </span>
                            <span className="text-slate-300 text-xs">•</span>
                            <span className="text-slate-400 text-xs font-bold uppercase">{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</span>
                        </div>
                        <h1 className="text-4xl font-serif font-bold text-slateText mb-2 leading-tight">
                            {greeting}, <br/><span className={`${surgeryMode ? 'text-red-400' : 'text-accentPink'} italic`}>Angel</span>.
                        </h1>
                        <p className="text-slate-500 font-medium text-sm">
                            {surgeryMode 
                                ? "Focus on rest, hydration, and gentle movements today." 
                                : "Your metrics are looking aligned. Let's keep the momentum."}
                        </p>
                    </div>
                    {/* Removed Sparkles Decoration */}
                </div>

                <div className="md:col-span-4 bg-slate-900 rounded-[32px] p-6 text-white relative overflow-hidden flex flex-col justify-between shadow-lg shadow-slate-200 min-h-[220px]">
                    <div className="flex justify-between items-start z-10">
                        <div>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Daily Score</p>
                            <p className="font-serif text-5xl font-bold mt-1">{snatchedScore}%</p>
                        </div>
                        <div className="p-2 bg-white/10 rounded-full backdrop-blur-sm">
                            <Icons.Activity className="w-5 h-5 text-accentPink" />
                        </div>
                    </div>
                    
                    <div className="absolute -bottom-12 -right-12 w-40 h-40 opacity-20">
                         <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="none" className="text-slate-700" />
                            <circle 
                                cx="50" cy="50" r="40" 
                                stroke="currentColor" strokeWidth="8" fill="none" 
                                strokeDasharray={251} 
                                strokeDashoffset={251 - (251 * snatchedScore / 100)} 
                                className="text-accentPink transition-all duration-1000" 
                            />
                         </svg>
                    </div>
                    
                    <div className="z-10 mt-auto">
                        <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                            <div style={{ width: `${snatchedScore}%` }} className="h-full bg-gradient-to-r from-pink-500 to-accentPink rounded-full transition-all duration-1000"></div>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2 text-right">Based on holistic adherence</p>
                    </div>
                </div>

                {/* --- ROW 2: TRIO OF WIDGETS (Restored height 180->200) --- */}
                
                {/* Nutrition */}
                <div className="md:col-span-4 bg-white rounded-[32px] p-5 border border-slate-100 shadow-subtle hover:shadow-float transition-all flex flex-col items-center justify-center relative overflow-hidden min-h-[200px]">
                     <div className="relative w-24 h-24 flex items-center justify-center">
                        <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r={donutRadius} stroke="#F1F5F9" strokeWidth="8" fill="none" />
                            <circle 
                                cx="50" cy="50" r={donutRadius} 
                                stroke="#FB7185" strokeWidth="8" fill="none" 
                                strokeDasharray={donutCircumference} 
                                strokeDashoffset={donutOffset} 
                                strokeLinecap="round"
                                className="transition-all duration-1000 ease-out drop-shadow-sm" 
                            />
                        </svg>
                        <div className="text-center">
                            <Icons.Utensils className="w-4 h-4 text-slate-300 mx-auto mb-0.5" />
                            <span className="text-lg font-bold text-slate-700 block leading-none">{calories}</span>
                            <span className="text-[9px] text-slate-400 font-bold uppercase">Kcal</span>
                        </div>
                     </div>
                     <p className="mt-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nutrition Pulse</p>
                </div>

                {/* Apothecary */}
                <div className={`md:col-span-4 rounded-[32px] p-5 border shadow-subtle hover:shadow-float transition-all relative overflow-hidden flex flex-col justify-between min-h-[200px] ${surgeryMode ? 'bg-red-50 border-red-100' : 'bg-sky-50 border-sky-100'}`}>
                    <div>
                        <div className="flex justify-between items-start mb-2">
                             <p className={`text-xs font-bold uppercase tracking-wider ${surgeryMode ? 'text-red-400' : 'text-sky-500'}`}>Up Next</p>
                             {nextMed ? <Icons.Pill className={`w-5 h-5 ${surgeryMode ? 'text-red-300' : 'text-sky-300'}`} /> : <Icons.Check className="w-5 h-5 text-emerald-400" />}
                        </div>
                        {nextMed ? (
                            <>
                                <h3 className="font-serif font-bold text-lg text-slate-800 leading-tight mb-1">{nextMed.name}</h3>
                                <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/60 ${surgeryMode ? 'text-red-500' : 'text-sky-600'}`}>
                                    {nextMed.timeOfDay} • {nextMed.frequency}
                                </span>
                            </>
                        ) : (
                            <div className="mt-2">
                                <h3 className="font-serif font-bold text-lg text-slate-800 leading-tight">All Clear</h3>
                                <p className="text-xs text-slate-500 mt-1">Rituals completed for now.</p>
                            </div>
                        )}
                    </div>
                    <div className="absolute -bottom-4 -right-4 opacity-10">
                        <HeartPulseIcon className={`w-24 h-24 ${surgeryMode ? 'text-red-500' : 'text-sky-500'}`} />
                    </div>
                </div>

                {/* Weight Trend */}
                <div className="md:col-span-4 bg-white rounded-[32px] p-5 border border-slate-100 shadow-subtle hover:shadow-float transition-all flex flex-col justify-between min-h-[200px]">
                     <div className="flex justify-between items-center">
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Body Trend</p>
                         <TrendIcon className="w-4 h-4 text-emerald-400" />
                     </div>
                     
                     <div className="h-10 flex items-end gap-1 mt-4">
                         {recentWeights.length > 0 ? recentWeights.map((w, i) => {
                             const min = Math.min(...recentWeights) * 0.99;
                             const max = Math.max(...recentWeights) * 1.01;
                             const height = ((w - min) / (max - min)) * 100;
                             return (
                                 <div key={i} className="flex-1 bg-slate-100 rounded-t-sm relative group">
                                     <div 
                                        style={{ height: `${height}%` }} 
                                        className="absolute bottom-0 w-full bg-emerald-400 rounded-t-sm transition-all duration-500 group-hover:bg-emerald-500"
                                     ></div>
                                 </div>
                             )
                         }) : (
                             <div className="w-full h-full flex items-center justify-center text-xs text-slate-300 italic">No data yet</div>
                         )}
                     </div>
                     
                     <div className="flex justify-between items-end mt-2">
                          <span className="text-xs text-slate-400">7 Days</span>
                          <span className="font-serif font-bold text-lg text-slate-700">
                              {recentWeights.length > 0 ? recentWeights[recentWeights.length - 1] : '--'} <span className="text-[10px] font-sans text-slate-400 font-normal">kg</span>
                          </span>
                     </div>
                </div>

                {/* --- ROW 3: TRANSPARENT GRAPH & WIDE WIDGET (Restored Height 40->48) --- */}
                
                {/* NEW GRAPH WIDGET (Outline Removed) */}
                <div className="md:col-span-6 h-48 flex flex-col justify-between overflow-hidden relative pl-2">
                     {/* Header & Toggle */}
                     <div className="flex items-start justify-between z-10">
                         <div>
                             <h3 className="font-serif font-bold text-xl text-slate-800 leading-none mb-1">Weekly Pulse</h3>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Last 7 Days</p>
                         </div>
                         <div className="flex bg-slate-50/50 rounded-lg p-0.5">
                             <button 
                                onClick={() => setGraphMetric('CALORIES')} 
                                className={`px-3 py-1 text-[9px] font-bold rounded-md transition-all ${graphMetric === 'CALORIES' ? 'bg-white text-accentPink shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                             >
                                 Cal
                             </button>
                             <button 
                                onClick={() => setGraphMetric('WEIGHT')} 
                                className={`px-3 py-1 text-[9px] font-bold rounded-md transition-all ${graphMetric === 'WEIGHT' ? 'bg-white text-accentBlue shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                             >
                                 Wgt
                             </button>
                         </div>
                     </div>

                     {/* The Graph - Floating Bars */}
                     <div className="flex items-end justify-between gap-2 h-28 mt-2 z-10">
                         {graphData.map((d, i) => {
                             // Calc height percent
                             const values = graphData.map(gd => gd.value);
                             const max = Math.max(...values, graphMetric === 'CALORIES' ? 2000 : 100); 
                             const min = graphMetric === 'WEIGHT' ? Math.min(...values.filter(v=>v>0)) * 0.9 : 0;
                             
                             let percent = 0;
                             if (d.value > 0) {
                                 percent = ((d.value - min) / (max - min)) * 100;
                                 if (percent < 10) percent = 10; // Min visual height
                             }

                             const isToday = i === 6; // Last item is today

                             return (
                                 <div key={i} className="flex flex-col items-center justify-end h-full flex-1 group relative">
                                     {/* Tooltip */}
                                     <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                                         {d.value} {graphMetric === 'CALORIES' ? 'kcal' : 'kg'}
                                     </div>
                                     
                                     {/* Bar */}
                                     <div 
                                        className={`w-full max-w-[12px] rounded-t-full transition-all duration-500 ease-out ${
                                            d.value === 0 
                                                ? 'bg-slate-200/50 h-[2px]' // Empty state
                                                : graphMetric === 'CALORIES' 
                                                    ? `bg-gradient-to-t from-pink-200 to-accentPink ${isToday ? 'opacity-100 shadow-sm' : 'opacity-70 group-hover:opacity-90'}`
                                                    : `bg-gradient-to-t from-sky-200 to-accentBlue ${isToday ? 'opacity-100 shadow-sm' : 'opacity-70 group-hover:opacity-90'}`
                                        }`}
                                        style={{ height: d.value === 0 ? '10px' : `${percent}%` }}
                                     ></div>
                                     
                                     {/* Label */}
                                     <span className={`text-[9px] font-bold mt-1.5 ${isToday ? 'text-slate-800' : 'text-slate-400'}`}>{d.day}</span>
                                 </div>
                             );
                         })}
                     </div>
                     
                     {/* Subtle Baseline */}
                     <div className="absolute bottom-5 left-0 w-full h-px bg-slate-100/50"></div>
                </div>

                {/* Wide Widget (Right Side) */}
                <div className="md:col-span-6 h-48">
                    <PhotoWidget 
                        storageKey="snatched_photo_wide" 
                        defaultSrc="https://i.pinimg.com/originals/e8/8b/6e/e88b6e6e224750035043534827038169.gif"
                        className="h-full w-full"
                    />
                </div>

            </div>

            {/* Mobile-Only Tall Widget Placeholder */}
            <div className="lg:hidden col-span-1 h-[400px]">
                <PhotoWidget 
                    storageKey="snatched_photo_tall" 
                    defaultSrc="https://i.pinimg.com/736x/2a/3b/68/2a3b680785c40131494793d5a4980630.jpg"
                    className="h-full w-full"
                />
            </div>

        </div>
    </div>
  );
};

export default HomeView;
