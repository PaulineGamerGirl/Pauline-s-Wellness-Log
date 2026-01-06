
import React, { useState, useEffect, useRef, useMemo } from 'react';
import Card from '../Card';
import { Icons } from '../Icons';
import { GoogleGenAI } from "@google/genai";
import { BodyMetrics, NutritionalGoals } from '../../types';

// --- ICONS ---
const CameraIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
);

const TrashIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
);

const XMarkIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);

const RefreshIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21.5 2v6h-6"/><path d="M2.5 22v-6h6"/><path d="M2 11.5a10 10 0 0 1 18.8-4.3L21.5 8"/><path d="M22 12.5a10 10 0 0 1-18.8 4.2L2.5 16"/></svg>
);

const SendIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
  ),
  BowIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 12c2-3 5-3 6 0s-2 5-6 2c-4 3-7 1-6-2s4-3 6 0" />
        <path d="M12 12c0 4 1 6 3 8" />
        <path d="M12 12c0 4-1 6-3 8" />
    </svg>
  );

const RulerIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z"/><path d="m14.5 12.5 2-2"/><path d="m11.5 9.5 2-2"/><path d="m8.5 6.5 2-2"/><path d="m17.5 15.5 2-2"/></svg>
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
  mealType?: string; // New field
}

interface AnalysisData {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
    summary: string;
    dietary_feedback: string;
}

interface MealSuggestion {
  name: string;
  calories: number;
  protein: number;
  description: string;
  ingredients: string[];
}

interface WeightLog {
    date: string; // ISO YYYY-MM-DD
    weight: number;
}

// --- CONSTANTS ---
const STORAGE_KEYS = {
    HISTORY: 'snatched_history',
    PANTRY: 'snatched_pantry',
    BODY: 'snatched_body_metrics',
    GOALS: 'snatched_goals',
    WEIGHT_HISTORY: 'snatched_weight_history'
};

// FALLBACK MODELS LIST
const MODELS = ['gemini-3-pro-preview', 'gemini-3-flash-preview', 'gemini-2.5-flash'];

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

const INITIAL_FOODS: Food[] = [
  { id: '1', name: 'Siomai (4pcs)', calories: 350, protein: 12, carbs: 30, fats: 18, fiber: 1 },
  { id: '2', name: 'Fried Tilapia', calories: 200, protein: 24, carbs: 0, fats: 10, fiber: 0 },
  { id: '3', name: 'White Rice (1 cup)', calories: 200, protein: 4, carbs: 44, fats: 0.5, fiber: 0.5 },
  { id: '4', name: 'Boiled Egg', calories: 70, protein: 6, carbs: 0.5, fats: 5, fiber: 0 },
  { id: '5', name: 'Protein Bar', calories: 180, protein: 20, carbs: 22, fats: 6, fiber: 10 },
  { id: '6', name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fats: 3.6, fiber: 0 },
  { id: '7', name: 'Dumplings', calories: 250, protein: 8, carbs: 32, fats: 9, fiber: 1 },
];

const CircularProgress: React.FC<{ value: number; max: number; color: string; label: string; subLabel: string }> = ({ value, max, color, label, subLabel }) => {
  const radius = 32;
  const stroke = 6;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(value / max, 1);
  const strokeDashoffset = circumference - percentage * circumference;

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className="relative w-20 h-20 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90 overflow-visible drop-shadow-sm">
          <circle cx="40" cy="40" r={radius} stroke="#F1F5F9" strokeWidth={stroke} fill="transparent" />
          <circle 
            cx="40" cy="40" r={radius} 
            stroke="currentColor" strokeWidth={stroke} 
            fill="transparent" 
            strokeDasharray={circumference} 
            strokeDashoffset={strokeDashoffset} 
            strokeLinecap="round" 
            className={`${color} transition-all duration-1000 ease-out`} 
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
             <span className={`text-base font-bold font-serif leading-none ${color}`}>{value}</span>
             <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mt-1">{subLabel}</span>
        </div>
      </div>
      <span className="text-sm font-serif italic text-slate-700">{label}</span>
    </div>
  );
};

// --- HELPER ---
const formatDateKey = (date: Date): string => {
    return date.toISOString().split('T')[0];
};

