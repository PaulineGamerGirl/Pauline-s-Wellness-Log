
import React, { useState, useEffect, useRef } from 'react';
import Card from '../Card';
import { Icons } from '../Icons';
import { GoogleGenAI } from "@google/genai";

// --- LOCAL ICONS ---
const TrashIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
);

const FootprintsIcon = ({ className }: { className?: string }) => (
   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 11 3.8 11 8c0 2.85-1.17 4.5-1 8 .17 3.5 2.02 5.5 3.5 5.5.48 0 .82-.2.95-.53" />
      <path d="M20 8v2.38c0 2.12 1.03 3.12 1 5.62-.03 2.72-1.49 6-4.5 6C14.63 22 13 20.2 13 16c0-2.85 1.17-4.5 1-8-.17-3.5-2.02-5.5-3.5-5.5-.48 0-.82.2-.95.53" />
   </svg>
);

const BowIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 12c2-3 5-3 6 0s-2 5-6 2c-4 3-7 1-6-2s4-3 6 0" />
        <path d="M12 12c0 4 1 6 3 8" />
        <path d="M12 12c0 4-1 6-3 8" />
    </svg>
);

const SendIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
);

const SparkleIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M9 3v4"/><path d="M3 5h4"/><path d="M3 9h4"/></svg>
);

// --- TYPES ---
interface WorkoutTask {
  id: string;
  name: string;
  reps: string;
  completed: boolean;
}

interface WorkoutMeta {
    title: string;
    totalCalories: number;
    schedule: string[]; // e.g. ["Mon", "Tue", "Fri"]
}

interface ChatMessage {
    role: 'user' | 'ai';
    text: string;
}

interface WorkoutLogItem {
    id: string;
    name: string;
    reps: string;
    completedAt: number;
}

// --- CONSTANTS ---
const STEP_GOAL = 10000;
const STEP_RADIUS = 70; 
const STEP_CIRCUMFERENCE = 2 * Math.PI * STEP_RADIUS;
const CENTER_XY = 96; 

const DEFAULT_WORKOUTS: WorkoutTask[] = [
    { id: '1', name: 'Glute Bridges', reps: '3x15', completed: false },
    { id: '2', name: 'Clamshells', reps: '3x20', completed: false },
    { id: '3', name: 'Donkey Kicks', reps: '3x15', completed: false },
    { id: '4', name: 'Vacuum Hold', reps: '30 secs', completed: false },
];

const DEFAULT_META: WorkoutMeta = {
    title: "Glute Glow Routine",
    totalCalories: 150,
    schedule: ["Mon", "Wed", "Fri"] // Default schedule
};

const WEEK_DAYS = [
    { code: 'Mon', label: 'M' },
    { code: 'Tue', label: 'T' },
    { code: 'Wed', label: 'W' },
    { code: 'Thu', label: 'T' },
    { code: 'Fri', label: 'F' },
    { code: 'Sat', label: 'S' },
    { code: 'Sun', label: 'S' },
];

// FALLBACK MODELS LIST
const MODELS = ['gemini-3-pro-preview', 'gemini-3-flash-preview', 'gemini-2.5-flash'];

