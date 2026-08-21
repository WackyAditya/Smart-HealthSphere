import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { HeartPulse, User, LogIn, Sparkles, ShieldCheck } from 'lucide-react';
import AITriageModal from '../triage/AITriageModal';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isTriageOpen, setIsTriageOpen] = useState(false);
  const isDashboard = location.pathname.includes('/patient') || location.pathname.includes('/doctor') || location.pathname.includes('/admin');

  if (isDashboard) return null;

  const handleSelectSpecialty = (specialty) => {
    navigate(`/doctors?specialization=${encodeURIComponent(specialty)}`);
  };

  return (
    <>
      <nav className="fixed w-full z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Link to="/" className="flex items-center space-x-3">
              <div className="bg-gradient-to-tr from-indigo-600 to-violet-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20">
                <HeartPulse className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
                  Smart HealthSphere
                </span>
                <div className="flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase text-indigo-600 dark:text-indigo-400">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  AI Triage & Encrypted EHR
                </div>
              </div>
            </Link>
            
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/" className="text-slate-600 hover:text-indigo-600 dark:text-slate-300 font-medium text-sm transition-colors">
                Home
              </Link>
              <Link to="/doctors" className="text-slate-600 hover:text-indigo-600 dark:text-slate-300 font-medium text-sm transition-colors">
                Find a Doctor
              </Link>

              <button
                onClick={() => setIsTriageOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-semibold text-xs hover:shadow-md transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                <span>AI Symptom Triage</span>
              </button>

              <div className="flex items-center space-x-3 border-l border-slate-200 dark:border-slate-700 pl-6">
                <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm hover:text-indigo-700 flex items-center space-x-1">
                  <LogIn className="h-4 w-4" />
                  <span>Log in</span>
                </Link>
                <Link to="/register" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-600/20 transition flex items-center space-x-1.5">
                  <User className="h-4 w-4" />
                  <span>Sign up</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* AI Triage Modal */}
      <AITriageModal
        isOpen={isTriageOpen}
        onClose={() => setIsTriageOpen(false)}
        onSelectSpecialty={handleSelectSpecialty}
      />
    </>
  );
};

export default Navbar;

