import { HeartPulse, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const scrollToForm = () => {
    const form = document.getElementById('apply-form');
    if (form) {
      form.scrollIntoView({ behavior: 'smooth' });
      setIsOpen(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#080a0f]/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20 lg:h-24">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3 cursor-pointer min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-brand-500 rounded-xl flex items-center justify-center text-slate-900 shrink-0">
              <HeartPulse size={20} className="sm:size-6" />
            </div>
            <span className="font-bold text-base sm:text-xl tracking-tight text-white truncate">
              GlobalCare<span className="text-brand-400">Recruit</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium uppercase tracking-widest text-slate-400">
            <a href="#about" className="hover:text-brand-400 transition-colors">Why Join Us</a>
            <a href="#benefits" className="hover:text-brand-400 transition-colors">Benefits</a>
            <button 
              onClick={scrollToForm}
              className="text-brand-400 border-b border-brand-400 pb-1 hover:text-brand-300 hover:border-brand-300 transition-colors"
            >
              Apply Now
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-400 hover:text-white focus:outline-none"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden bg-[#080a0f] border-t border-white/5 px-4 pt-4 pb-8 shadow-xl">
          <div className="flex flex-col space-y-1 text-sm font-medium uppercase tracking-widest text-slate-400">
            <a href="#about" onClick={() => setIsOpen(false)} className="block hover:text-brand-400 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors">Why Join Us</a>
            <a href="#benefits" onClick={() => setIsOpen(false)} className="block hover:text-brand-400 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors">Benefits</a>
            <button 
              onClick={scrollToForm}
              className="block text-left text-brand-400 px-4 py-3 rounded-xl hover:bg-white/5 hover:text-brand-300 transition-colors w-full"
            >
              Apply Now
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
