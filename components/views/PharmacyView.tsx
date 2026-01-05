
import React, { useState, useEffect } from 'react';
import Card from '../Card';
import { Icons } from '../Icons';
import { Medication, SkincareItem } from '../../types';
import { GoogleGenAI } from "@google/genai";

// --- CUSTOM ICONS ---
const SunIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
);

const MoonIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none" className={className}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
);

const CloudIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M17.5 19c0-1.7-1.3-3-3-3h-11c-1.7 0-3 1.3-3 3s1.3 3 3 3h11c1.7 0 3-1.3 3-3z"/><path d="M17.5 19c1.7 0 3-1.3 3-3 0-1.4-1-2.5-2.3-2.9C17.9 12.7 17.5 12.3 17 12c-.6-2.2-2.7-4-5-4-1.8 0-3.5 1-4.4 2.5C7.3 10.7 7.5 11 7.5 11c-.7.1-1.3.4-1.9.9C4.8 12.8 4.5 14 4.5 15.3c0 .3.1.5.1.7"/></svg>
);

const ShieldIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>
);

const AlertIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
);

const LockIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
  ),
  SyringeIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m18 2 4 4"/><path d="m17 7 3-3"/><path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5"/><path d="m9 11 4 4"/><path d="m5 19-3 3"/><path d="m14 4 6 6"/></svg>
  );

const PencilIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
  ),
  CheckIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12"/></svg>
  );

// --- INITIAL DATA ---
const INITIAL_MEDS: Medication[] = [
    {
        id: '1', name: 'Estrofem (Estradiol)', dose: '2mg', type: 'HRT', frequency: 'Daily', timeOfDay: 'Morning',
        instructions: 'Take with water', surgerySafe: true, lastTakenDate: '' // AI will likely flag this
    },
    {
        id: '2', name: 'Vitamin C', dose: '500mg', type: 'Supplement', frequency: 'Daily', timeOfDay: 'Morning',
        instructions: 'Boosts immunity', surgerySafe: true, lastTakenDate: ''
    },
    {
        id: '3', name: 'Hemarate FA', dose: '1 tab', type: 'Supplement', frequency: 'Daily', timeOfDay: 'Night',
        warningLabel: '⚠️ 2hr gap from Coffee', surgerySafe: true, lastTakenDate: ''
    },
    {
        id: '4', name: 'Androcur (Cyproterone)', dose: '25mg', type: 'HRT', frequency: 'Every Other Day', timeOfDay: 'Night',
        warningLabel: 'Hydrate well 💧', surgerySafe: true, lastTakenDate: ''
    }
];

