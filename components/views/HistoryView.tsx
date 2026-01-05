
import React, { useState, useEffect, useMemo } from 'react';
import Card from '../Card';
import { Icons } from '../Icons';
import { GoogleGenAI } from "@google/genai";

// --- ICONS ---
const BowIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 12c2-3 5-3 6 0s-2 5-6 2c-4 3-7 1-6-2s4-3 6 0" />
        <path d="M12 12c0 4 1 6 3 8" />
        <path d="M12 12c0 4-1 6-3 8" />
    </svg>
);

const ChevronLeft = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m15 18-6-6 6-6"/></svg>
);

const ChevronRight = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18 6-6-6-6"/></svg>
);

const TrashIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
);

const ScaleIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>
);

const SparkleIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M9 3v4"/><path d="M3 5h4"/><path d="M3 9h4"/></svg>
);

// --- TYPES ---
interface Food {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs?: number;
  fats?: number;
  fiber?: number;
  mealType?: string;
}

interface WorkoutLogItem {
    id: string;
    name: string;
    reps: string;
    completedAt: number;
}

interface WeightLog {
    date: string; // ISO YYYY-MM-DD
    weight: number;
}

interface GraphPoint {
    date: string;
    weight: number;
    isPredicted: boolean;
}

type ViewMode = 'DAY' | 'WEEK' | 'MONTH';

// --- CONSTANTS ---
const STORAGE_KEYS = {
    HISTORY: 'snatched_history',
    WORKOUT_HISTORY: 'snatched_workout_history',
    WEIGHT_HISTORY: 'snatched_weight_history',
    GOALS: 'snatched_goals'
};

// --- HELPERS ---
const formatDateKey = (date: Date): string => {
    return date.toISOString().split('T')[0];
};

const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
};

const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); 
    return new Date(d.setDate(diff));
};

// --- CHART COMPONENT ---
const SimpleLineChart: React.FC<{ data: GraphPoint[] }> = ({ data }) => {
    if (data.length < 2) return <div className="h-64 flex items-center justify-center text-slate-400 italic">Not enough data points yet. Log more weights!</div>;

    const weights = data.map(d => d.weight);
    const minW = Math.min(...weights) - 1;
    const maxW = Math.max(...weights) + 1;
    const range = maxW - minW || 1;
    
    const width = 100; // SVG viewBox units
    const height = 50; // SVG viewBox units

    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((d.weight - minW) / range) * height;
        return { x, y, ...d };
    });

    // Create path string
    const pathD = points.map((p, i) => 
        (i === 0 ? 'M' : 'L') + `${p.x.toFixed(1)},${p.y.toFixed(1)}`
    ).join(' ');

    // Split into past and future for styling
    const pastPoints = points.filter(p => !p.isPredicted);
    const futurePoints = points.filter(p => p.isPredicted || (p === pastPoints[pastPoints.length-1])); // Connect last past to future

    const pastPath = pastPoints.map((p, i) => (i === 0 ? 'M' : 'L') + `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    
    // Future path starts from last known point
    const futurePath = points.length > pastPoints.length ? 
        points.slice(pastPoints.length - 1).map((p, i) => (i === 0 ? 'M' : 'L') + `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') 
        : '';

    return (
        <div className="w-full h-64 relative font-sans">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                {/* Y-Axis Guidelines */}
                <line x1="0" y1="0" x2={width} y2="0" stroke="#f1f5f9" strokeWidth="0.5" strokeDasharray="2" />
                <line x1="0" y1={height/2} x2={width} y2={height/2} stroke="#f1f5f9" strokeWidth="0.5" strokeDasharray="2" />
                <line x1="0" y1={height} x2={width} y2={height} stroke="#f1f5f9" strokeWidth="0.5" strokeDasharray="2" />

                {/* Past Line */}
                <path d={pastPath} fill="none" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                
                {/* Future Line */}
                {futurePath && (
                    <path d={futurePath} fill="none" stroke="#FB7185" strokeWidth="1.5" strokeDasharray="3 1" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_2px_rgba(251,113,133,0.5)]" />
                )}

                {/* Points */}
                {points.map((p, i) => (
                    <g key={i}>
                        <circle cx={p.x} cy={p.y} r={p.isPredicted ? 1.5 : 1} fill={p.isPredicted ? "#FB7185" : "#64748b"} className="transition-all hover:r-2" />
                        {/* Labels for first, last past, last future */}
                        {(i === 0 || i === pastPoints.length - 1 || i === points.length - 1) && (
                            <text x={p.x} y={p.y - 3} fontSize="3" textAnchor="middle" fill={p.isPredicted ? "#FB7185" : "#64748b"} fontWeight="bold">
                                {p.weight}
                            </text>
                        )}
                         {/* Date Label */}
                         <text x={p.x} y={height + 5} fontSize="2.5" textAnchor="middle" fill="#94a3b8">
                             {new Date(p.date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}
                         </text>
                    </g>
                ))}
            </svg>
        </div>
    );
};

