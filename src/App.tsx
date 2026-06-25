/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Benefits from './components/Benefits';
import ApplicationForm from './components/ApplicationForm';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-[#080a0f] text-slate-300 font-sans selection:bg-brand-500/30 selection:text-brand-400">
      <Navbar />
      <main>
        <Hero />
        <Benefits />
        <ApplicationForm />
      </main>
      <Footer />
    </div>
  );
}