const INITIAL_SKINCARE: SkincareItem[] = [
    { id: 's1', brand: 'Cosrx', name: 'Snail Mucin Essence', activeIngredient: 'Snail Secretion', timeOfDay: 'Morning', note: 'Apply on damp skin', lastUsedDate: '', frequency: 'Daily' },
    { id: 's2', brand: 'La Roche-Posay', name: 'Anthelios UV 400', activeIngredient: 'SPF 50+', timeOfDay: 'Morning', note: 'Last step!', lastUsedDate: '', frequency: 'Daily' },
    { id: 's5', brand: 'La Roche-Posay', name: 'Anthelios UV 400', activeIngredient: 'SPF 50+', timeOfDay: 'Midday', note: 'Re-apply for protection', lastUsedDate: '', frequency: 'Daily' },
    { id: 's3', brand: 'Kiehl\'s', name: 'Retinol Fast Release', activeIngredient: 'Retinol 0.3%', timeOfDay: 'Night', note: 'Pea sized amount', lastUsedDate: '', frequency: 'Specific Days', specificDays: ['Mon', 'Thu'] },
    { id: 's4', brand: 'CeraVe', name: 'PM Moisturizer', activeIngredient: 'Ceramides', timeOfDay: 'Night', note: 'Seal it in', lastUsedDate: '', frequency: 'Daily' }
];

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const PharmacyView: React.FC = () => {
    // --- STATE ---
    const [meds, setMeds] = useState<Medication[]>(INITIAL_MEDS);
    const [skincare, setSkincare] = useState<SkincareItem[]>(INITIAL_SKINCARE);
    const [surgeryMode, setSurgeryMode] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiNote, setAiNote] = useState<string>("");
    
    // UI State
    const [showSurgeryInputModal, setShowSurgeryInputModal] = useState(false);
    const [showSurgeryModal, setShowSurgeryModal] = useState(false);
    const [surgeryInputText, setSurgeryInputText] = useState('');
    
    // Edit States
    const [editingMed, setEditingMed] = useState<Medication | null>(null);
    const [editingSkincare, setEditingSkincare] = useState<SkincareItem | null>(null);
    
    // Add/Edit Form Fields
    const [isAdding, setIsAdding] = useState(false);
    const [addItemCategory, setAddItemCategory] = useState<'MED' | 'SKIN'>('MED');
    
    // Generic Fields
    const [newName, setNewName] = useState('');
    const [newNote, setNewNote] = useState(''); 
    const [newTime, setNewTime] = useState<'Morning'|'Midday'|'Night'>('Morning');
    
    // Med Specific
    const [newDose, setNewDose] = useState('');
    const [newType, setNewType] = useState<'HRT' | 'Supplement' | 'Pain' | 'Other'>('Supplement');
    const [newFreq, setNewFreq] = useState<'Daily'|'Every Other Day'|'As Needed'>('Daily');

    // Skincare Specific
    const [newBrand, setNewBrand] = useState('');
    const [newIngredient, setNewIngredient] = useState('');
    const [newSkinFreq, setNewSkinFreq] = useState<'Daily'|'Every Other Day'|'Specific Days'>('Daily');
    const [newSpecificDays, setNewSpecificDays] = useState<string[]>([]);

    // --- EFFECT: Load Data ---
    useEffect(() => {
        const savedMeds = localStorage.getItem('snatched_meds');
        const savedSkincare = localStorage.getItem('snatched_skincare');
        const savedMode = localStorage.getItem('snatched_surgery_mode');
        const savedNote = localStorage.getItem('snatched_surgery_note');
        
        if (savedMeds) setMeds(JSON.parse(savedMeds));
        if (savedSkincare) setSkincare(JSON.parse(savedSkincare));
        if (savedMode) setSurgeryMode(JSON.parse(savedMode));
        if (savedNote) setAiNote(savedNote);
    }, []);

    // --- EFFECT: Save Data ---
    useEffect(() => {
        localStorage.setItem('snatched_meds', JSON.stringify(meds));
        localStorage.setItem('snatched_skincare', JSON.stringify(skincare));
        localStorage.setItem('snatched_surgery_mode', JSON.stringify(surgeryMode));
        localStorage.setItem('snatched_surgery_note', aiNote);
    }, [meds, skincare, surgeryMode, aiNote]);

    const getTodayString = () => new Date().toISOString().split('T')[0];

    const isDueToday = (med: Medication) => {
        if (med.frequency === 'Daily') return true;
        if (med.frequency === 'Every Other Day') {
            if (!med.lastTakenDate) return true; 
            const lastKey = med.lastTakenDate.split('T')[0];
            const todayKey = getTodayString();
            if (lastKey === todayKey) return true;
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayKey = yesterday.toISOString().split('T')[0];
            if (lastKey === yesterdayKey) return false;
            return true;
        }
        return true;
    };

    const isTakenToday = (dateStr?: string) => {
        return dateStr?.startsWith(getTodayString());
    };

    const handleTakeMed = (id: string) => {
        setMeds(prev => prev.map(m => {
            if (m.id === id) {
                const now = new Date().toISOString();
                return { ...m, lastTakenDate: isTakenToday(m.lastTakenDate) ? '' : now };
            }
            return m;
        }));
    };

    const handleUseSkincare = (id: string) => {
        setSkincare(prev => prev.map(s => {
            if (s.id === id) {
                const now = new Date().toISOString();
                return { ...s, lastUsedDate: isTakenToday(s.lastUsedDate) ? '' : now };
            }
            return s;
        }));
    };

    const toggleSpecificDay = (day: string) => {
        if (newSpecificDays.includes(day)) {
            setNewSpecificDays(prev => prev.filter(d => d !== day));
        } else {
            setNewSpecificDays(prev => [...prev, day]);
        }
    };

    const resetForm = () => {
        setNewName(''); setNewDose(''); setNewNote(''); setNewBrand(''); setNewIngredient('');
        setNewType('Supplement'); setNewFreq('Daily'); setNewTime('Morning');
        setNewSkinFreq('Daily'); setNewSpecificDays([]);
    };

    const startEditingMed = (med: Medication) => {
        setEditingMed(med);
        setNewName(med.name);
        setNewDose(med.dose);
        setNewType(med.type);
        setNewFreq(med.frequency);
        setNewTime(med.timeOfDay);
        setNewNote(med.warningLabel || '');
        setEditingSkincare(null); 
    };

    const startEditingSkincare = (item: SkincareItem) => {
        setEditingSkincare(item);
        setNewName(item.name);
        setNewBrand(item.brand);
        setNewIngredient(item.activeIngredient || '');
        setNewNote(item.note || '');
        setNewTime(item.timeOfDay);
        setNewSkinFreq(item.frequency);
        setNewSpecificDays(item.specificDays || []);
        setEditingMed(null);
    };

    const handleAddItem = () => {
        if (!newName) return;

        if (addItemCategory === 'MED') {
            const newMed: Medication = {
                id: Date.now().toString(),
                name: newName,
                dose: newDose || '1 unit',
                type: newType,
                frequency: newFreq,
                timeOfDay: newTime,
                warningLabel: newNote,
                surgerySafe: true, 
                lastTakenDate: ''
            };
            setMeds([...meds, newMed]);
        } else {
            const newSkincare: SkincareItem = {
                id: Date.now().toString(),
                name: newName,
                brand: newBrand || 'Generic',
                activeIngredient: newIngredient,
                note: newNote,
                timeOfDay: newTime,
                lastUsedDate: '',
                frequency: newSkinFreq,
                specificDays: newSkinFreq === 'Specific Days' ? newSpecificDays : undefined
            };
            setSkincare([...skincare, newSkincare]);
        }
        
        setIsAdding(false); 
        resetForm();
    };

    const handleUpdateItem = () => {
        if (editingMed) {
            const updated: Medication = {
                ...editingMed,
                name: newName,
                dose: newDose,
                type: newType,
                frequency: newFreq,
                timeOfDay: newTime,
                warningLabel: newNote,
            };
            setMeds(prev => prev.map(m => m.id === editingMed.id ? updated : m));
            setEditingMed(null);
        } else if (editingSkincare) {
            const updated: SkincareItem = {
                ...editingSkincare,
                name: newName,
                brand: newBrand,
                activeIngredient: newIngredient,
                note: newNote,
                timeOfDay: newTime,
                frequency: newSkinFreq,
                specificDays: newSkinFreq === 'Specific Days' ? newSpecificDays : undefined
            };
            setSkincare(prev => prev.map(s => s.id === editingSkincare.id ? updated : s));
            setEditingSkincare(null);
        }
        resetForm();
    };

    // Consolidated Delete Handler - Immediate Action
    const handleDeleteItem = () => {
        if (editingMed) {
            setMeds(prev => prev.filter(m => m.id !== editingMed.id));
            setEditingMed(null);
        } else if (editingSkincare) {
            setSkincare(prev => prev.filter(s => s.id !== editingSkincare.id));
            setEditingSkincare(null);
        }
        resetForm();
    };

    // --- AI LOGIC ---
    const analyzeSurgerySafety = async () => {
        setIsAnalyzing(true);
        setShowSurgeryInputModal(false);
        try {
            const apiKey = localStorage.getItem('snatched_api_key') || process.env.API_KEY || "";
            if (!apiKey) throw new Error("No API Key");

            const ai = new GoogleGenAI({ apiKey });
            const medList = meds.map(m => `- ${m.name} (${m.dose})`).join('\n');
            const prompt = `
                I am a transwoman patient undergoing surgery soon (general anesthesia). 
                Patient's Specific Surgery & Doctor's Notes: "${surgeryInputText}"
                Review my current medication list:
                ${medList}
                Identify medications that are typically STOPPED 1-2 weeks before surgery due to bleeding risks (e.g. Vitamin E, Fish Oil, Aspirin) or blood clot risks (e.g. Estrogen/HRT interactions with anesthesia).
                Return a JSON object with:
                1. "unsafeIds": Array of strings containing the names of meds to pause (match names from list roughly).
                2. "summaryNote": A short, caring doctor's note (max 30 words) explaining what was paused and why based on the specific context.
                Example Output: { "unsafeIds": ["Estrofem", "Vitamin E"], "summaryNote": "Paused Estrogen due to clot risk for your specific procedure. Please confirm dates." }
            `;
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: [{ role: 'user', parts: [{ text: prompt }] }]
            });
            const cleanJson = response.text!.replace(/```json/g, '').replace(/```/g, '').trim();
            const result = JSON.parse(cleanJson) as { unsafeIds: string[]; summaryNote: string };
            const unsafeNames = new Set(result.unsafeIds.map((n) => n.toLowerCase()));
            const updatedMeds = meds.map(m => {
                const isUnsafe = Array.from(unsafeNames).some(unsafe => m.name.toLowerCase().includes(unsafe));
                return { ...m, surgerySafe: !isUnsafe };
            });
            setMeds(updatedMeds);
            setAiNote(result.summaryNote || "Medications updated based on general surgical guidelines.");
            setSurgeryMode(true); 
            setShowSurgeryModal(true); 
        } catch (error) {
            console.error("AI Error", error);
            setAiNote("Could not connect to AI. Please check your API Key settings.");
            setSurgeryMode(true);
            setShowSurgeryModal(true);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const allItems = [
        ...meds.filter(m => surgeryMode ? m.surgerySafe : true).map(m => ({ ...m, isMed: true, taken: isTakenToday(m.lastTakenDate) })),
        ...skincare.map(s => ({ ...s, isMed: false, taken: isTakenToday(s.lastUsedDate) }))
    ];
    
    const totalItemsCount = allItems.length;
    const completedItemsCount = allItems.filter(i => i.taken).length;
    const compliancePercentage = totalItemsCount > 0 ? (completedItemsCount / totalItemsCount) * 100 : 0;

    const renderMedZone = (zone: 'Morning' | 'Midday' | 'Night', title: string, icon: React.ReactNode, bgClass: string, iconContainerClass: string = 'bg-white/30 text-slate-700') => {
        const zoneMeds = meds.filter(m => m.timeOfDay === zone);
        const isNight = zone === 'Night';
        return (
            <div className={`rounded-[24px] p-5 ${bgClass} transition-all duration-500 flex flex-col h-full hover:scale-[1.01]`}>
                <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 backdrop-blur-sm rounded-full shadow-sm ${iconContainerClass}`}>{icon}</div>
                    <h3 className={`font-serif font-bold text-lg ${isNight ? 'text-white' : 'text-slate-800'}`}>{title}</h3>
                </div>
                <div className="space-y-2 flex-1">
                    {zoneMeds.length === 0 ? <p className={`text-sm italic opacity-60 ${isNight ? 'text-slate-300' : 'text-slate-800'}`}>Nothing scheduled.</p> : zoneMeds.map(med => {
                        const taken = isTakenToday(med.lastTakenDate);
                        const due = isDueToday(med);
                        const locked = surgeryMode && !med.surgerySafe;
                        return (
                            <div key={med.id} className={`relative overflow-hidden rounded-xl p-3 flex items-center gap-3 transition-all duration-300 border group animate-slide-up ${locked ? 'bg-slate-100 border-slate-200 opacity-80' : taken ? 'bg-white/40 border-transparent shadow-none' : 'bg-white border-white/50 shadow-sm hover:shadow-md hover:-translate-y-0.5'}`}>
                                <div onClick={() => !locked && due && handleTakeMed(med.id)} className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all cursor-pointer ${locked ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : taken ? 'bg-emerald-100 text-emerald-600' : !due ? 'bg-slate-100 text-slate-300 cursor-default' : 'bg-slate-50 hover:bg-emerald-50 text-slate-300 hover:text-emerald-400 border-2 border-dashed border-slate-200 hover:border-emerald-200'}`}>
                                    {locked ? <LockIcon className="w-3.5 h-3.5" /> : taken ? <CheckIcon className="w-4 h-4" /> : !due ? <span className="text-[9px] font-bold uppercase">Rest</span> : <div className="w-2.5 h-2.5 rounded-full bg-current opacity-20"></div>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start"><h4 className={`font-bold text-sm leading-tight truncate pr-2 ${taken ? 'text-slate-500' : locked ? 'text-slate-400 line-through decoration-red-500 decoration-2' : 'text-slate-800'}`}>{med.name}</h4></div>
                                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                        <span className="text-[9px] font-bold text-slate-400">{med.dose}</span>
                                        {locked && <span className="text-[9px] font-bold text-red-500 bg-red-50 px-1.5 rounded uppercase">Paused</span>}
                                        {med.warningLabel && !locked && <span className="flex items-center gap-1 text-[9px] font-bold bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded border border-amber-100 truncate max-w-full">{med.warningLabel}</span>}
                                        {med.type === 'HRT' && <span className="flex items-center gap-0.5 text-[9px] font-bold text-pink-500 bg-pink-50 px-1.5 py-0.5 rounded-md"><SyringeIcon className="w-3 h-3"/> HRT</span>}
                                    </div>
                                </div>
                                <button onClick={() => startEditingMed(med)} className="absolute top-2 right-2 p-1.5 text-slate-300 hover:text-accentBlue hover:bg-blue-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"><PencilIcon className="w-3.5 h-3.5" /></button>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderSkincareZone = (zone: 'Morning' | 'Midday' | 'Night', title: string, icon: React.ReactNode, bgClass: string, iconContainerClass: string, titleClass: string) => {
        const items = skincare.filter(s => s.timeOfDay === zone);
        const isNight = zone === 'Night';
        const isMidday = zone === 'Midday';
        
        return (
             <div className={`rounded-[24px] p-6 flex flex-col h-full relative overflow-hidden group/zone transition-all hover:scale-[1.01] ${bgClass}`}>
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover/zone:opacity-10 transition-opacity">
                    {zone === 'Morning' ? <SunIcon className="w-32 h-32 text-orange-200" /> : isMidday ? <CloudIcon className="w-32 h-32 text-sky-200" /> : <Icons.Sparkles className="w-32 h-32 text-purple-200" />}
                </div>
                
                <div className="flex items-center gap-3 mb-4 relative z-10">
                    <div className={`p-2 rounded-xl ${iconContainerClass}`}>{icon}</div>
                    <div>
                         <h3 className={`font-serif font-bold text-lg leading-none mb-1 ${titleClass}`}>{title}</h3>
                         <p className={`text-[10px] font-bold uppercase tracking-widest text-slate-400 opacity-80`}>{items.length} Steps</p>
                    </div>
                </div>

                <div className="space-y-2 relative z-10 flex-1">
                    {items.length === 0 ? <p className={`text-sm italic opacity-60 ${isNight ? 'text-slate-400' : 'text-slate-800'}`}>No rituals added.</p> : items.map(item => {
                        const used = isTakenToday(item.lastUsedDate);
                        
                        let scheduleBadge = null;
                        if (item.frequency === 'Every Other Day') {
                            scheduleBadge = <span className="ml-auto text-[8px] font-bold bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded uppercase">Every Other Day</span>;
                        } else if (item.frequency === 'Specific Days' && item.specificDays) {
                            scheduleBadge = (
                                <div className="ml-auto flex gap-0.5">
                                    {item.specificDays.map(d => (
                                        <span key={d} className="text-[8px] font-bold bg-slate-100 text-slate-400 px-1 py-0.5 rounded">{d}</span>
                                    ))}
                                </div>
                            );
                        }

                        const itemContainerClass = isNight
                            ? (used ? 'bg-white/10 border-white/5' : 'bg-white/95 border-transparent hover:shadow-subtle')
                            : (used ? 'bg-white/40 border-slate-100' : 'bg-white border-white/60 hover:shadow-subtle');

                        const itemTitleClass = isNight && !used ? 'text-slate-800' : used ? 'text-slate-400 line-through' : 'text-slate-800';

                        return (
                             <div key={item.id} className={`flex items-start gap-3 p-3 rounded-xl border transition-all group cursor-pointer animate-slide-up ${itemContainerClass}`} onClick={() => handleUseSkincare(item.id)}>
                                 <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${used ? 'bg-pink-100 border-pink-100 text-accentPink' : 'bg-white border-slate-200 text-white'}`}>
                                     {used && <CheckIcon className="w-3.5 h-3.5" />}
                                 </div>
                                 <div className="flex-1 min-w-0">
                                     <div className="flex items-center justify-between">
                                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{item.brand}</p>
                                         {scheduleBadge}
                                     </div>
                                     <h4 className={`font-bold text-sm leading-tight ${itemTitleClass}`}>{item.name}</h4>
                                     <div className="flex flex-wrap gap-2 mt-1.5">
                                         {item.activeIngredient && <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-bold border border-blue-100 truncate max-w-full">{item.activeIngredient}</span>}
                                         {item.note && <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-medium truncate max-w-full">{item.note}</span>}
                                     </div>
                                 </div>
                                 <button onClick={(e) => { e.stopPropagation(); startEditingSkincare(item); }} className="p-1.5 text-slate-300 hover:text-accentPink rounded-lg opacity-0 group-hover:opacity-100 transition-all"><PencilIcon className="w-3.5 h-3.5" /></button>
                             </div>
                        );
                    })}
                </div>
             </div>
        );
    };

    return (
        <div className="space-y-4 animate-fade-in pb-24">
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

           {/* SURGERY INPUT MODAL */}
           {showSurgeryInputModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-md p-6 animate-modal-in">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-red-50 rounded-full text-red-500"><AlertIcon className="w-6 h-6" /></div>
                            <h3 className="font-serif font-bold text-xl text-slate-800">Surgery Prep Mode</h3>
                        </div>
                        <p className="text-sm text-slate-600 mb-4">
                            Going under anesthesia? Paste your doctor's instructions or surgery type below. I'll flag medications you usually need to stop (like blood thinners or HRT).
                        </p>
                        <textarea 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-100 outline-none min-h-[100px] mb-4"
                            placeholder="e.g. FFS Surgery on Oct 20th, General Anesthesia. Stop supplements 2 weeks prior..."
                            value={surgeryInputText}
                            onChange={(e) => setSurgeryInputText(e.target.value)}
                        />
                        <div className="flex gap-3">
                            <button onClick={() => setShowSurgeryInputModal(false)} className="flex-1 py-3 text-slate-500 font-bold text-sm hover:bg-slate-50 rounded-xl">Cancel</button>
                            <button 
                                onClick={analyzeSurgerySafety} 
                                disabled={isAnalyzing || !surgeryInputText}
                                className="flex-1 py-3 bg-red-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-red-200 hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                            >
                                {isAnalyzing ? <Icons.Sparkles className="w-4 h-4 animate-spin" /> : 'Analyze Safety'}
                            </button>
                        </div>
                    </div>
                </div>
           )}

           {/* SURGERY RESULT/TOGGLE MODAL */}
           {showSurgeryModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden animate-modal-in">
                        <div className="p-6 bg-red-50 border-b border-red-100">
                             <div className="flex justify-between items-start">
                                 <div className="flex items-center gap-2 text-red-600 mb-2">
                                     <ShieldIcon className="w-5 h-5" />
                                     <span className="font-bold uppercase text-xs tracking-wider">Safety Report</span>
                                 </div>
                                 <button onClick={() => setShowSurgeryModal(false)} className="text-red-300 hover:text-red-500"><Icons.Plus className="w-5 h-5 rotate-45" /></button>
                             </div>
                             <p className="font-serif font-bold text-xl text-slate-800 mb-2">Medication Protocol</p>
                             <div className="bg-white/60 p-3 rounded-xl border border-red-100/50">
                                 <p className="text-sm text-slate-700 italic leading-relaxed">"{aiNote}"</p>
                             </div>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <p className="font-bold text-slate-800">Surgery Mode</p>
                                    <p className="text-xs text-slate-400">Pauses unsafe meds</p>
                                </div>
                                <button 
                                    onClick={() => setSurgeryMode(!surgeryMode)} 
                                    className={`w-12 h-7 rounded-full transition-colors relative ${surgeryMode ? 'bg-red-500' : 'bg-slate-200'}`}
                                >
                                    <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${surgeryMode ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                </button>
                            </div>
                            <button onClick={() => setShowSurgeryModal(false)} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm">Understood</button>
                        </div>
                    </div>
                </div>
           )}

           {/* ADD ITEM MODAL */}
           {isAdding && (
               <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-4 animate-fade-in">
                   <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-md p-6 animate-modal-in">
                       <h3 className="font-serif font-bold text-xl text-slate-800 mb-6">Add to Apothecary</h3>
                       
                       <div className="flex bg-slate-50 p-1 rounded-xl mb-4">
                           <button onClick={() => setAddItemCategory('MED')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${addItemCategory === 'MED' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400'}`}>Medication</button>
                           <button onClick={() => setAddItemCategory('SKIN')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${addItemCategory === 'SKIN' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400'}`}>Skincare</button>
                       </div>

                       <div className="space-y-3">
                           <input type="text" placeholder="Name (e.g. Estrofem)" value={newName} onChange={e => setNewName(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none text-sm focus:ring-2 focus:ring-pink-100 outline-none" />
                           
                           {addItemCategory === 'MED' ? (
                               <>
                                   <div className="flex gap-3">
                                       <input type="text" placeholder="Dose (e.g. 2mg)" value={newDose} onChange={e => setNewDose(e.target.value)} className="flex-1 px-4 py-3 rounded-xl bg-slate-50 border-none text-sm focus:ring-2 focus:ring-pink-100 outline-none" />
                                       <select value={newType} onChange={(e: any) => setNewType(e.target.value)} className="flex-1 px-4 py-3 rounded-xl bg-slate-50 border-none text-sm focus:ring-2 focus:ring-pink-100 outline-none">
                                           <option value="Supplement">Supplement</option>
                                           <option value="HRT">HRT</option>
                                           <option value="Pain">Pain</option>
                                           <option value="Other">Other</option>
                                       </select>
                                   </div>
                                   <div className="flex gap-3">
                                        <select value={newFreq} onChange={(e: any) => setNewFreq(e.target.value)} className="flex-1 px-4 py-3 rounded-xl bg-slate-50 border-none text-sm focus:ring-2 focus:ring-pink-100 outline-none">
                                            <option value="Daily">Daily</option>
                                            <option value="Every Other Day">Every Other Day</option>
                                            <option value="As Needed">As Needed</option>
                                        </select>
                                        <select value={newTime} onChange={(e: any) => setNewTime(e.target.value)} className="flex-1 px-4 py-3 rounded-xl bg-slate-50 border-none text-sm focus:ring-2 focus:ring-pink-100 outline-none">
                                           <option value="Morning">Morning</option>
                                           <option value="Midday">Midday</option>
                                           <option value="Night">Night</option>
                                       </select>
                                   </div>
                                   <input type="text" placeholder="Warning/Note (Optional)" value={newNote} onChange={e => setNewNote(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none text-sm focus:ring-2 focus:ring-pink-100 outline-none" />
                               </>
                           ) : (
                               <>
                                   <div className="flex gap-3">
                                       <input type="text" placeholder="Brand (e.g. Cosrx)" value={newBrand} onChange={e => setNewBrand(e.target.value)} className="flex-1 px-4 py-3 rounded-xl bg-slate-50 border-none text-sm focus:ring-2 focus:ring-pink-100 outline-none" />
                                       <select value={newTime} onChange={(e: any) => setNewTime(e.target.value)} className="flex-1 px-4 py-3 rounded-xl bg-slate-50 border-none text-sm focus:ring-2 focus:ring-pink-100 outline-none">
                                           <option value="Morning">Morning</option>
                                           <option value="Midday">Midday</option>
                                           <option value="Night">Night</option>
                                       </select>
                                   </div>
                                   <input type="text" placeholder="Active Ingredient (Optional)" value={newIngredient} onChange={e => setNewIngredient(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none text-sm focus:ring-2 focus:ring-pink-100 outline-none" />
                                   
                                   <select value={newSkinFreq} onChange={(e: any) => setNewSkinFreq(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none text-sm focus:ring-2 focus:ring-pink-100 outline-none">
                                       <option value="Daily">Daily</option>
                                       <option value="Every Other Day">Every Other Day</option>
                                       <option value="Specific Days">Specific Days</option>
                                   </select>
                                   {newSkinFreq === 'Specific Days' && (
                                       <div className="flex gap-2 flex-wrap justify-center py-2">
                                           {WEEK_DAYS.map(day => (
                                               <button key={day} onClick={() => toggleSpecificDay(day)} className={`w-8 h-8 rounded-full text-[10px] font-bold transition-all ${newSpecificDays.includes(day) ? 'bg-accentPink text-white' : 'bg-slate-100 text-slate-400'}`}>{day.slice(0,1)}</button>
                                           ))}
                                       </div>
                                   )}
                                   <input type="text" placeholder="Step Note (e.g. Apply damp)" value={newNote} onChange={e => setNewNote(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none text-sm focus:ring-2 focus:ring-pink-100 outline-none" />
                               </>
                           )}
                       </div>

                       <div className="flex gap-3 mt-6">
                           <button onClick={() => { setIsAdding(false); resetForm(); }} className="flex-1 py-3 text-slate-500 font-bold text-sm hover:bg-slate-50 rounded-xl">Cancel</button>
                           <button onClick={handleAddItem} className="flex-1 py-3 bg-slate-900 text-white font-bold text-sm rounded-xl shadow-lg hover:bg-slate-800">Save Item</button>
                       </div>
                   </div>
               </div>
           )}

           {(editingMed || editingSkincare) && (
               <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-4 animate-fade-in">
                   <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-md p-6 animate-modal-in">
                       <h3 className="font-serif font-bold text-xl text-slate-800 mb-6">Manage Item</h3>
                       
                       <div className="space-y-3">
                           <input type="text" placeholder="Name" value={newName} onChange={e => setNewName(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none text-sm focus:ring-2 focus:ring-pink-100 outline-none" />
                           
                           {editingMed ? (
                               <>
                                   <div className="flex gap-3">
                                       <input type="text" placeholder="Dose" value={newDose} onChange={e => setNewDose(e.target.value)} className="flex-1 px-4 py-3 rounded-xl bg-slate-50 border-none text-sm focus:ring-2 focus:ring-pink-100 outline-none" />
                                       <select value={newType} onChange={(e: any) => setNewType(e.target.value)} className="flex-1 px-4 py-3 rounded-xl bg-slate-50 border-none text-sm focus:ring-2 focus:ring-pink-100 outline-none">
                                           <option value="Supplement">Supplement</option>
                                           <option value="HRT">HRT</option>
                                           <option value="Pain">Pain</option>
                                           <option value="Other">Other</option>
                                       </select>
                                   </div>
                                   <div className="flex gap-3">
                                        <select value={newFreq} onChange={(e: any) => setNewFreq(e.target.value)} className="flex-1 px-4 py-3 rounded-xl bg-slate-50 border-none text-sm focus:ring-2 focus:ring-pink-100 outline-none">
                                            <option value="Daily">Daily</option>
                                            <option value="Every Other Day">Every Other Day</option>
                                            <option value="As Needed">As Needed</option>
                                        </select>
                                        <select value={newTime} onChange={(e: any) => setNewTime(e.target.value)} className="flex-1 px-4 py-3 rounded-xl bg-slate-50 border-none text-sm focus:ring-2 focus:ring-pink-100 outline-none">
                                           <option value="Morning">Morning</option>
                                           <option value="Midday">Midday</option>
                                           <option value="Night">Night</option>
                                       </select>
                                   </div>
                                   <input type="text" placeholder="Warning/Note" value={newNote} onChange={e => setNewNote(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none text-sm focus:ring-2 focus:ring-pink-100 outline-none" />
                               </>
                           ) : (
                               <>
                                   <div className="flex gap-3">
                                       <input type="text" placeholder="Brand" value={newBrand} onChange={e => setNewBrand(e.target.value)} className="flex-1 px-4 py-3 rounded-xl bg-slate-50 border-none text-sm focus:ring-2 focus:ring-pink-100 outline-none" />
                                       <select value={newTime} onChange={(e: any) => setNewTime(e.target.value)} className="flex-1 px-4 py-3 rounded-xl bg-slate-50 border-none text-sm focus:ring-2 focus:ring-pink-100 outline-none">
                                           <option value="Morning">Morning</option>
                                           <option value="Midday">Midday</option>
                                           <option value="Night">Night</option>
                                       </select>
                                   </div>
                                   <input type="text" placeholder="Active Ingredient" value={newIngredient} onChange={e => setNewIngredient(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none text-sm focus:ring-2 focus:ring-pink-100 outline-none" />
                                   
                                   <select value={newSkinFreq} onChange={(e: any) => setNewSkinFreq(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none text-sm focus:ring-2 focus:ring-pink-100 outline-none">
                                       <option value="Daily">Daily</option>
                                       <option value="Every Other Day">Every Other Day</option>
                                       <option value="Specific Days">Specific Days</option>
                                   </select>
                                   {newSkinFreq === 'Specific Days' && (
                                       <div className="flex gap-2 flex-wrap justify-center py-2">
                                           {WEEK_DAYS.map(day => (
                                               <button key={day} onClick={() => toggleSpecificDay(day)} className={`w-8 h-8 rounded-full text-[10px] font-bold transition-all ${newSpecificDays.includes(day) ? 'bg-accentPink text-white' : 'bg-slate-100 text-slate-400'}`}>{day.slice(0,1)}</button>
                                           ))}
                                       </div>
                                   )}
                                   <input type="text" placeholder="Step Note" value={newNote} onChange={e => setNewNote(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none text-sm focus:ring-2 focus:ring-pink-100 outline-none" />
                               </>
                           )}
                       </div>

                       <div className="flex flex-col gap-3 mt-6">
                           <button onClick={handleUpdateItem} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800">Save Changes</button>
                           <button onClick={handleDeleteItem} className="w-full py-3 bg-red-50 text-red-500 rounded-xl font-bold text-sm hover:bg-red-100">Delete Item</button>
                           <button onClick={() => { setEditingMed(null); setEditingSkincare(null); resetForm(); }} className="text-slate-400 text-sm font-bold py-2">Cancel</button>
                       </div>
                   </div>
               </div>
           )}


           {/* HEADER AREA */}
           <div className="flex flex-col md:flex-row justify-between items-end border-b border-slate-100 pb-6 gap-4">
              <div>
                <h2 className="text-3xl font-serif text-slateText mb-2">Apothecary</h2>
                <p className="text-slate-500">Managing your rituals and prescriptions.</p>
              </div>
              <div className="flex items-center gap-3">
                  {/* MINI COMPLIANCE TRACKER */}
                  {totalItemsCount > 0 && (
                      <div className="hidden sm:flex flex-col items-end mr-2">
                           <div className="flex items-center gap-2 mb-1">
                               <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Daily Compliance</span>
                               <span className="text-xs font-bold text-emerald-600">{completedItemsCount}/{totalItemsCount}</span>
                           </div>
                           <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                               <div style={{ width: `${compliancePercentage}%` }} className="h-full bg-emerald-500 rounded-full transition-all duration-700"></div>
                           </div>
                      </div>
                  )}

                  <button 
                    onClick={() => setShowSurgeryInputModal(true)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${surgeryMode ? 'bg-red-50 border-red-200 text-red-500 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:border-red-200 hover:text-red-400'}`}
                  >
                      {surgeryMode ? 'Surgery Mode Active' : 'Surgery Prep?'}
                  </button>
                  <button 
                    onClick={() => setIsAdding(true)}
                    className="px-4 py-2 bg-accentPink text-white rounded-xl text-xs font-bold shadow-md hover:bg-pink-500 transition-all flex items-center gap-2"
                  >
                      <Icons.Plus className="w-4 h-4" /> Add Item
                  </button>
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
               
               {/* LEFT COL: MORNING ROUTINE (Yellow Theme) */}
               <div className="lg:col-span-4 flex flex-col gap-6">
                   <div className="flex-1">
                       {renderMedZone('Morning', 'Morning Meds', <SunIcon className="w-5 h-5" />, 'bg-orange-50 border border-orange-100', 'bg-white text-orange-400')}
                   </div>
                   <div className="flex-1">
                       {renderSkincareZone('Morning', 'Morning Ritual', <SunIcon className="w-5 h-5 text-orange-400" />, 'bg-orange-50 border border-orange-100', 'bg-white text-orange-400', 'text-slate-800')}
                   </div>
               </div>

               {/* MID COL: DAY MEDS & MIDDAY RITUAL (Blue Theme) */}
               <div className="lg:col-span-4 flex flex-col gap-6">
                   <div>
                        {renderMedZone('Midday', 'Midday Boost', <CloudIcon className="w-5 h-5" />, 'bg-sky-50 border border-sky-100', 'bg-white text-sky-400')}
                   </div>
                   
                   {/* Midday Ritual (Flex-1 to fill space) */}
                   <div className="flex-1">
                        {renderSkincareZone('Midday', 'Midday Ritual', <CloudIcon className="w-5 h-5 text-sky-400" />, 'bg-sky-50 border border-sky-100', 'bg-white text-sky-400', 'text-slate-800')}
                   </div>
               </div>

               {/* RIGHT COL: NIGHT ROUTINE (Indigo Theme) */}
               <div className="lg:col-span-4 flex flex-col gap-6">
                   <div className="flex-1">
                        {renderMedZone('Night', 'Night Meds', <MoonIcon className="w-5 h-5" />, 'bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-800 border border-indigo-800 shadow-xl', 'bg-white/10 text-indigo-200')}
                   </div>
                   <div className="flex-1">
                        {renderSkincareZone('Night', 'Night Ritual', <MoonIcon className="w-5 h-5 text-purple-200" />, 'bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-800 border border-indigo-800 shadow-xl', 'bg-slate-700 text-white border border-white/10', 'text-white')}
                   </div>
               </div>

           </div>
        </div>
    );
};

export default PharmacyView;