const BodyView: React.FC = () => {
  // --- STATE ---
  const [steps, setSteps] = useState<number>(0);
  
  // Workout Data (Persistent)
  const [workouts, setWorkouts] = useState<WorkoutTask[]>(DEFAULT_WORKOUTS);
  const [workoutMeta, setWorkoutMeta] = useState<WorkoutMeta>(DEFAULT_META);
  
  const [motivationQuote, setMotivationQuote] = useState<string>("A little movement fixes the mood. Just 5 minutes?");
  
  // Simple Add Form State
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newReps, setNewReps] = useState('');

  // AI Designer State
  const [isDesignerOpen, setIsDesignerOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Preview State (Inside Modal)
  const [previewWorkouts, setPreviewWorkouts] = useState<WorkoutTask[]>([]);
  const [previewMeta, setPreviewMeta] = useState<WorkoutMeta | null>(null);

  // --- EFFECT: LOAD DATA ---
  useEffect(() => {
      const savedSteps = localStorage.getItem('snatched_steps');
      const savedWorkouts = localStorage.getItem('snatched_workouts');
      const savedMeta = localStorage.getItem('snatched_workout_meta');
      
      if (savedSteps) setSteps(parseInt(savedSteps));
      if (savedWorkouts) {
          try {
              const parsed = JSON.parse(savedWorkouts);
              if (Array.isArray(parsed) && parsed.length > 0) {
                  setWorkouts(parsed);
              }
          } catch (e) { console.error("Error loading workouts", e); }
      }
      if (savedMeta) {
          try {
              const parsed = JSON.parse(savedMeta);
              // Ensure legacy data has schedule
              if (!parsed.schedule) parsed.schedule = ["Mon", "Wed", "Fri"];
              setWorkoutMeta(parsed);
          } catch(e) { console.error("Error loading meta", e); }
      }
  }, []);

  // --- EFFECT: SAVE DATA & MOTIVATION ENGINE ---
  useEffect(() => {
      // 1. Save Data
      localStorage.setItem('snatched_steps', steps.toString());
      localStorage.setItem('snatched_workouts', JSON.stringify(workouts));
      localStorage.setItem('snatched_workout_meta', JSON.stringify(workoutMeta));

      // 2. Motivation Engine
      const allWorkoutsDone = workouts.length > 0 && workouts.every(w => w.completed);
      const isOverachiever = steps > STEP_GOAL;
      
      if (isOverachiever) {
          setMotivationQuote("Overachiever energy! You are literally glowing. ✨🔥");
      } else if (allWorkoutsDone) {
          setMotivationQuote("Snatched waist, heavy glutes. You are sculpting art. 🦢");
      } else if (steps > 5000) {
          setMotivationQuote("Walking queen! You just burned off that Matcha. 🍵");
      } else {
          setMotivationQuote("A little movement fixes the mood. Just 5 minutes?");
      }
  }, [steps, workouts, workoutMeta]);

  // --- HANDLERS: BASIC ---
  const handleStepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSteps(parseInt(e.target.value));
  };

  const toggleWorkout = (id: string) => {
      // 1. Update UI State
      const targetWorkout = workouts.find(w => w.id === id);
      const isNowCompleted = !targetWorkout?.completed;

      setWorkouts(prev => prev.map(w => w.id === id ? { ...w, completed: !w.completed } : w));

      // 2. Update Permanent History Log
      if (targetWorkout) {
          const todayKey = new Date().toISOString().split('T')[0];
          const historyJson = localStorage.getItem('snatched_workout_history');
          const history: Record<string, WorkoutLogItem[]> = historyJson ? JSON.parse(historyJson) : {};
          const todayLogs = history[todayKey] || [];

          if (isNowCompleted) {
              // Add to history
              const newLog: WorkoutLogItem = {
                  id: id, // Use original ID to track dupes if needed
                  name: targetWorkout.name,
                  reps: targetWorkout.reps,
                  completedAt: Date.now()
              };
              // Avoid duplicates in history for same day if user toggles back and forth
              if (!todayLogs.some(l => l.name === targetWorkout.name)) {
                  history[todayKey] = [...todayLogs, newLog];
              }
          } else {
              // Remove from history if unchecked
              history[todayKey] = todayLogs.filter(l => l.name !== targetWorkout.name);
          }
          
          localStorage.setItem('snatched_workout_history', JSON.stringify(history));
      }
  };

  const deleteWorkout = (id: string) => {
      setWorkouts(prev => prev.filter(w => w.id !== id));
  };

  const addWorkout = () => {
      if (!newName) return;
      const newTask: WorkoutTask = {
          id: Date.now().toString(),
          name: newName,
          reps: newReps || '1x10',
          completed: false
      };
      setWorkouts([...workouts, newTask]);
      setNewName('');
      setNewReps('');
      setIsAdding(false);
  };

  // --- HANDLERS: AI DESIGNER ---
  const openDesigner = () => {
      setIsDesignerOpen(true);
      setPreviewWorkouts(workouts); // Start with current
      setPreviewMeta(workoutMeta);
      setChatHistory([{ role: 'ai', text: `Hi angel! I see you're doing "${workoutMeta.title}". Want to switch it up? Tell me your schedule constraints and what you want to focus on!` }]);
  };

  const handleDesignerSubmit = async () => {
      if (!chatInput.trim()) return;
      
      const userMsg = chatInput;
      setChatInput("");
      setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
      setIsGenerating(true);

      try {
          const apiKey = localStorage.getItem('snatched_api_key') || process.env.API_KEY || "";
          if (!apiKey) {
              setChatHistory(prev => [...prev, { role: 'ai', text: "Please set your API Key in Settings first!" }]);
              setIsGenerating(false);
              return;
          }

          const ai = new GoogleGenAI({ apiKey });
          
          // Context building
          const currentContext = JSON.stringify({
              currentTitle: previewMeta?.title,
              currentSchedule: previewMeta?.schedule,
              currentExercises: previewWorkouts.map(w => ({ name: w.name, reps: w.reps }))
          });

          const prompt = `
            You are a coquette, high-fashion personal trainer AI. 
            User wants to edit/create a workout.
            Context: ${currentContext}
            User Request: "${userMsg}"
            
            Task:
            1. Create a new routine based on the request.
            2. Determine the BEST schedule (days of week) for this routine based on user constraints (e.g., "I have class Thursday"). Use these exact codes: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].
            3. Estimate the TOTAL calories burned if the user completes this entire routine (be realistic).
            4. Provide a short, supportive, sassy response message.

            Output JSON ONLY:
            {
                "routineTitle": "string (Creative Name)",
                "totalEstimatedCalories": number,
                "schedule": ["string"], // Array of day codes
                "exercises": [ { "name": "string", "reps": "string" } ],
                "aiMessage": "string"
            }
          `;

          let response = null;
          let lastError = null;

          // --- FALLBACK LOGIC ---
          for (const modelName of MODELS) {
              try {
                  response = await ai.models.generateContent({
                      model: modelName,
                      contents: [{ role: 'user', parts: [{ text: prompt }] }]
                  });
                  if (response) break;
              } catch (err) {
                  console.warn(`Model ${modelName} failed in Workout Designer:`, err);
                  lastError = err;
              }
          }

          if (!response && lastError) throw lastError;

          const cleanJson = response!.text!.replace(/```json/g, '').replace(/```/g, '').trim();
          const data = JSON.parse(cleanJson);

          // Update Preview State
          setPreviewMeta({ 
              title: data.routineTitle, 
              totalCalories: data.totalEstimatedCalories,
              schedule: data.schedule || ["Mon", "Wed", "Fri"]
          });
          
          const newTasks: WorkoutTask[] = data.exercises.map((ex: any, idx: number) => ({
              id: `ai-${Date.now()}-${idx}`,
              name: ex.name,
              reps: ex.reps,
              completed: false
          }));
          setPreviewWorkouts(newTasks);

          setChatHistory(prev => [...prev, { role: 'ai', text: data.aiMessage }]);

      } catch (error) {
          console.error(error);
          setChatHistory(prev => [...prev, { role: 'ai', text: "Oops, connection to the spirit realm (API) broke. Try again later." }]);
      } finally {
          setIsGenerating(false);
      }
  };

  const saveDesignedWorkout = () => {
      if (previewMeta) {
          setWorkoutMeta(previewMeta);
          setWorkouts(previewWorkouts);
          setIsDesignerOpen(false);
          setMotivationQuote(`New Era: ${previewMeta.title}. Let's get it! 🎀`);
      }
  };


  // --- CALCULATIONS ---
  // 1. Step Calories (approx 0.04 per step)
  const caloriesFromSteps = Math.floor(steps * 0.04);
  
  // 2. Workout Calories (Proportional to completion)
  const totalTasks = workouts.length;
  const completedTasks = workouts.filter(w => w.completed).length;
  const workoutProgress = totalTasks === 0 ? 0 : completedTasks / totalTasks;
  const caloriesFromWorkout = Math.floor(workoutMeta.totalCalories * workoutProgress);

  const totalCaloriesBurned = caloriesFromSteps + caloriesFromWorkout;
  
  // Progress Ring Math
  const isOverAchieving = steps > STEP_GOAL;
  const progressBase = Math.min(steps, STEP_GOAL) / STEP_GOAL;
  const progressBonus = Math.max(0, Math.min(steps - STEP_GOAL, STEP_GOAL)) / STEP_GOAL;
  
  const offsetBase = STEP_CIRCUMFERENCE - (progressBase * STEP_CIRCUMFERENCE);
  const offsetBonus = STEP_CIRCUMFERENCE - (progressBonus * STEP_CIRCUMFERENCE);

  return (
    <div className="space-y-6 animate-fade-in relative">
       {/* INJECTED STYLES FOR FLUID ANIMATIONS */}
       <style>{`
         @keyframes modalEnter {
           from { opacity: 0; transform: scale(0.95) translateY(10px); }
           to { opacity: 1; transform: scale(1) translateY(0); }
         }
         @keyframes backdropEnter {
            from { opacity: 0; }
            to { opacity: 1; }
         }
         @keyframes slideUp {
           from { opacity: 0; transform: translateY(10px); }
           to { opacity: 1; transform: translateY(0); }
         }
         @keyframes popIn {
            0% { transform: scale(0.9); opacity: 0; }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); opacity: 1; }
         }
         .animate-modal-in { animation: modalEnter 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
         .animate-backdrop-in { animation: backdropEnter 0.3s ease-out forwards; }
         .animate-slide-up { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
         .animate-pop-in { animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
       `}</style>

       {/* --- AI DESIGNER MODAL --- */}
       {isDesignerOpen && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/30 backdrop-blur-md p-4 animate-backdrop-in">
               <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-4xl h-[80vh] flex overflow-hidden border border-white/50 animate-modal-in transition-shadow duration-300">
                   
                   {/* Left Col: Chat */}
                   <div className="w-1/3 min-w-[300px] bg-slate-50 flex flex-col border-r border-slate-100">
                       <div className="p-4 border-b border-slate-100 bg-white/50 backdrop-blur-sm">
                           <h3 className="font-serif font-bold text-lg text-slate-800 flex items-center gap-2">
                               <Icons.Sparkles className="text-accentPink w-5 h-5 animate-pulse" />
                               Workout Architect
                           </h3>
                           <p className="text-xs text-slate-400">Design your dream routine.</p>
                       </div>
                       
                       <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                           {chatHistory.map((msg, idx) => (
                               <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`} style={{ animationDelay: `${idx * 0.1}s` }}>
                                   <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                                       msg.role === 'user' 
                                       ? 'bg-slate-800 text-white rounded-tr-sm' 
                                       : 'bg-white border border-slate-100 text-slate-600 rounded-tl-sm shadow-sm'
                                   }`}>
                                       {msg.text}
                                   </div>
                               </div>
                           ))}
                           {isGenerating && (
                               <div className="flex justify-start animate-fade-in">
                                   <div className="bg-white border border-slate-100 p-3 rounded-2xl rounded-tl-sm shadow-sm">
                                        <div className="flex gap-1">
                                            <span className="w-1.5 h-1.5 bg-accentPink rounded-full animate-bounce"></span>
                                            <span className="w-1.5 h-1.5 bg-accentPink rounded-full animate-bounce delay-75"></span>
                                            <span className="w-1.5 h-1.5 bg-accentPink rounded-full animate-bounce delay-150"></span>
                                        </div>
                                   </div>
                               </div>
                           )}
                       </div>

                       <div className="p-4 bg-white border-t border-slate-100">
                           <div className="relative group">
                               <input 
                                    type="text" 
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleDesignerSubmit()}
                                    placeholder="e.g. 'I have class Fri so move it to Sat'..."
                                    className="w-full bg-slate-50 border-none rounded-xl pl-4 pr-12 py-3 text-sm focus:ring-2 focus:ring-pink-100 outline-none transition-all focus:bg-white"
                               />
                               <button 
                                    onClick={handleDesignerSubmit}
                                    disabled={!chatInput.trim() || isGenerating}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white rounded-lg text-accentPink hover:text-pink-600 transition-all hover:scale-105 disabled:opacity-50 disabled:scale-100"
                               >
                                   <SendIcon className="w-4 h-4" />
                               </button>
                           </div>
                       </div>
                   </div>

                   {/* Right Col: Preview */}
                   <div className="flex-1 bg-white flex flex-col relative">
                       <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
                           <div className="flex justify-between items-start mb-6 animate-slide-up">
                               <div>
                                   <span className="text-xs font-bold text-accentPink uppercase tracking-wider bg-pink-50 px-2 py-1 rounded-md mb-2 inline-block">Previewing</span>
                                   <h2 className="font-serif font-bold text-3xl text-slate-800">{previewMeta?.title}</h2>
                                   {/* Preview Schedule */}
                                   <div className="flex gap-1.5 mt-2">
                                       {WEEK_DAYS.map((d, i) => (
                                           <div key={d.code} className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold transition-all duration-300 ${previewMeta?.schedule.includes(d.code) ? 'bg-accentPink text-white scale-110' : 'bg-slate-100 text-slate-300'}`} style={{ transitionDelay: `${i * 0.05}s` }}>
                                               {d.label}
                                           </div>
                                       ))}
                                   </div>
                               </div>
                               <div className="text-right">
                                   <p className="text-3xl font-bold text-slate-800 animate-pop-in">{previewMeta?.totalCalories}</p>
                                   <p className="text-xs font-bold text-slate-400 uppercase">Est. Kcal</p>
                               </div>
                           </div>

                           <div className="space-y-3">
                               {previewWorkouts.map((task, i) => (
                                   <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-transparent animate-slide-up" style={{ animationDelay: `${i * 0.05 + 0.2}s` }}>
                                       <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-300 font-serif font-bold text-sm shadow-sm">
                                           {i + 1}
                                       </div>
                                       <div>
                                           <p className="font-bold text-slate-700 text-sm">{task.name}</p>
                                           <p className="text-xs font-medium text-slate-400">{task.reps}</p>
                                       </div>
                                   </div>
                               ))}
                           </div>
                       </div>

                       <div className="p-6 border-t border-slate-50 flex justify-end gap-3 bg-white z-10">
                           <button 
                                onClick={() => setIsDesignerOpen(false)}
                                className="px-6 py-3 rounded-xl text-slate-400 hover:bg-slate-50 font-bold text-sm transition-colors"
                           >
                               Cancel
                           </button>
                           <button 
                                onClick={saveDesignedWorkout}
                                className="px-8 py-3 rounded-xl bg-accentPink text-white font-bold text-sm shadow-lg shadow-pink-200 hover:bg-pink-500 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95 flex items-center gap-2"
                           >
                               <Icons.Check className="w-4 h-4" />
                               Seal with a Kiss 💋
                           </button>
                       </div>
                   </div>
               </div>
           </div>
       )}

       {/* Header */}
       <div className="flex flex-col md:flex-row justify-between items-end border-b border-slate-100 pb-6 gap-4">
          <div>
            <h2 className="text-3xl font-serif text-slateText mb-2 animate-slide-up">Wellness Studio</h2>
            <p className="text-slate-500 animate-slide-up" style={{ animationDelay: '0.1s' }}>Sculpting the masterpiece that is you.</p>
          </div>
       </div>

       {/* Grid Layout */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           
           {/* Column 1: The Movement */}
           <Card title="Daily Steps 🩰" className="flex flex-col justify-between min-h-[420px] transition-all hover:scale-[1.01] hover:shadow-float duration-500">
               <div className="flex flex-col items-center justify-center flex-1 pt-6 pb-2">
                   
                   {/* Step Counter Visualization */}
                   <div className="relative w-48 h-48 flex items-center justify-center mb-6">
                        
                        {/* Static Background Track */}
                        <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 192 192">
                            <circle cx={CENTER_XY} cy={CENTER_XY} r={STEP_RADIUS} fill="none" stroke="#F1F5F9" strokeWidth="6" />
                        </svg>

                        {/* Base Goal Ring (Pink) */}
                        <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 192 192">
                            <circle 
                                cx={CENTER_XY} cy={CENTER_XY} r={STEP_RADIUS} 
                                fill="none" stroke="#FB7185" strokeWidth="6" 
                                strokeDasharray={STEP_CIRCUMFERENCE} 
                                strokeDashoffset={offsetBase} 
                                strokeLinecap="round" 
                                className="transition-all duration-1000 ease-out" 
                            />
                        </svg>

                        {/* Bonus Overachiever Ring (Blue/Glowing) */}
                        {isOverAchieving && (
                             <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 192 192">
                                <circle 
                                    cx={CENTER_XY} cy={CENTER_XY} r={STEP_RADIUS} 
                                    fill="none" stroke="#0EA5E9" strokeWidth="6" 
                                    strokeDasharray={STEP_CIRCUMFERENCE} 
                                    strokeDashoffset={offsetBonus} 
                                    strokeLinecap="round" 
                                    className="transition-all duration-1000 ease-out drop-shadow-[0_0_4px_rgba(14,165,233,0.4)] animate-pulse" 
                                />
                            </svg>
                        )}
                        
                        {/* Center Content */}
                        <div className="text-center z-10 flex flex-col items-center justify-center">
                             <div className={`transition-transform duration-500 ${isOverAchieving ? 'scale-110 mb-1' : 'mb-2'}`}>
                                <FootprintsIcon className={`w-6 h-6 transition-colors ${isOverAchieving ? 'text-accentBlue' : 'text-pink-300'}`} />
                             </div>
                             <span className={`block text-3xl font-serif font-bold tracking-tight leading-none transition-colors duration-300 ${isOverAchieving ? 'text-accentBlue' : 'text-slate-700'}`}>
                                 {steps.toLocaleString()}
                             </span>
                             <span className={`text-[10px] font-bold uppercase tracking-widest mt-1 block transition-colors duration-300 ${isOverAchieving ? 'text-accentBlue' : 'text-slate-400'}`}>
                                 {isOverAchieving ? 'Overachiever' : 'Steps'}
                             </span>
                        </div>
                   </div>
                   
                   {/* Minimal Controls */}
                   <div className="w-full max-w-[200px] space-y-4">
                       <div className="relative group">
                           <input 
                             type="range" 
                             min="0" 
                             max="25000" 
                             step="100"
                             value={steps} 
                             onChange={handleStepChange}
                             className={`w-full h-1.5 rounded-full appearance-none cursor-pointer transition-all ${isOverAchieving ? 'bg-blue-100 accent-accentBlue' : 'bg-slate-100 accent-accentPink'}`}
                           />
                           <div className="flex justify-between text-[8px] font-bold text-slate-300 mt-1 uppercase tracking-wider group-hover:text-slate-400 transition-colors">
                               <span>Start</span>
                               <span>Goal</span>
                           </div>
                       </div>
                       
                       <div className="flex justify-center gap-2">
                           <button 
                                onClick={() => setSteps(Math.max(0, steps - 500))} 
                                className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-white hover:text-accentPink hover:shadow-subtle hover:scale-110 transition-all border border-transparent hover:border-pink-50 active:scale-95"
                           >
                               -
                           </button>
                           <button 
                                onClick={() => setSteps(steps + 500)} 
                                className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-white hover:text-accentPink hover:shadow-subtle hover:scale-110 transition-all border border-transparent hover:border-pink-50 active:scale-95"
                           >
                               +
                           </button>
                       </div>
                   </div>
               </div>
               
               {/* Badge */}
               <div className={`rounded-xl p-3 flex items-center justify-between border shadow-sm mt-2 transition-colors duration-500 ${isOverAchieving ? 'bg-blue-50/50 border-blue-100' : 'bg-white border-slate-100'}`}>
                   <div className="flex items-center gap-2">
                       <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-500 ${isOverAchieving ? 'bg-white text-accentBlue' : 'bg-pink-50 text-accentPink'}`}>
                           <Icons.Activity className="w-3.5 h-3.5" />
                       </div>
                       <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-600">Total Burn</span>
                            <span className="text-[10px] text-slate-400">Steps + Workout</span>
                       </div>
                   </div>
                   <span className={`text-base font-bold transition-colors duration-500 ${isOverAchieving ? 'text-accentBlue' : 'text-slate-700'}`}>{totalCaloriesBurned} <span className="text-[10px] font-normal text-slate-400 uppercase">kcal</span></span>
               </div>
           </Card>

           {/* Column 2: The Routine */}
           <Card className="flex flex-col min-h-[420px] relative transition-all hover:scale-[1.01] hover:shadow-float duration-500">
               <div className="flex justify-between items-start mb-4">
                   <div>
                       <div className="flex items-center justify-between min-w-[200px]">
                           <h3 className="font-serif font-bold text-xl text-slateText">{workoutMeta.title}</h3>
                           {/* SCHEDULE BADGES */}
                           <div className="flex gap-1 ml-4">
                               {WEEK_DAYS.map((d) => (
                                   <div key={d.code} className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold transition-all duration-300 ${workoutMeta.schedule.includes(d.code) ? 'bg-accentPink text-white' : 'bg-slate-100 text-slate-300'}`}>
                                       {d.label}
                                   </div>
                               ))}
                           </div>
                       </div>
                       <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs font-medium text-slate-400">{workouts.length} Movements</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span className="text-xs font-bold text-accentPink">{workoutMeta.totalCalories} kcal</span>
                       </div>
                   </div>
                   <div className="text-right">
                       <p className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Completion</p>
                       <p className="font-bold text-slate-700 transition-all duration-300 key={workoutProgress}">{Math.round(workoutProgress * 100)}%</p>
                   </div>
               </div>

               {/* Progress Bar for Workout */}
               <div className="w-full bg-slate-100 rounded-full h-1.5 mb-6 overflow-hidden">
                   <div style={{ width: `${workoutProgress * 100}%` }} className="h-full bg-gradient-to-r from-pink-300 to-accentPink rounded-full transition-all duration-700 ease-out"></div>
               </div>

               <div className="flex-1 space-y-2 overflow-y-auto max-h-[320px] pr-2 custom-scrollbar my-2">
                   {workouts.length === 0 ? (
                       <div className="flex flex-col items-center justify-center h-full text-center py-10 opacity-50">
                           <Icons.Activity className="w-8 h-8 text-slate-300 mb-2" />
                           <p className="text-slate-400 italic text-sm">No exercises planned yet.</p>
                       </div>
                   ) : (
                       workouts.map((task) => (
                           <div key={task.id} className="group flex items-center gap-4 p-3.5 rounded-2xl border border-transparent hover:border-pink-200 hover:bg-pink-50/30 transition-all cursor-pointer bg-slate-50/50 hover:shadow-sm hover:-translate-x-[-2px]" onClick={() => toggleWorkout(task.id)}>
                               <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 flex-shrink-0 shadow-sm ${task.completed ? 'bg-accentPink border-accentPink scale-110' : 'bg-white border-slate-200 group-hover:border-accentPink'}`}>
                                   {task.completed ? <BowIcon className="w-4 h-4 text-white animate-pop-in" /> : null}
                               </div>
                               
                               <div className="flex-1 min-w-0">
                                   <p className={`text-sm font-bold truncate transition-all duration-300 ${task.completed ? 'text-slate-400 line-through decoration-pink-300 decoration-2' : 'text-slate-700'}`}>{task.name}</p>
                                   <p className={`text-xs font-medium transition-all duration-300 ${task.completed ? 'text-pink-200' : 'text-slate-400'}`}>{task.reps}</p>
                               </div>

                               <button 
                                onClick={(e) => { e.stopPropagation(); deleteWorkout(task.id); }}
                                className="p-2 text-slate-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 rounded-lg hover:scale-110"
                                >
                                   <TrashIcon className="w-4 h-4" />
                               </button>
                           </div>
                       ))
                   )}
               </div>

               {/* Add Workout / AI Section */}
               <div className="mt-auto pt-4 border-t border-slate-50">
                   {isAdding ? (
                       <div className="animate-slide-up bg-white p-4 rounded-2xl border border-pink-100 shadow-float">
                           <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">New Exercise</p>
                           <input 
                             type="text" 
                             placeholder="Exercise Name (e.g. Hip Thrusts)" 
                             value={newName}
                             onChange={(e) => setNewName(e.target.value)}
                             className="w-full bg-slate-50 border-none rounded-xl px-4 py-2.5 text-sm mb-2 focus:ring-2 focus:ring-pink-100 focus:bg-white transition-all outline-none"
                             autoFocus
                           />
                           <div className="flex gap-2">
                               <input 
                                 type="text" 
                                 placeholder="Reps" 
                                 value={newReps}
                                 onChange={(e) => setNewReps(e.target.value)}
                                 className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-pink-100 focus:bg-white transition-all outline-none"
                               />
                               <button 
                                onClick={addWorkout}
                                className="px-4 py-2 bg-accentPink text-white rounded-xl text-xs font-bold hover:bg-pink-500 shadow-md transition-all active:scale-95"
                               >
                                   Save
                               </button>
                               <button 
                                onClick={() => setIsAdding(false)}
                                className="px-3 text-slate-400 hover:text-slate-600 transition-colors"
                               >
                                   Cancel
                               </button>
                           </div>
                       </div>
                   ) : (
                       <div className="flex gap-3">
                            <button 
                                onClick={openDesigner}
                                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-900 text-white text-sm font-bold shadow-lg shadow-slate-200 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group active:scale-[0.98]"
                            >
                                <SparkleIcon className="w-4 h-4 text-accentPink animate-pulse" />
                                AI Design
                            </button>
                            <button 
                                onClick={() => setIsAdding(true)}
                                className="px-4 py-3.5 border border-slate-200 rounded-2xl text-slate-400 hover:border-accentPink hover:text-accentPink hover:bg-pink-50 transition-all flex items-center justify-center group hover:scale-105 active:scale-95"
                            >
                                <Icons.Plus className="w-5 h-5" />
                            </button>
                       </div>
                   )}
               </div>
           </Card>
       </div>

       {/* Bottom Text Only (No Card/Background) */}
       <div className="w-full text-center py-6 opacity-90">
           <p className={`font-serif italic text-base transition-colors duration-500 ${isOverAchieving ? 'text-accentBlue' : 'text-slate-400'}`}>
               "{motivationQuote}"
           </p>
       </div>
    </div>
  );
};

export default BodyView;
