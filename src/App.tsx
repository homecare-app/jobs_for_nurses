/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Benefits from './components/Benefits';
import Footer from './components/Footer';
import Survey from './components/Survey';

function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Benefits />
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <Router basename="/jobs_for_nurses">
      <div className="min-h-screen bg-[#080a0f] text-slate-300 font-sans selection:bg-brand-500/30 selection:text-brand-400">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/survey" element={<Survey />} />
        </Routes>
      </div>
    </Router>
  );
}
