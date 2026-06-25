import { motion } from 'motion/react';
import { ArrowRight, Globe2, ShieldCheck, Clock } from 'lucide-react';

export default function Hero() {
  const scrollToForm = () => {
    document.getElementById('apply-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-[#080a0f]">
      {/* Background decoration */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-5%] left-[-5%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Text Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 font-bold text-[10px] uppercase tracking-widest mb-6">
              <span className="w-2 h-2 bg-brand-500 rounded-full"></span>
              <span>Multinational Healthcare Network</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-serif font-light text-white leading-tight mb-6">
              Advance Your Nursing Career, <br/>
              <span className="italic font-normal text-white">Across Borders.</span>
            </h1>
            
            <p className="text-lg text-slate-400 mb-8 leading-relaxed max-w-lg">
              We are actively hiring qualified nurses for premier medical facilities worldwide. Upload your CV and PNC License for an immediate interview schedule.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <button 
                onClick={scrollToForm}
                className="inline-flex justify-center items-center gap-2 bg-brand-500 hover:bg-brand-400 text-slate-900 px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-brand-500/20 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Schedule Interview <ArrowRight size={20} />
              </button>
            </div>
            
            <div className="flex items-center gap-6 font-medium text-slate-500 uppercase tracking-widest text-[10px]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-brand-400" size={16} />
                <span>Verified Sponsor</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="text-brand-400" size={16} />
                <span>Immediate Hiring</span>
              </div>
            </div>
          </motion.div>
          
          {/* Animated Images Container */}
          <div className="relative h-[400px] sm:h-[500px] lg:h-[600px] w-full">
            {/* Main Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="absolute top-0 right-0 w-4/5 h-4/5 rounded-3xl overflow-hidden shadow-2xl border border-white/10 z-10"
            >
              <div className="absolute inset-0 bg-brand-500/10 mix-blend-overlay z-10"></div>
              <motion.img 
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                src="https://images.unsplash.com/photo-1584432810601-6c7f27d2362b?auto=format&fit=crop&q=80&w=800" 
                alt="Professional Nurse" 
                className="w-full h-full object-cover grayscale opacity-80 contrast-125"
              />
            </motion.div>
            
            {/* Secondary Floating Image */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ 
                opacity: 1, 
                x: 0,
                y: [0, -15, 0] 
              }}
              transition={{ 
                opacity: { duration: 0.8, delay: 0.3 },
                x: { duration: 0.8, delay: 0.3 },
                y: { duration: 6, repeat: Infinity, ease: "easeInOut" }
              }}
              className="absolute bottom-0 left-0 w-3/5 h-3/5 rounded-3xl overflow-hidden shadow-xl border border-white/10 z-20"
            >
              <div className="absolute inset-0 bg-blue-500/20 mix-blend-overlay z-10"></div>
              <img 
                src="https://images.unsplash.com/photo-1576091160550-2173ff9e5eb3?auto=format&fit=crop&q=80&w=600" 
                alt="Patient Care" 
                className="w-full h-full object-cover grayscale opacity-80 contrast-125"
              />
            </motion.div>
            
            {/* Floating Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1, y: [0, 10, 0] }}
              transition={{ 
                scale: { duration: 0.5, delay: 0.6 },
                opacity: { duration: 0.5, delay: 0.6 },
                y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }
              }}
              className="absolute top-1/4 -left-6 bg-white/[0.03] backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl z-30 flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-brand-500/20 rounded-full flex items-center justify-center text-brand-400">
                <ShieldCheck size={24} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Placement Rate</p>
                <p className="text-xl font-serif text-white">98.5%</p>
              </div>
            </motion.div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
