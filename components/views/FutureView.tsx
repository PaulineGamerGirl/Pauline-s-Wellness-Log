import React from 'react';
import Card from '../Card';
import { Icons } from '../Icons';

const FutureView: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center md:text-left border-b border-slate-100 pb-6">
        <h2 className="text-3xl font-serif text-slateText mb-2">Vision Board</h2>
        <p className="text-slate-500">Curate your aspirations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Main Visual */}
          <div className="md:col-span-8 relative h-80 rounded-[24px] overflow-hidden group shadow-lg">
            <img 
                src="https://picsum.photos/1200/800" 
                alt="Vision Board" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
            <div className="absolute bottom-0 left-0 p-8">
                <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-slate-800 uppercase tracking-widest mb-2 inline-block">2025 Goal</span>
                <h3 className="text-white font-serif text-4xl font-bold tracking-tight drop-shadow-md">Parisian Lifestyle</h3>
            </div>
          </div>

          {/* Goals List */}
          <div className="md:col-span-4 flex flex-col gap-6">
              <Card className="flex-1" title="Active Goals">
                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                             <p className="text-sm font-bold text-slate-700">Read 3 Classics</p>
                             <span className="text-xs font-bold text-accentBlue bg-blue-50 px-2 py-1 rounded-md">33%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div className="bg-accentBlue h-full w-1/3 rounded-full"></div>
                        </div>
                    </div>
                    <div>
                         <div className="flex justify-between items-center mb-2">
                             <p className="text-sm font-bold text-slate-700">Travel Fund</p>
                             <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">$2.4k</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div className="bg-emerald-500 h-full w-3/4 rounded-full"></div>
                        </div>
                    </div>
                    <button className="w-full py-2 border border-dashed border-slate-300 rounded-xl text-slate-400 text-sm font-bold hover:border-accentBlue hover:text-accentBlue transition-colors">
                        + Add Goal
                    </button>
                </div>
              </Card>
          </div>

          {/* Categories */}
          <div className="md:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
                { label: 'Travel', count: '3 Pins' }, 
                { label: 'Style', count: '12 Pins' }, 
                { label: 'Career', count: '5 Pins' }, 
                { label: 'Home', count: '8 Pins' }
            ].map((item) => (
                  <div key={item.label} className="bg-white p-6 rounded-[24px] border border-slate-100 hover:shadow-float hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
                      <div className="flex items-start justify-between mb-4">
                          <div className="w-10 h-10 rounded-full bg-slate-50 group-hover:bg-accentBlue group-hover:text-white transition-colors flex items-center justify-center text-slate-400">
                             <Icons.Sparkles className="w-5 h-5" />
                          </div>
                          <Icons.ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-accentBlue transition-colors" />
                      </div>
                      <p className="font-serif font-bold text-slate-700 text-lg">{item.label}</p>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">{item.count}</p>
                  </div>
            ))}
          </div>
      </div>
    </div>
  );
};

export default FutureView;