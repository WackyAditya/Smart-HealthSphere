import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Sparkles, 
  Shield, 
  Lock, 
  Video, 
  Stethoscope, 
  CheckCircle2, 
  Activity,
  LayoutDashboard,
  Calendar,
  FileText,
  User
} from 'lucide-react';
import AITriageModal from '../components/triage/AITriageModal';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isTriageOpen, setIsTriageOpen] = useState(false);

  const handleSelectSpecialty = (specialty) => {
    navigate(`/doctors?specialization=${encodeURIComponent(specialty)}`);
  };

  const getDashboardRoute = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'doctor') return '/doctor/dashboard';
    return '/patient/dashboard';
  };

  const handleCardClick = (type) => {
    if (type === 'triage') {
      setIsTriageOpen(true);
    } else if (type === 'ehr') {
      if (!user) {
        navigate('/login?redirect=/patient/records');
      } else if (user.role === 'doctor') {
        navigate('/doctor/patient-records');
      } else {
        navigate('/patient/records');
      }
    } else if (type === 'telemedicine') {
      if (!user) {
        navigate('/doctors');
      } else if (user.role === 'doctor') {
        navigate('/doctor/appointments');
      } else {
        navigate('/patient/appointments');
      }
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-b from-indigo-900/10 via-purple-900/5 to-slate-50 dark:to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          {/* Status Badge */}
          {user ? (
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold text-xs mb-8 animate-fade-in">
              <User className="w-4 h-4 text-emerald-500" />
              <span>Signed in as <strong>{user.name}</strong> ({user.role?.toUpperCase()})</span>
              <Link to={getDashboardRoute()} className="ml-2 underline hover:text-emerald-800">
                Go to Dashboard →
              </Link>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-semibold text-xs mb-8">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-pulse" />
              Smart HealthSphere Clinical Engine v2.0
            </div>
          )}

          <h1 className="max-w-4xl mx-auto font-extrabold text-4xl sm:text-6xl tracking-tight text-slate-900 dark:text-white">
            AI-Assisted Telemedicine Triage &{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
              Encrypted EHR Platform
            </span>
          </h1>

          <p className="max-w-2xl mx-auto mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-300">
            Evaluate symptoms with intelligent AI clinical triage, connect with specialists via virtual telemedicine rooms, and protect sensitive medical history with AES-256 field-level encryption.
          </p>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
            <button
              onClick={() => setIsTriageOpen(true)}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 active:scale-95 text-white font-bold rounded-2xl shadow-xl shadow-indigo-600/30 transition flex items-center justify-center gap-3 cursor-pointer"
            >
              <Sparkles className="w-5 h-5" />
              <span>Launch AI Symptom Triage</span>
            </button>

            <Link
              to="/doctors"
              className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Explore Doctors</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            {user && (
              <Link
                to={getDashboardRoute()}
                className="w-full sm:w-auto px-8 py-4 bg-indigo-50 dark:bg-indigo-950/40 text-primary-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 font-bold rounded-2xl border border-indigo-200 dark:border-indigo-800 shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>My Dashboard</span>
              </Link>
            )}
          </div>

          {/* Feature Highlights Interactive Cards */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {/* Feature 1: AI Symptom Triage */}
            <div 
              onClick={() => handleCardClick('triage')}
              className="bg-white dark:bg-slate-800/80 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl shadow-indigo-500/5 relative overflow-hidden group hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="p-3 bg-indigo-500/10 text-indigo-600 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 transition-colors">
                  AI Symptom Triage
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Algorithm-driven symptom evaluation that calculates urgency scores, flags red-flag emergencies, and maps patients to specialists.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Specialist Mapping Engine
                </span>
                <span className="text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">
                  Open Triage →
                </span>
              </div>
            </div>

            {/* Feature 2: AES-256 Encrypted EHR */}
            <div 
              onClick={() => handleCardClick('ehr')}
              className="bg-white dark:bg-slate-800/80 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl shadow-indigo-500/5 relative overflow-hidden group hover:border-purple-500 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="p-3 bg-purple-500/10 text-purple-600 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform">
                  <Lock className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-purple-600 transition-colors">
                  AES-256 Encrypted EHR
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Field-level cryptographic security ensuring clinical notes, vitals, and e-prescriptions are encrypted in transit and at rest.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  HIPAA-Compliant Vault
                </span>
                <span className="text-xs font-bold text-purple-600 group-hover:translate-x-1 transition-transform">
                  Access Vault →
                </span>
              </div>
            </div>

            {/* Feature 3: Telemedicine Consultations */}
            <div 
              onClick={() => handleCardClick('telemedicine')}
              className="bg-white dark:bg-slate-800/80 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl shadow-indigo-500/5 relative overflow-hidden group hover:border-pink-500 hover:shadow-2xl hover:shadow-pink-500/20 transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="p-3 bg-pink-500/10 text-pink-600 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform">
                  <Video className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-pink-600 transition-colors">
                  Telemedicine Consultations
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Dynamic virtual video room generation allowing seamless patient-doctor tele-consultations with digital prescriptions.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs font-bold text-pink-600 dark:text-pink-400">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  WebRTC Video Rooms
                </span>
                <span className="text-xs font-bold text-pink-600 group-hover:translate-x-1 transition-transform">
                  {user ? 'My Consultations →' : 'Find Specialists →'}
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 py-8 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
        <p>© 2026 Smart HealthSphere. AI-Assisted Telemedicine & Encrypted EHR Platform.</p>
      </footer>

      {/* AI Triage Modal */}
      <AITriageModal
        isOpen={isTriageOpen}
        onClose={() => setIsTriageOpen(false)}
        onSelectSpecialty={handleSelectSpecialty}
      />
    </div>
  );
};

export default Home;