const MealsView: React.FC = () => {
  // --- STATE ---
  const [pantry, setPantry] = useState<Food[]>(INITIAL_FOODS);
  const [history, setHistory] = useState<Record<string, Food[]>>({}); // Key: YYYY-MM-DD, Value: Food[]
  
  // Body & Goals State
  const [showBodyModal, setShowBodyModal] = useState(false);
  const [goals, setGoals] = useState<NutritionalGoals>({ calories: 1300, protein: 100 });
  const [bodyMetrics, setBodyMetrics] = useState<BodyMetrics>({ height: '', waist: '', bust: '', hips: '', shoeSize: '' });
  const [currentWeight, setCurrentWeight] = useState<string>('');

  // Local UI States
  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(null);
  const [isAddingFood, setIsAddingFood] = useState(false);
  const [stagedFood, setStagedFood] = useState<Food | null>(null);
  const [stagedFeedback, setStagedFeedback] = useState<string>("");
  const [selectedMealType, setSelectedMealType] = useState<string>('Breakfast');
  const [showMealTypeDropdown, setShowMealTypeDropdown] = useState(false); // New explicit state for dropdown
  
  // AI States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewData, setReviewData] = useState<AnalysisData | null>(null);
  const [correctionInput, setCorrectionInput] = useState("");
  const [isRefining, setIsRefining] = useState(false);
  const [mealAnalysis, setMealAnalysis] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null); // NEW: Error state
  
  // Suggestion States
  const [standardSuggestion, setStandardSuggestion] = useState<MealSuggestion | null>(null);
  const [twistSuggestion, setTwistSuggestion] = useState<MealSuggestion | null>(null);
  const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState(false);
  const [isRegeneratingTwist, setIsRegeneratingTwist] = useState(false);
  const [showOracleModal, setShowOracleModal] = useState(false);

  // New Food Form
  const [newFoodName, setNewFoodName] = useState('');
  const [newFoodCals, setNewFoodCals] = useState('');
  const [newFoodProtein, setNewFoodProtein] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- INITIALIZATION ---
  useEffect(() => {
    const savedPantry = localStorage.getItem(STORAGE_KEYS.PANTRY);
    const savedHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
    const savedBody = localStorage.getItem(STORAGE_KEYS.BODY);
    const savedGoals = localStorage.getItem(STORAGE_KEYS.GOALS);
    const savedWeights = localStorage.getItem(STORAGE_KEYS.WEIGHT_HISTORY);

    if (savedPantry) setPantry(JSON.parse(savedPantry));
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedBody) setBodyMetrics(JSON.parse(savedBody));
    if (savedGoals) setGoals(JSON.parse(savedGoals));
    
    // Load current weight from history
    if (savedWeights) {
        const weights: WeightLog[] = JSON.parse(savedWeights);
        weights.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        if (weights.length > 0) setCurrentWeight(weights[0].weight.toString());
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PANTRY, JSON.stringify(pantry));
  }, [pantry]);

  useEffect(() => {
    if (Object.keys(history).length > 0) {
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    }
  }, [history]);

  // --- COMPUTED DATA (TODAY ONLY) ---
  const todayKey = formatDateKey(new Date());
  const dailyLogs = useMemo(() => history[todayKey] || [], [history, todayKey]);
  const totalCalories = dailyLogs.reduce((acc, item) => acc + item.calories, 0);
  const totalProtein = dailyLogs.reduce((acc, item) => acc + item.protein, 0);

  // --- CORE LOGIC ---
  const logFood = (food: Food) => {
      const foodWithMeta = { ...food, mealType: selectedMealType };
      
      setHistory(prev => {
          const key = todayKey; 
          const currentDayLogs = prev[key] || [];
          return {
              ...prev,
              [key]: [...currentDayLogs, foodWithMeta]
          };
      });
  };

  const deleteLogItem = (index: number) => {
      setHistory(prev => {
          const currentDayLogs = [...(prev[todayKey] || [])];
          currentDayLogs.splice(index, 1);
          return { ...prev, [todayKey]: currentDayLogs };
      });
  };

  // --- BODY INFO LOGIC ---
  const handleSaveBodyInfo = () => {
    // 1. Save Metrics
    localStorage.setItem(STORAGE_KEYS.BODY, JSON.stringify(bodyMetrics));
    
    // 2. Save Goals
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
    
    // 3. Save Weight to History (Upsert today)
    if (currentWeight) {
        const weightVal = parseFloat(currentWeight);
        if (!isNaN(weightVal)) {
            const savedWeights = localStorage.getItem(STORAGE_KEYS.WEIGHT_HISTORY);
            let weights: WeightLog[] = savedWeights ? JSON.parse(savedWeights) : [];
            const todayIndex = weights.findIndex(w => w.date === todayKey);
            
            if (todayIndex >= 0) {
                weights[todayIndex].weight = weightVal;
            } else {
                weights.push({ date: todayKey, weight: weightVal });
            }
            
            // Sort Descending Date
            weights.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            
            localStorage.setItem(STORAGE_KEYS.WEIGHT_HISTORY, JSON.stringify(weights));
        }
    }

    // 4. Trigger Storage Event for other tabs
    window.dispatchEvent(new Event('storage'));
    
    setShowBodyModal(false);
  };

  // --- AI ACTIONS ---
  const generateMealIdeas = async () => {
    setIsGeneratingSuggestion(true);
    setStandardSuggestion(null); setTwistSuggestion(null);
    const remainingCals = goals.calories - totalCalories;
    const pantryList = pantry.map(f => f.name).join(", ");
    try {
        const apiKey = localStorage.getItem('snatched_api_key') || process.env.API_KEY || "";
        if (!apiKey) throw new Error("No API Key");

        const ai = new GoogleGenAI({ apiKey });
        
        let response = null;
        let lastError = null;

        // RETRY LOGIC for Models
        for (const modelName of MODELS) {
            try {
                response = await ai.models.generateContent({
                    model: modelName,
                    contents: [{ role: 'user', parts: [{ text: `I have ${remainingCals} calories left today (Goal: ${goals.calories}). Pantry: [${pantryList}]. Generate TWO meal options. Return JSON: { "standard": { "name": "", "calories": 0, "protein": 0, "description": "", "ingredients": [] }, "twist": { "name": "", "calories": 0, "protein": 0, "description": "", "ingredients": [] } }` }]}]
                });
                if(response) break; // Success
            } catch (err) {
                console.warn(`Model ${modelName} failed`, err);
                lastError = err;
                continue; // Try next model
            }
        }
        
        if (!response && lastError) throw lastError;

        const cleanJson = response!.text!.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(cleanJson);
        setStandardSuggestion(data.standard); setTwistSuggestion(data.twist);
        setShowOracleModal(true); 
    } catch (e) { 
        console.error(e); 
        setMealAnalysis("The Oracle is resting (Quota Exceeded). Try again in a moment.");
    } finally { setIsGeneratingSuggestion(false); }
  };

  const regenerateTwist = async () => {
      setIsRegeneratingTwist(true);
      const remainingCals = goals.calories - totalCalories;
      try {
        const apiKey = localStorage.getItem('snatched_api_key') || process.env.API_KEY || "";
        if (!apiKey) throw new Error("No API Key");

        const ai = new GoogleGenAI({ apiKey });
        
        let response = null;
        let lastError = null;

        // RETRY LOGIC
        for (const modelName of MODELS) {
             try {
                 response = await ai.models.generateContent({
                    model: modelName,
                    contents: [{ role: 'user', parts: [{ text: `Give me a NEW twist meal option < ${remainingCals} cals. Return JSON: { "name": "", "calories": 0, "protein": 0, "description": "", "ingredients": [] }` }]}]
                });
                if(response) break;
             } catch (err) {
                 lastError = err;
                 continue;
             }
        }

        if (!response && lastError) throw lastError;

        const cleanJson = response!.text!.replace(/```json/g, '').replace(/```/g, '').trim();
        setTwistSuggestion(JSON.parse(cleanJson));
      } catch(e) { console.error(e); } finally { setIsRegeneratingTwist(false); }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsAnalyzing(true); 
    setReviewModalOpen(true); 
    setReviewData(null);
    setError(null); 

    try {
      const apiKey = localStorage.getItem('snatched_api_key') || process.env.API_KEY || "";
      if (!apiKey) throw new Error("API Key Missing. Check Settings.");

      const base64Data = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => { resolve((reader.result as string).split(',')[1]); };
        reader.readAsDataURL(file);
      });
      const ai = new GoogleGenAI({ apiKey });
      
      let response = null;
      let lastError = null;

      // RETRY LOGIC
      for (const modelName of MODELS) {
          try {
              response = await ai.models.generateContent({
                model: modelName,
                contents: [{ role: 'user', parts: [{ inlineData: { mimeType: file.type, data: base64Data } }, { text: 'Identify this food. Return JSON: { "name": "string", "calories": number, "protein": number, "carbs": number, "fats": number, "fiber": number, "summary": "string", "dietary_feedback": "string" }' }]}]
              });
              if (response) break;
          } catch (err) {
              console.warn(`Model ${modelName} failed`, err);
              lastError = err;
              continue;
          }
      }

      if (!response && lastError) throw lastError;

      setReviewData(JSON.parse(response!.text!.replace(/```json/g, '').replace(/```/g, '').trim()));
    } catch (error: any) { 
        console.error(error);
        setError("Analysis Failed: " + (error.message || "Quota exceeded. Try again later."));
    } finally { setIsAnalyzing(false); }
  };

  const handleRefineAnalysis = async () => {
      setIsRefining(true);
      try {
          const apiKey = localStorage.getItem('snatched_api_key') || process.env.API_KEY || "";
          if (!apiKey) throw new Error("No API Key");

          const ai = new GoogleGenAI({ apiKey });
          
          let response = null;
          let lastError = null;

           // RETRY LOGIC
          for (const modelName of MODELS) {
              try {
                  response = await ai.models.generateContent({
                      model: modelName,
                      contents: [{ role: 'user', parts: [{ text: `Original: ${JSON.stringify(reviewData)}. Correction: "${correctionInput}". Update JSON.` }]}]
                  });
                  if(response) break;
              } catch(err) {
                  lastError = err;
                  continue;
              }
          }
          if(!response && lastError) throw lastError;

          setReviewData(JSON.parse(response!.text!.replace(/```json/g, '').replace(/```/g, '').trim()));
          setCorrectionInput("");
      } catch (e) { console.error(e); } finally { setIsRefining(false); }
  };

  const handleConfirmAnalysis = () => {
      if (!reviewData) return;
      const newFood: Food = { id: Date.now().toString(), name: reviewData.name, calories: reviewData.calories, protein: reviewData.protein, carbs: reviewData.carbs, fats: reviewData.fats, fiber: reviewData.fiber };
      setPantry(prev => [...prev, newFood]);
      setStagedFood(newFood); setStagedFeedback(reviewData.dietary_feedback); setMealAnalysis(reviewData.summary); setReviewModalOpen(false); setReviewData(null);
  };

  const handleLogStagedMeal = () => {
      if (!stagedFood) return;
      logFood(stagedFood);
      setStagedFood(null); setStagedFeedback(""); setSelectedFoodId(null);
  };

  const handlePantrySelect = (food: Food) => {
      setSelectedFoodId(food.id);
      setStagedFood(food);
      setStagedFeedback("A staple choice! Make sure to drink water with it. 💧");
  };

  const handleLogSuggestion = (meal: MealSuggestion) => {
      const newFood: Food = { id: Date.now().toString(), name: meal.name, calories: meal.calories, protein: meal.protein, carbs: 0, fats: 0, fiber: 0 };
      setStagedFood(newFood);
      setStagedFeedback("Oracle's choice!");
      setSelectedFoodId(null);
      setShowOracleModal(false);
  };

  const handleAddFoodToDb = () => {
    if (!newFoodName || !newFoodCals || !newFoodProtein) return;
    const newFood: Food = { id: Date.now().toString(), name: newFoodName, calories: parseInt(newFoodCals), protein: parseInt(newFoodProtein), carbs: 0, fats: 0, fiber: 0 };
    setPantry(prev => [...prev, newFood]);
    handlePantrySelect(newFood);
    setIsAddingFood(false); setNewFoodName(''); setNewFoodCals(''); setNewFoodProtein('');
  };

  const handleDeletePantryItem = (id: string) => {
      if (pantry.length <= 1) return;
      setPantry(prev => prev.filter(f => f.id !== id));
      if (selectedFoodId === id) { setSelectedFoodId(null); setStagedFood(null); }
  };

  return (
    <div className="space-y-4 animate-fade-in relative pb-6">
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

       {/* BODY METRICS MODAL */}
       {showBodyModal && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-fade-in">
               <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg p-8 animate-modal-in overflow-y-auto max-h-[90vh]">
                   <div className="flex justify-between items-center mb-6">
                       <h3 className="font-serif font-bold text-2xl text-slate-800">Body & Goals</h3>
                       <button onClick={() => setShowBodyModal(false)} className="text-slate-400 hover:text-slate-600"><XMarkIcon className="w-6 h-6"/></button>
                   </div>
                   
                   <div className="space-y-6">
                       {/* Section 1: Goals */}
                       <div className="bg-pink-50/50 p-5 rounded-2xl border border-pink-100">
                           <h4 className="text-xs font-bold text-accentPink uppercase tracking-wider mb-4">Daily Targets</h4>
                           <div className="grid grid-cols-2 gap-4">
                               <div>
                                   <label className="text-xs font-bold text-slate-500 mb-1 block">Calories</label>
                                   <input type="number" value={goals.calories} onChange={(e) => setGoals({...goals, calories: parseInt(e.target.value) || 0})} className="w-full bg-white border border-pink-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-accentPink/20" />
                               </div>
                               <div>
                                   <label className="text-xs font-bold text-slate-500 mb-1 block">Protein (g)</label>
                                   <input type="number" value={goals.protein} onChange={(e) => setGoals({...goals, protein: parseInt(e.target.value) || 0})} className="w-full bg-white border border-pink-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-accentPink/20" />
                               </div>
                           </div>
                       </div>

                       {/* Section 2: Metrics */}
                       <div>
                           <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Measurements</h4>
                           <div className="space-y-4">
                               <div>
                                   <label className="text-xs font-bold text-slate-500 mb-1 block">Current Weight</label>
                                   <input type="number" placeholder="kg" value={currentWeight} onChange={(e) => setCurrentWeight(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 focus:outline-none focus:border-slate-300" />
                                   <p className="text-[10px] text-slate-400 mt-1 italic">Updates history automatically.</p>
                               </div>
                               
                               <div className="grid grid-cols-2 gap-4">
                                   <div>
                                       <label className="text-xs font-bold text-slate-500 mb-1 block">Height</label>
                                       <input type="text" placeholder="cm/ft" value={bodyMetrics.height} onChange={(e) => setBodyMetrics({...bodyMetrics, height: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none" />
                                   </div>
                                   <div>
                                       <label className="text-xs font-bold text-slate-500 mb-1 block">Shoe Size</label>
                                       <input type="text" placeholder="EU/US" value={bodyMetrics.shoeSize} onChange={(e) => setBodyMetrics({...bodyMetrics, shoeSize: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none" />
                                   </div>
                               </div>

                               <div className="grid grid-cols-3 gap-3">
                                   <div>
                                       <label className="text-xs font-bold text-slate-500 mb-1 block">Bust</label>
                                       <input type="text" placeholder="in/cm" value={bodyMetrics.bust} onChange={(e) => setBodyMetrics({...bodyMetrics, bust: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none" />
                                   </div>
                                   <div>
                                       <label className="text-xs font-bold text-slate-500 mb-1 block">Waist</label>
                                       <input type="text" placeholder="in/cm" value={bodyMetrics.waist} onChange={(e) => setBodyMetrics({...bodyMetrics, waist: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none" />
                                   </div>
                                   <div>
                                       <label className="text-xs font-bold text-slate-500 mb-1 block">Hips</label>
                                       <input type="text" placeholder="in/cm" value={bodyMetrics.hips} onChange={(e) => setBodyMetrics({...bodyMetrics, hips: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none" />
                                   </div>
                               </div>
                           </div>
                       </div>
                       
                       <div className="pt-4">
                           <button onClick={handleSaveBodyInfo} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-slate-800 transition-all active:scale-[0.98]">Save Changes</button>
                       </div>
                   </div>
               </div>
           </div>
       )}

        {/* REVIEW MODAL */}
        {reviewModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/20 backdrop-blur-md p-4 animate-fade-in">
                <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] animate-modal-in">
                     <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                        <h3 className="font-serif font-bold text-xl text-slate-800">Review Analysis</h3>
                        <button onClick={() => setReviewModalOpen(false)} className="text-slate-400 hover:text-slate-600"><XMarkIcon className="w-6 h-6" /></button>
                    </div>
                    <div className="p-6 overflow-y-auto custom-scrollbar">
                        {isAnalyzing && !reviewData ? (
                            <div className="flex flex-col items-center justify-center py-12"><Icons.Sparkles className="w-12 h-12 text-accentPink animate-spin mb-4" /><p className="text-slate-500 font-medium animate-pulse">Consulting the spirits...</p></div>
                        ) : error ? ( 
                            // Error State UI
                            <div className="flex flex-col items-center justify-center py-8 text-center animate-fade-in">
                                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-400 mb-3">
                                    <XMarkIcon className="w-6 h-6" />
                                </div>
                                <p className="text-slate-700 font-bold mb-1">Analysis Failed</p>
                                <p className="text-slate-400 text-xs mb-4 max-w-[200px]">{error}</p>
                                <button onClick={() => setReviewModalOpen(false)} className="text-accentPink text-xs font-bold hover:underline">Dismiss</button>
                            </div>
                        ) : reviewData ? (
                            <div className="space-y-6 animate-slide-up">
                                <div className="bg-pink-50/50 p-4 rounded-xl border border-pink-100"><p className="text-slate-700 text-sm leading-relaxed">"{reviewData.summary}"</p></div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="bg-slate-50 p-3 rounded-xl text-center"><p className="text-xs text-slate-400 font-bold mb-1">Calories</p><p className="text-xl font-bold text-slate-800">{reviewData.calories}</p></div>
                                    <div className="bg-slate-50 p-3 rounded-xl text-center"><p className="text-xs text-slate-400 font-bold mb-1">Protein</p><p className="text-xl font-bold text-accentBlue">{reviewData.protein}g</p></div>
                                    <div className="bg-slate-50 p-3 rounded-xl text-center"><p className="text-xs text-slate-400 font-bold mb-1">Carbs</p><p className="text-xl font-bold text-slate-600">{reviewData.carbs}g</p></div>
                                </div>
                                <div className="space-y-2 relative">
                                    <input type="text" value={correctionInput} onChange={(e) => setCorrectionInput(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter') handleRefineAnalysis(); }} placeholder="Correction? e.g. 'Add 1 cup rice'" className="w-full pl-4 pr-12 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:border-accentPink outline-none" />
                                    <button onClick={handleRefineAnalysis} disabled={!correctionInput || isRefining} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-slate-100 rounded-lg text-slate-500">{isRefining ? <Icons.Sparkles className="w-4 h-4 animate-spin" /> : <SendIcon className="w-4 h-4" />}</button>
                                </div>
                            </div>
                        ) : null}
                    </div>
                    <div className="p-6 border-t border-slate-50 bg-slate-50/50">
                        <button onClick={handleConfirmAnalysis} disabled={!reviewData || isRefining || !!error} className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold shadow-lg shadow-slate-300 hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50">Stage Meal</button>
                    </div>
                </div>
            </div>
        )}

        {/* ORACLE RESULTS MODAL */}
        {showOracleModal && (
             <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/30 backdrop-blur-md p-4 animate-fade-in">
                 <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] animate-modal-in relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-pink-300 to-accentPink"></div>
                    <button onClick={() => setShowOracleModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 z-10 p-2 bg-white/50 rounded-full hover:bg-white transition-colors"><XMarkIcon className="w-6 h-6" /></button>
                    
                    <div className="p-8 text-center pb-2">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-pink-50 text-accentPink mb-3 shadow-inner">
                            <Icons.Sparkles className="w-6 h-6 animate-pulse" />
                        </div>
                        <h3 className="font-serif font-bold text-2xl text-slate-800">The Oracle Speaks</h3>
                        <p className="text-slate-400 text-sm mt-1">Two paths lie before you.</p>
                    </div>

                    <div className="p-8 pt-4 overflow-y-auto custom-scrollbar">
                         {standardSuggestion && twistSuggestion && (
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card className="border-t-4 border-t-slate-300 bg-slate-50/50 hover:bg-white transition-colors animate-slide-up">
                                    <div className="flex justify-between items-start mb-3"><span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-2 py-1 rounded-md uppercase tracking-wide">The Standard</span><span className="text-xs font-bold text-slate-700 bg-white px-2 py-1 rounded-lg shadow-sm border border-slate-100">{standardSuggestion.calories} kcal</span></div>
                                    <h4 className="font-serif font-bold text-lg text-slate-800 mb-2 leading-tight">{standardSuggestion.name}</h4>
                                    <p className="text-xs text-slate-600 mb-4 leading-relaxed">{standardSuggestion.description}</p>
                                    <button onClick={() => handleLogSuggestion(standardSuggestion)} className="w-full py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-800 hover:text-white hover:border-slate-800 transition-all shadow-sm">Log This Meal</button>
                                </Card>

                                <Card className="border-t-4 border-t-accentPink bg-pink-50/30 hover:bg-pink-50 transition-colors relative overflow-hidden animate-slide-up" style={{ animationDelay: '0.1s' }}>
                                     <div className="absolute top-0 right-0 p-4 opacity-5"><Icons.Sparkles className="w-24 h-24 rotate-12" /></div>
                                     <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-3"><span className="text-[10px] font-bold bg-pink-100 text-accentPink px-2 py-1 rounded-md uppercase tracking-wide">The Twist ✨</span><div className="flex items-center gap-2"><span className="text-xs font-bold text-slate-700 bg-white px-2 py-1 rounded-lg shadow-sm border border-pink-100">{twistSuggestion.calories} kcal</span><button onClick={regenerateTwist} disabled={isRegeneratingTwist} className="p-1 hover:bg-white rounded-full text-slate-400 hover:text-accentPink transition-colors"><RefreshIcon className={`w-3.5 h-3.5 ${isRegeneratingTwist ? 'animate-spin' : ''}`} /></button></div></div>
                                        <h4 className="font-serif font-bold text-lg text-slate-800 mb-2 leading-tight">{twistSuggestion.name}</h4>
                                        <p className="text-xs text-slate-600 mb-4 leading-relaxed">{twistSuggestion.description}</p>
                                        <button onClick={() => handleLogSuggestion(twistSuggestion)} className="w-full py-2.5 rounded-xl bg-accentPink text-white text-xs font-bold shadow-md shadow-pink-200 hover:bg-pink-500 hover:scale-[1.02] transition-all">Log This Twist</button>
                                     </div>
                                </Card>
                           </div>
                       )}
                    </div>
                 </div>
             </div>
        )}

       <div className="flex items-end justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-3xl font-serif text-slateText mb-2 animate-slide-up">Today's Meals</h2>
            <p className="text-slate-500 animate-slide-up" style={{ animationDelay: '0.1s' }}>Log what you eat, right here, right now.</p>
          </div>
          <button 
             onClick={() => setShowBodyModal(true)}
             className="px-4 py-2 bg-pink-50 hover:bg-pink-100 text-accentPink font-bold text-xs rounded-xl transition-colors flex items-center gap-2 animate-slide-up" style={{ animationDelay: '0.15s' }}
          >
              <RulerIcon className="w-4 h-4" /> Edit Body
          </button>
       </div>

       {/* --- NEW LAYOUT: ALIGNED ROWS --- */}
       <div className="flex flex-col gap-4">
           
           {/* === TOP ROW: LOGGING vs STATS/EATEN === */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
               
               {/* LEFT: LOG MEAL (Full Height to match Right Column) */}
               <Card 
                    title="Log Meal" 
                    className="flex flex-col gap-4 animate-slide-up h-full"
                    action={
                        <div className="relative z-20">
                           <button 
                                onClick={() => setShowMealTypeDropdown(!showMealTypeDropdown)}
                                className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-slate-200 transition-colors"
                           >
                              For: <span className="text-slate-800">{selectedMealType}</span> <Icons.ChevronDown className="w-3 h-3" />
                           </button>
                           {/* Dropdown menu - Click based */}
                           {showMealTypeDropdown && (
                               <div className="absolute right-0 top-full mt-2 bg-white border border-slate-100 shadow-xl rounded-xl p-1.5 w-32 animate-fade-in z-30">
                                  {MEAL_TYPES.map(t => (
                                      <button 
                                        key={t} 
                                        onClick={() => { setSelectedMealType(t); setShowMealTypeDropdown(false); }} 
                                        className={`block w-full text-left px-3 py-2 text-xs font-bold rounded-lg transition-colors ${selectedMealType === t ? 'bg-pink-50 text-accentPink' : 'text-slate-600 hover:bg-slate-50'}`}
                                      >
                                          {t}
                                      </button>
                                  ))}
                               </div>
                           )}
                        </div>
                    }
                >
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                    {/* Compact Square Dropzone (h-40 to fit screen) */}
                    <div onClick={() => fileInputRef.current?.click()} className={`relative h-44 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group border-slate-200 hover:border-accentPink hover:bg-slate-50`}>
                        <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-white flex items-center justify-center text-slate-400 group-hover:text-accentPink transition-colors shadow-sm"><CameraIcon className="w-5 h-5" /></div>
                        <span className="text-sm font-bold text-slate-400 group-hover:text-slate-600">Scan Meal</span>
                    </div>

                    <div className="space-y-3 flex-1">
                        {stagedFood ? (
                            <div className="animate-slide-up space-y-4">
                                <div className="flex items-center justify-between"><h4 className="font-serif font-bold text-lg text-slate-700">Ready to Log</h4><button onClick={() => { setStagedFood(null); setSelectedFoodId(null); }} className="text-xs text-red-400 hover:text-red-600 font-bold">Clear</button></div>
                                <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-pink-50/50 text-slate-400 font-bold uppercase text-[10px] tracking-wider"><tr><th className="px-4 py-3">Item</th><th className="px-2 py-3 text-right">Kcal</th><th className="px-2 py-3 text-right hidden sm:table-cell">P(g)</th></tr></thead>
                                        <tbody className="divide-y divide-slate-50"><tr><td className="px-4 py-3 font-bold text-slate-700">{stagedFood.name}</td><td className="px-2 py-3 text-right text-slate-600">{stagedFood.calories}</td><td className="px-2 py-3 text-right text-accentBlue font-bold hidden sm:table-cell">{stagedFood.protein}</td></tr></tbody>
                                    </table>
                                </div>
                                {stagedFeedback && (
                                    <div className="relative bg-gradient-to-r from-pink-50 to-white p-4 rounded-xl border border-pink-100 flex gap-3 items-start">
                                        <div className="shrink-0 mt-0.5 text-accentPink"><BowIcon className="w-5 h-5" /></div>
                                        <div><p className="text-xs font-bold text-accentPink uppercase tracking-wider mb-1">Coach's Note</p><p className="text-sm text-slate-600 italic leading-relaxed">"{stagedFeedback}"</p></div>
                                    </div>
                                )}

                                <button onClick={handleLogStagedMeal} className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold shadow-lg shadow-slate-300 hover:bg-slate-800 transition-all active:scale-[0.98]">Log Entry</button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-4 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 h-full"><p className="text-sm text-slate-400 font-medium mb-1">No meal staged yet.</p><p className="text-[10px] text-slate-300">Select from pantry or scan a photo to begin.</p></div>
                        )}
                    </div>
                </Card>

               {/* RIGHT: STATS & EATEN (Stacked) */}
               <div className="flex flex-col gap-4">
                    <Card className="bg-white border border-slate-100 shadow-sm py-5 animate-slide-up">
                        <div className="flex items-center justify-evenly">
                            <CircularProgress value={totalCalories} max={goals.calories} color="text-accentPink" label="Energy" subLabel="Kcal" />
                            <div className="h-12 w-px bg-slate-100 rounded-full"></div>
                            <CircularProgress value={totalProtein} max={goals.protein} color="text-accentBlue" label="Glutes" subLabel="Protein" />
                        </div>
                    </Card>

                    <Card title="Eaten Today" className="animate-slide-up flex-1" style={{ animationDelay: '0.1s' }}>
                        {dailyLogs.length === 0 ? <p className="text-center text-sm text-slate-400 italic py-8">No meals logged yet today.</p> : (
                            <div className="space-y-3">
                                {dailyLogs.map((log, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-white transition-all group">
                                        <div>
                                            <p className="font-bold text-slate-700 text-sm flex items-center gap-2">
                                                {log.name}
                                                {log.mealType && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-400 font-bold uppercase">{log.mealType}</span>}
                                            </p>
                                            <div className="flex gap-2 text-xs text-slate-400">
                                                <span>{log.calories} kcal</span>
                                                <span className="text-slate-300">•</span>
                                                <span className="text-accentBlue font-bold">{log.protein}g protein</span>
                                            </div>
                                        </div>
                                        <button onClick={() => deleteLogItem(index)} className="p-2 text-slate-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
               </div>
           </div>
       </div>
    </div>
  );
};

export default MealsView;
