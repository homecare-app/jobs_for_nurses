import { HeartPulse } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#080a0f] border-t border-white/5 py-12 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 sm:gap-8">
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-slate-900">
              <HeartPulse size={16} />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">
              GlobalCare<span className="text-brand-400">Recruit</span>
            </span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 md:gap-12 text-[10px] text-slate-500 uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <span className="text-brand-400">●</span> LONDON HEADQUARTERS
            </div>
            <div className="flex items-center gap-2">
              <span className="text-brand-400">●</span> DUBAI HUB
            </div>
            <div className="flex items-center gap-2">
              <span className="text-brand-400">●</span> SINGAPORE CAMPUS
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <div className="flex gap-4">
              <a href="#" className="text-[10px] text-slate-500 uppercase tracking-widest hover:text-brand-400 transition-colors">Privacy</a>
              <a href="#" className="text-[10px] text-slate-500 uppercase tracking-widest hover:text-brand-400 transition-colors">Terms</a>
            </div>
            <span className="text-[10px] text-slate-600 uppercase tracking-widest">
              © {new Date().getFullYear()} GLOBALCARE RECRUITMENT INC.
            </span>
          </div>

        </div>
      </div>
    </footer>
  );
}
