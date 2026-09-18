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
      <nav className="fixed w-full z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            {/* Logo matching Admin Header style */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2.5 rounded-2xl shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <HeartPulse className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                  Smart HealthSphere
                </span>
                <div className="flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase text-blue-600">
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
                    ? 'text-blue-600 font-bold' 
                    : 'text-slate-600 hover:text-blue-600'
                }`}
              >
                Home
              </Link>
              <Link 
                to="/doctors" 
                className={`font-semibold text-sm transition-colors ${
                  location.pathname === '/doctors' 
                    ? 'text-blue-600 font-bold' 
                    : 'text-slate-600 hover:text-blue-600'
                }`}
              >
                Find a Doctor
              </Link>

              {/* AI Triage Trigger */}
              <button
                onClick={() => setIsTriageOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50/80 hover:bg-blue-100 border border-blue-200/80 text-blue-700 font-semibold text-xs transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
                <span>AI Symptom Triage</span>
              </button>

              {/* Auth / Profile Area */}
              <div className="flex items-center space-x-3 border-l border-slate-200/80 pl-6">
                {user ? (
                  <div className="flex items-center space-x-3">
                    <Link 
                      to={getDashboardPath()}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-600/20 transition flex items-center space-x-1.5"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      <span>{user.role === 'doctor' ? 'Doctor Portal' : user.role === 'admin' ? 'Admin Portal' : 'Patient Dashboard'}</span>
                    </Link>

                    <button
                      onClick={logout}
                      title="Logout"
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Link 
                      to="/login" 
                      className="text-blue-600 font-bold text-sm hover:text-blue-700 flex items-center space-x-1"
                    >
                      <LogIn className="h-4 w-4" />
                      <span>Log in</span>
                    </Link>
                    <Link 
                      to="/register" 
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-600/20 transition flex items-center space-x-1.5"
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
