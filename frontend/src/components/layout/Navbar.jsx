import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { HeartPulse, User, LogIn, Sparkles, ShieldCheck, LayoutDashboard, LogOut } from 'lucide-react';
import AITriageModal from '../triage/AITriageModal';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isTriageOpen, setIsTriageOpen] = useState(false);
  const isDashboard = location.pathname.includes('/patient') || location.pathname.includes('/doctor') || location.pathname.includes('/admin');

  if (isDashboard) return null;

  const handleSelectSpecialty = (specialty) => {
    navigate(`/doctors?specialization=${encodeURIComponent(specialty)}`);
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'doctor') return '/doctor/dashboard';
    return '/patient/dashboard';
  };

  return (
    <>
      <nav className="fixed w-full z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="bg-gradient-to-tr from-indigo-600 to-violet-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
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
            
            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-6">
              <Link 
                to="/" 
                className={`font-semibold text-sm transition-colors ${
                  location.pathname === '/' 
                    ? 'text-indigo-600 dark:text-indigo-400' 
                    : 'text-slate-600 hover:text-indigo-600 dark:text-slate-300'
                }`}
              >
                Home
              </Link>
              <Link 
                to="/doctors" 
                className={`font-semibold text-sm transition-colors ${
                  location.pathname === '/doctors' 
                    ? 'text-indigo-600 dark:text-indigo-400' 
                    : 'text-slate-600 hover:text-indigo-600 dark:text-slate-300'
                }`}
              >
                Find a Doctor
              </Link>

              {/* AI Triage Modal Trigger */}
              <button
                onClick={() => setIsTriageOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-semibold text-xs hover:shadow-md transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                <span>AI Symptom Triage</span>
              </button>

              {/* Auth / Profile Area */}
              <div className="flex items-center space-x-3 border-l border-slate-200 dark:border-slate-700 pl-6">
                {user ? (
                  <div className="flex items-center space-x-3">
                    <Link 
                      to={getDashboardPath()}
                      className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-600/20 transition flex items-center space-x-1.5"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      <span>{user.role === 'doctor' ? 'Doctor Portal' : user.role === 'admin' ? 'Admin Portal' : 'Patient Dashboard'}</span>
                    </Link>

                    <button
                      onClick={logout}
                      title="Logout"
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Link 
                      to="/login" 
                      className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm hover:text-indigo-700 flex items-center space-x-1"
                    >
                      <LogIn className="h-4 w-4" />
                      <span>Log in</span>
                    </Link>
                    <Link 
                      to="/register" 
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-600/20 transition flex items-center space-x-1.5"
                    >
                      <User className="h-4 w-4" />
                      <span>Sign up</span>
                    </Link>
                  </>
                )}
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
