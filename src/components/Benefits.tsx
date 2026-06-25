import { motion } from 'motion/react';
import { PlaneTakeoff, HeartHandshake, GraduationCap, Building2 } from 'lucide-react';

const benefits = [
  {
    icon: <PlaneTakeoff className="w-6 h-6 text-brand-400" />,
    title: "Relocation Support",
    description: "Full assistance with flights, initial housing, and visa processing for you and your family."
  },
  {
    icon: <Building2 className="w-6 h-6 text-brand-400" />,
    title: "Top-Tier Facilities",
    description: "Work in JCI-accredited multinational hospitals with state-of-the-art medical technology."
  },
  {
    icon: <HeartHandshake className="w-6 h-6 text-brand-400" />,
    title: "Premium Benefits",
    description: "Comprehensive health coverage, life insurance, and generous paid time off from day one."
  },
  {
    icon: <GraduationCap className="w-6 h-6 text-brand-400" />,
    title: "Career Growth",
    description: "Continuous professional development, specialist training, and clear promotion pathways."
  }
];

export default function Benefits() {
  return (
    <section id="benefits" className="py-24 bg-[#080a0f] relative overflow-hidden border-t border-white/5">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full mb-6"
          >
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Why Choose Our Network</span>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-serif text-white mb-6"
          >
            Elevate Your Practice
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-400"
          >
            We partner with the world's leading healthcare providers to offer compensation and benefits packages that match your dedication.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-white/[0.05] border border-white/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-serif text-white mb-3">{benefit.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
