import { useState } from 'react';
import { motion } from 'motion/react';
import { UploadCloud, CheckCircle2, FileText, BadgeCheck } from 'lucide-react';

export default function ApplicationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [cvName, setCvName] = useState<string | null>(null);
  const [licenseName, setLicenseName] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    try {
      const response = await fetch('/api/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.get('fullName'),
          phone: formData.get('phone'),
          email: formData.get('email'),
          licenseNumber: formData.get('licenseNumber')
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit application');
      }

      setIsSuccess(true);
      form.reset();
      setCvName(null);
      setLicenseName(null);
    } catch (error) {
      console.error('Submission error:', error);
      alert('There was an error submitting your application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="apply-form" className="py-24 bg-[#080a0f] text-slate-300 relative overflow-hidden border-t border-white/5">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Text Left Side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-serif font-light text-white mb-6 leading-tight">
              Fast-Track Your <br/><span className="text-brand-400 italic font-normal">Nursing Career</span> Today
            </h2>
            <p className="text-lg text-slate-400 mb-10 leading-relaxed">
              Upload your resume and active PNC license details. Our global recruitment team reviews applications within 24 hours to schedule immediate interviews for qualified candidates.
            </p>
            
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center mt-1">
                  <CheckCircle2 className="text-brand-400 w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-serif text-xl text-white mb-1">Quick Screening</h4>
                  <p className="text-slate-400 text-sm">24-hour profile review process</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center mt-1">
                  <CheckCircle2 className="text-brand-400 w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-serif text-xl text-white mb-1">Direct Interviews</h4>
                  <p className="text-slate-400 text-sm">Speak directly with hospital representatives</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Form Right Side */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl"
          >
            {isSuccess ? (
              <div className="text-center py-12">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-20 h-20 bg-brand-500/20 border border-brand-500/30 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircle2 className="w-10 h-10 text-brand-400" />
                </motion.div>
                <h3 className="text-2xl font-serif text-white mb-2">Application Received!</h3>
                <p className="text-slate-400 mb-8 text-sm">Our recruitment team will review your PNC license and CV. We will contact you shortly to schedule your interview.</p>
                <button 
                  onClick={() => setIsSuccess(false)}
                  className="bg-brand-500 text-slate-900 px-8 py-3 rounded-xl font-bold hover:bg-brand-400 transition-colors"
                >
                  Submit Another Application
                </button>
              </div>
            ) : (
              <div>
                <h3 className="text-2xl font-serif text-white mb-2">Instant Application</h3>
                <p className="text-sm text-slate-500 mb-8">Complete the fields below for an immediate interview invitation.</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block mb-2">Full Name</label>
                      <input required name="fullName" type="text" className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-500/50 transition-colors placeholder:text-slate-600" placeholder="John Doe" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block mb-2">Phone Number</label>
                      <input required name="phone" type="tel" className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-500/50 transition-colors placeholder:text-slate-600" placeholder="+92 3XX XXXXXXX" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block mb-2">Email Address</label>
                    <input required name="email" type="email" className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-500/50 transition-colors placeholder:text-slate-600" placeholder="nurse@example.com" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block mb-2">PNC License Number</label>
                    <input required name="licenseNumber" type="text" className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-500/50 transition-colors placeholder:text-slate-600" placeholder="PN-XXXXXXX" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                    {/* CV Upload */}
                    <div className="relative cursor-pointer group">
                      <input 
                        type="file" 
                        required
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => setCvName(e.target.files?.[0]?.name || null)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                      />
                      <div className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center transition-colors h-28 ${cvName ? 'border-brand-500/50 bg-brand-500/10' : 'border-white/5 bg-white/0 group-hover:bg-white/5'}`}>
                        <FileText className={`w-6 h-6 mx-auto mb-2 ${cvName ? 'text-brand-400' : 'text-slate-500 group-hover:text-brand-400'}`} />
                        <p className="text-[10px] font-bold text-slate-400 truncate w-full text-center">{cvName || "Upload CV"}</p>
                        <p className="text-[10px] text-slate-600 mt-1">{cvName ? "Ready" : "PDF, DOC up to 5MB"}</p>
                      </div>
                    </div>

                    {/* PNC Upload */}
                    <div className="relative cursor-pointer group">
                      <input 
                        type="file" 
                        required
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => setLicenseName(e.target.files?.[0]?.name || null)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                      />
                      <div className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center transition-colors h-28 ${licenseName ? 'border-brand-500/50 bg-brand-500/10' : 'border-white/5 bg-white/0 group-hover:bg-white/5'}`}>
                        <BadgeCheck className={`w-6 h-6 mx-auto mb-2 ${licenseName ? 'text-brand-400' : 'text-slate-500 group-hover:text-brand-400'}`} />
                        <p className="text-[10px] font-bold text-slate-400 truncate w-full text-center">{licenseName || "Upload PNC License"}</p>
                        <p className="text-[10px] text-slate-600 mt-1">{licenseName ? "Ready" : "Image or PDF"}</p>
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-brand-500 hover:bg-brand-400 text-slate-900 font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] flex justify-center items-center gap-2 mt-4 shadow-lg shadow-brand-500/20 disabled:opacity-70 disabled:transform-none"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                    ) : (
                      <>
                        <UploadCloud size={18} />
                        Submit & Schedule Interview
                      </>
                    )}
                  </button>

                  <p className="text-center text-[10px] text-slate-600 mt-6 uppercase tracking-widest">
                    Secure • Confidential • Worldwide Recruitment
                  </p>
                </form>
              </div>
            )}
          </motion.div>
          
        </div>
      </div>
    </section>
  );
}
