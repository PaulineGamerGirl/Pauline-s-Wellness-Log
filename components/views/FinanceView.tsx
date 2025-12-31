import React from 'react';
import Card from '../Card';
import { Icons } from '../Icons';

const FinanceView: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] animate-fade-in space-y-6 text-center">
      <div className="w-20 h-20 rounded-full bg-pink-50 flex items-center justify-center mb-2 shadow-inner border border-pink-100">
          <Icons.Wallet className="w-10 h-10 text-accentPink" />
      </div>
      
      <div className="max-w-md space-y-2">
          <h2 className="text-3xl font-serif text-slateText">Finance Manager</h2>
          <p className="text-slate-500 text-lg">
             New Feature Soon to be Added!
          </p>
      </div>

      <Card className="bg-slate-50 border-dashed border-slate-200 mt-8 max-w-sm transform rotate-1 hover:rotate-0 transition-transform duration-300">
           <p className="text-sm text-slate-400 italic">
               "Manifesting the job, then the money. 💅✨"
           </p>
      </Card>
    </div>
  );
};

export default FinanceView;