const HistoryView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('DAY');
  
  // Data State
  const [history, setHistory] = useState<Record<string, Food[]>>({});
  const [workoutHistory, setWorkoutHistory] = useState<Record<string, WorkoutLogItem[]>>({});
  const [weightHistory, setWeightHistory] = useState<WeightLog[]>([]);
  const [calorieGoal, setCalorieGoal] = useState(1300);
  
  // Missed Day Estimate State
  const [isAddingEstimate, setIsAddingEstimate] = useState(false);
  const [estimateCals, setEstimateCals] = useState('');

  // Weight Logging State
  const [currentWeightInput, setCurrentWeightInput] = useState('');
  
  // AI Prediction State
  const [isPredictionOpen, setIsPredictionOpen] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionData, setPredictionData] = useState<GraphPoint[]>([]);
  const [predictionSummary, setPredictionSummary] = useState('');

  // --- LOAD DATA ---
  useEffect(() => {
    const loadData = () => {
        const savedHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
        const savedWorkouts = localStorage.getItem(STORAGE_KEYS.WORKOUT_HISTORY);
        const savedWeights = localStorage.getItem(STORAGE_KEYS.WEIGHT_HISTORY);
        const savedGoals = localStorage.getItem(STORAGE_KEYS.GOALS);
        
        if (savedHistory) setHistory(JSON.parse(savedHistory));
        if (savedWorkouts) setWorkoutHistory(JSON.parse(savedWorkouts));
        if (savedGoals) {
            try {
                const g = JSON.parse(savedGoals);
                if(g.calories) setCalorieGoal(g.calories);
            } catch(e) {}
        }
        if (savedWeights) {
            const parsedWeights = JSON.parse(savedWeights);
            setWeightHistory(parsedWeights);
            
            // Pre-fill input if there is a weight for today
            const todayKey = formatDateKey(new Date());
            const todayLog = parsedWeights.find((w: WeightLog) => w.date === todayKey);
            if (todayLog) setCurrentWeightInput(todayLog.weight.toString());
        }
    };
    loadData();

    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []); 

  // --- SAVE HELPERS ---
  const updateHistory = (newHistory: Record<string, Food[]>) => {
      setHistory(newHistory);
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(newHistory));
  };

  const currentKey = formatDateKey(currentDate);
  const dailyLogs = useMemo(() => history[currentKey] || [], [history, currentKey]);
  const dailyWorkouts = useMemo(() => workoutHistory[currentKey] || [], [workoutHistory, currentKey]);
  
  // Weight Log for selected date
  const dailyWeight = useMemo(() => weightHistory.find(w => w.date === currentKey), [weightHistory, currentKey]);
  const latestWeight = useMemo(() => {
      if (weightHistory.length === 0) return 0;
      return [...weightHistory].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].weight;
  }, [weightHistory]);

  const totalCalories = dailyLogs.reduce((acc, item) => acc + item.calories, 0);

  // --- ACTIONS ---

  const handlePrevDate = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const handleNextDate = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const handleDeleteLog = (index: number) => {
      if (!confirm("Remove this entry?")) return;
      const newLogs = [...dailyLogs];
      newLogs.splice(index, 1);
      updateHistory({
          ...history,
          [currentKey]: newLogs
      });
  };

  const handleAddEstimate = () => {
      if (!estimateCals) return;
      const cals = parseInt(estimateCals);
      if (isNaN(cals)) return;

      const estimateFood: Food = {
          id: `estimate-${Date.now()}`,
          name: 'Missed Day Estimate ✨',
          calories: cals,
          protein: 0,
          carbs: 0,
          fats: 0,
          fiber: 0
      };

      const newLogs = [...dailyLogs, estimateFood];
      updateHistory({
          ...history,
          [currentKey]: newLogs
      });
      setIsAddingEstimate(false);
      setEstimateCals('');
  };

  const handleSaveWeight = () => {
      const weightVal = parseFloat(currentWeightInput);
      if (isNaN(weightVal)) return;

      const todayKey = formatDateKey(new Date());
      let newWeights = [...weightHistory];
      const existingIndex = newWeights.findIndex(w => w.date === todayKey);

      if (existingIndex >= 0) {
          newWeights[existingIndex].weight = weightVal;
      } else {
          newWeights.push({ date: todayKey, weight: weightVal });
      }

      // Sort by date
      newWeights.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      setWeightHistory(newWeights);
      localStorage.setItem(STORAGE_KEYS.WEIGHT_HISTORY, JSON.stringify(newWeights));
      // Notify other tabs
      window.dispatchEvent(new Event('storage'));
      alert("Weight logged! 🦢");
  };

  // --- AI PREDICTION ---
  const handleGeneratePrediction = async () => {
      setIsPredictionOpen(true);
      setIsPredicting(true);
      setPredictionData([]);
      
      try {
          const apiKey = localStorage.getItem('snatched_api_key') || process.env.API_KEY || "";
          if (!apiKey) throw new Error("No API Key");

          const ai = new GoogleGenAI({ apiKey });
          
          // Prepare context: Last 30 days of weight
          const recentHistory = weightHistory.slice(-10); // Take last 10 entries for brevity
          
          const prompt = `
            Act as a fitness data analyst.
            Based on this weight history: ${JSON.stringify(recentHistory)}.
            
            1. Predict the weight for the next 4 weeks (one data point per week) assuming a healthy, consistent trend continues.
            2. If there is not enough data (less than 2 points), assume a standard 0.5kg loss per week from the last weight.
            3. Provide a short, motivating "Coquette" aesthetic summary (max 20 words).
            
            Return JSON ONLY:
            {
                "predictions": [ { "date": "YYYY-MM-DD", "weight": number } ],
                "summary": "string"
            }
          `;

          const response = await ai.models.generateContent({
              model: 'gemini-3-pro-preview',
              contents: [{ role: 'user', parts: [{ text: prompt }] }]
          });

          const cleanJson = response.text!.replace(/```json/g, '').replace(/```/g, '').trim();
          const result = JSON.parse(cleanJson);

          // Combine Past (Last 5 points) + Predicted
          const graphData: GraphPoint[] = [
              ...recentHistory.slice(-5).map(h => ({ ...h, isPredicted: false })),
              ...result.predictions.map((p: any) => ({ ...p, isPredicted: true }))
          ];

          setPredictionData(graphData);
          setPredictionSummary(result.summary);

      } catch (error) {
          console.error("Prediction failed", error);
          setPredictionSummary("Could not connect to the future. Check your API Key settings.");
      } finally {
          setIsPredicting(false);
      }
  };

  // --- RENDERERS ---
  const renderWeekView = () => { /* Kept Same for brevity */
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const startOfWeek = getStartOfWeek(currentDate);
      const weekData = Array.from({ length: 7 }).map((_, i) => {
          const d = new Date(startOfWeek);
          d.setDate(d.getDate() + i);
          const k = formatDateKey(d);
          const logs = history[k] || [];
          const cals = logs.reduce((acc, item) => acc + item.calories, 0);
          return { day: days[i], cals, date: d, isFuture: d > new Date() };
      });

      return (
          <Card className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center justify-between mb-8">
                  <h3 className="font-bold text-slateText">Weekly Trends</h3>
                  <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-accentPink"></span>
                      <span className="text-xs text-slate-500">Intake</span>
                      <span className="w-3 h-3 rounded-full bg-slate-200 ml-2"></span>
                      <span className="text-xs text-slate-500">Goal ({calorieGoal})</span>
                  </div>
              </div>
              <div className="h-64 flex items-end justify-between gap-2 sm:gap-4 px-2">
                  {weekData.map((data, i) => {
                      const heightPercent = Math.min((data.cals / (calorieGoal * 1.5)) * 100, 100);
                      const isOver = data.cals > calorieGoal;
                      const isTodayBar = isToday(data.date);
                      return (
                          <div key={i} className="flex flex-col items-center flex-1 h-full justify-end group cursor-pointer" onClick={() => { setCurrentDate(data.date); setViewMode('DAY'); }}>
                              <div className="relative w-full max-w-[40px] bg-slate-50 rounded-full h-full overflow-hidden flex items-end">
                                  <div className="absolute bottom-[66%] w-full h-[1px] border-t border-dashed border-slate-300 z-10 opacity-50"></div>
                                  <div 
                                    style={{ height: `${heightPercent}%` }}
                                    className={`w-full rounded-full transition-all duration-500 ease-out relative ${data.cals === 0 ? 'bg-transparent' : isOver ? 'bg-red-300' : 'bg-accentPink'} ${isTodayBar ? 'shadow-lg shadow-pink-200' : ''}`}
                                  >
                                      {data.cals > 0 && (<span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">{data.cals}</span>)}
                                  </div>
                              </div>
                              <span className={`mt-3 text-xs font-bold ${isTodayBar ? 'text-accentPink' : 'text-slate-400'}`}>{data.day}</span>
                          </div>
                      );
                  })}
              </div>
          </Card>
      );
  };

  const renderMonthView = () => { /* Kept Same for brevity */
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const firstDayOfMonth = new Date(year, month, 1).getDay();
      const gridCells = [];
      for (let i = 0; i < firstDayOfMonth; i++) gridCells.push(<div key={`empty-${i}`} className="aspect-square"></div>);

      for (let d = 1; d <= daysInMonth; d++) {
          const date = new Date(year, month, d);
          const k = formatDateKey(date);
          const logs = history[k] || [];
          const cals = logs.reduce((acc, item) => acc + item.calories, 0);
          const hasLogs = logs.length > 0;
          const hitGoal = cals > 0 && cals <= calorieGoal + 100 && cals >= calorieGoal - 300; 
          const isSelected = k === formatDateKey(currentDate);

          gridCells.push(
              <button 
                key={d} 
                onClick={() => { setCurrentDate(date); setViewMode('DAY'); }}
                className={`aspect-square rounded-xl border flex items-center justify-center relative transition-all group ${isSelected ? 'border-accentPink ring-2 ring-pink-100 bg-pink-50' : 'border-slate-100 bg-white hover:border-pink-200'}`}
              >
                  <span className={`text-xs font-bold ${isSelected ? 'text-accentPink' : 'text-slate-400'}`}>{d}</span>
                  {hasLogs && (<div className="absolute inset-0 flex items-center justify-center pointer-events-none">{hitGoal ? (<BowIcon className="w-5 h-5 text-accentPink/80" />) : (<div className={`w-1.5 h-1.5 rounded-full ${cals > calorieGoal ? 'bg-red-300' : 'bg-slate-300'}`}></div>)}</div>)}
              </button>
          );
      }
      return (
          <Card className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <h3 className="font-bold text-slateText mb-6">{currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
              <div className="grid grid-cols-7 gap-2">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (<div key={d} className="text-center text-[10px] font-bold text-slate-300 uppercase mb-2">{d}</div>))}
                  {gridCells}
              </div>
          </Card>
      );
  };

  return (
    <div className="space-y-4 animate-fade-in relative pb-10">
        {/* INJECTED ANIMATION STYLES */}
        <style>{`
         @keyframes modalEnter {
           from { opacity: 0; transform: scale(0.95) translateY(10px); }
           to { opacity: 1; transform: scale(1) translateY(0); }
         }
         @keyframes slideUp {
           from { opacity: 0; transform: translateY(10px); }
           to { opacity: 1; transform: translateY(0); }
         }
         .animate-modal-in { animation: modalEnter 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
         .animate-slide-up { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
       `}</style>

        {/* --- AI PREDICTION MODAL --- */}
        {isPredictionOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/30 backdrop-blur-md p-4 animate-fade-in">
                <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl border border-white/60 p-6 relative overflow-hidden">
                    <button onClick={() => setIsPredictionOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold z-10">&times;</button>
                    
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-pink-50 text-accentPink mb-3 shadow-inner">
                            <SparkleIcon className="w-6 h-6 animate-pulse" />
                        </div>
                        <h3 className="font-serif font-bold text-2xl text-slate-800">Your Trajectory</h3>
                        <p className="text-slate-400 text-sm">Where the current flows...</p>
                    </div>

                    {isPredicting ? (
                        <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-4">
                            <Icons.Sparkles className="w-10 h-10 text-accentPink animate-spin" />
                            <p className="animate-pulse font-medium text-sm">Consulting the future...</p>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-slide-up">
                            <SimpleLineChart data={predictionData} />
                            
                            <div className="bg-gradient-to-r from-pink-50 to-white border border-pink-100 rounded-xl p-4 flex items-start gap-3">
                                <BowIcon className="w-5 h-5 text-accentPink shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs font-bold text-accentPink uppercase tracking-wider mb-1">Oracle's Note</p>
                                    <p className="text-slate-700 italic text-sm leading-relaxed">"{predictionSummary}"</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* --- HEADER --- */}
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 animate-slide-up">
          <div className="flex items-end justify-between">
              <div>
                <h2 className="text-3xl font-serif text-slateText mb-1">History</h2>
                <p className="text-slate-500 text-sm">Your journey through time.</p>
              </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-2xl border border-slate-100 p-1.5 shadow-subtle">
              {/* Date Controls */}
              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start px-2">
                   <button onClick={handlePrevDate} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-700 transition-colors"><ChevronLeft className="w-5 h-5" /></button>
                   <div className="text-center min-w-[140px]">
                       <p className="font-serif font-bold text-lg text-slate-800 leading-none">
                           {isToday(currentDate) ? 'Today' : currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                       </p>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                           {currentDate.toLocaleDateString('en-US', { year: 'numeric' })}
                       </p>
                   </div>
                   <button onClick={handleNextDate} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-700 transition-colors"><ChevronRight className="w-5 h-5" /></button>
              </div>

              {/* View Toggle */}
              <div className="flex bg-slate-50 rounded-xl p-1 w-full sm:w-auto">
                  {(['DAY', 'WEEK', 'MONTH'] as const).map(mode => (
                      <button key={mode} onClick={() => setViewMode(mode)} className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === mode ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>{mode.charAt(0) + mode.slice(1).toLowerCase()}</button>
                  ))}
              </div>
          </div>
       </div>

        {/* --- VIEWS --- */}
        {viewMode === 'WEEK' && renderWeekView()}
        {viewMode === 'MONTH' && renderMonthView()}
        
        {viewMode === 'DAY' && (
            <div className="flex flex-col gap-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                
                {/* === ROW 1: LOGS & SUMMARY (Fixed Equal Height) === */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[240px]">
                    
                    {/* 1. NUTRITION LOGS (Scrollable) */}
                    <div className="md:col-span-2 h-full">
                        <Card title="Daily Logs" className="h-full flex flex-col !p-5 overflow-hidden">
                            {dailyLogs.length === 0 ? (
                                <div className="flex flex-col items-center justify-center flex-1 text-center h-full">
                                    <p className="text-slate-400 italic text-xs mb-3">No records found for this day.</p>
                                    {!isToday(currentDate) && (
                                        <div className="w-full max-w-xs">
                                            {!isAddingEstimate ? (
                                                <button onClick={() => setIsAddingEstimate(true)} className="px-3 py-1.5 bg-pink-50 text-accentPink text-[10px] font-bold rounded-lg hover:bg-pink-100 transition-colors">✨ Add Estimate</button>
                                            ) : (
                                                <div className="flex items-center gap-2 animate-fade-in bg-slate-50 p-1.5 rounded-xl">
                                                    <input type="number" placeholder="Kcal?" value={estimateCals} onChange={(e) => setEstimateCals(e.target.value)} className="flex-1 px-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-accentPink" />
                                                    <button onClick={handleAddEstimate} className="px-2 py-1.5 bg-accentPink text-white text-[10px] font-bold rounded-lg">Add</button>
                                                    <button onClick={() => setIsAddingEstimate(false)} className="text-slate-400 p-1"><Icons.Plus className="w-3 h-3 rotate-45" /></button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-2 overflow-y-auto custom-scrollbar flex-1 pr-1">
                                    {dailyLogs.map((log, index) => (
                                        <div key={index} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-white border border-transparent hover:border-slate-100 transition-all group">
                                            <div>
                                                <p className="font-bold text-slate-700 text-xs flex items-center gap-2">{log.name}{log.mealType && <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-400 font-bold uppercase">{log.mealType}</span>}</p>
                                                <p className="text-[10px] text-slate-400">{log.calories} kcal</p>
                                            </div>
                                            <button onClick={() => handleDeleteLog(index)} className="p-1.5 text-slate-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"><TrashIcon className="w-3.5 h-3.5" /></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* 2. SUMMARY (Fixed to match Logs) */}
                    <div className="h-full">
                        <Card title="Summary" className="h-full bg-sky-50 border-sky-100 !p-6 flex flex-col justify-between relative overflow-hidden group">
                            {/* Decorative BG */}
                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                 <Icons.Activity className="w-24 h-24 text-sky-600" />
                            </div>

                            <div className="relative z-10 flex flex-col h-full justify-center gap-6">
                                {/* Calorie Section */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-bold text-sky-500 uppercase tracking-widest mb-1">Energy Intake</p>
                                        <div className="flex items-baseline gap-1.5">
                                            <span className="font-serif font-bold text-4xl text-slate-800 leading-none tracking-tight">{totalCalories}</span>
                                            <span className="text-xs font-bold text-sky-400">/ {calorieGoal}</span>
                                        </div>
                                        {/* Progress Bar */}
                                        <div className="w-32 bg-white/60 h-1.5 rounded-full mt-3 overflow-hidden">
                                            <div 
                                                style={{ width: `${Math.min((totalCalories / calorieGoal) * 100, 100)}%` }} 
                                                className={`h-full rounded-full transition-all duration-1000 ${totalCalories > calorieGoal ? 'bg-red-400' : 'bg-sky-400'}`}
                                            ></div>
                                        </div>
                                    </div>
                                    <div className="w-12 h-12 rounded-full bg-white text-sky-400 flex items-center justify-center shadow-sm border border-sky-50">
                                        <Icons.Utensils className="w-5 h-5" />
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="border-t border-sky-200/50 border-dashed"></div>

                                {/* Workout Section */}
                                <div className="flex items-center justify-between">
                                     <div>
                                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Workouts</p>
                                         <p className="font-serif font-bold text-2xl text-slate-700 leading-none">{dailyWorkouts.length} <span className="text-xs font-sans font-medium text-slate-400">Sessions</span></p>
                                    </div>
                                     <div className="w-10 h-10 rounded-full bg-white/60 text-slate-300 flex items-center justify-center">
                                        <Icons.Activity className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* === ROW 2: MOVEMENT & METRICS (Fixed Equal Height) === */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[320px]">
                    
                    {/* 3. MOVEMENT LOG + WEIGHT VISUAL */}
                    <div className="md:col-span-2 h-full flex flex-col gap-4">
                         <Card title="Movement Log" className="flex-1 !p-5 overflow-hidden flex flex-col">
                            {dailyWorkouts.length === 0 ? (
                                <p className="text-center text-xs text-slate-400 italic py-6 my-auto">No workouts recorded for this day.</p>
                            ) : (
                                <div className="grid grid-cols-1 gap-2 overflow-y-auto custom-scrollbar flex-1 pr-1">
                                    {dailyWorkouts.map((w) => (
                                        <div key={w.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-pink-50/50 border border-pink-100">
                                            <div className="w-7 h-7 rounded-full bg-accentPink flex items-center justify-center text-white shadow-sm"><BowIcon className="w-3.5 h-3.5" /></div>
                                            <div className="flex-1"><p className="text-xs font-bold text-slate-700">{w.name}</p><p className="text-[10px] text-slate-400">{w.reps}</p></div>
                                            <div className="w-5 h-5 rounded-full bg-white border border-pink-200 flex items-center justify-center"><Icons.Check className="w-3 h-3 text-accentPink" /></div>
                                        </div>
                                    ))}
                                </div>
                            )}
                         </Card>
                         
                         {/* WEIGHT VISUAL (Conditional) */}
                         {dailyWeight && (
                            <div className="bg-gradient-to-r from-slate-50 to-white rounded-2xl p-3 border border-slate-100 flex items-center justify-between shadow-sm animate-fade-in shrink-0 h-16">
                                 <div className="flex items-center gap-3">
                                     <div className="p-2 bg-white rounded-full shadow-sm text-slate-400"><ScaleIcon className="w-4 h-4" /></div>
                                     <div>
                                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recorded Weight</p>
                                         <p className="font-serif font-bold text-lg text-slate-700 leading-none">{dailyWeight.weight} <span className="text-xs font-sans font-normal text-slate-400">kg</span></p>
                                     </div>
                                 </div>
                                 <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-lg">
                                     {new Date(currentDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                 </span>
                            </div>
                         )}
                    </div>

                    {/* 4. BODY METRICS INPUT */}
                    <div className="h-full">
                        <Card className="h-full flex flex-col !p-5 border-slate-200 relative overflow-hidden">
                             <div className="absolute top-0 right-0 p-4 opacity-5"><ScaleIcon className="w-20 h-20 rotate-12" /></div>
                             <div className="relative z-10 flex flex-col h-full">
                                 <div className="mb-4">
                                     <h3 className="font-sans font-bold text-base text-slateText tracking-tight mb-0.5">Body Metrics</h3>
                                     <p className="text-[10px] text-slate-400">Track your transformation.</p>
                                 </div>
                                 
                                 <div className="flex-1 flex flex-col justify-center space-y-4">
                                     <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Current Weight</label>
                                        <div className="flex gap-2">
                                            <input 
                                                type="number" 
                                                value={currentWeightInput}
                                                onChange={(e) => setCurrentWeightInput(e.target.value)}
                                                placeholder="00.0" 
                                                className="w-full bg-slate-50 border-none rounded-xl px-3 py-2.5 text-base font-bold text-slate-700 focus:ring-2 focus:ring-accentPink/20 outline-none" 
                                            />
                                            <button onClick={handleSaveWeight} className="bg-slate-900 text-white px-3 rounded-xl font-bold text-xs shadow-md hover:bg-slate-800 transition-all">Save</button>
                                        </div>
                                        <p className="text-[9px] text-slate-400 mt-1.5 text-center">Latest recorded: {latestWeight > 0 ? `${latestWeight}kg` : '--'}</p>
                                     </div>
                                     
                                     <div className="pt-3 border-t border-slate-50">
                                         <button 
                                            onClick={handleGeneratePrediction}
                                            className="w-full py-3 bg-gradient-to-r from-pink-400 to-accentPink text-white rounded-xl font-bold shadow-lg shadow-pink-200 hover:shadow-xl hover:-translate-y-0.5 transition-all group flex items-center justify-center gap-2 text-xs"
                                         >
                                             <Icons.Sparkles className="w-4 h-4 group-hover:animate-spin" />
                                             Predict Future Me
                                         </button>
                                     </div>
                                 </div>
                             </div>
                        </Card>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default HistoryView;
