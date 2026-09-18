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
  User,
  ShieldCheck
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
    <div className="bg-slate-50 min-h-screen text-slate-900 font-sans">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden bg-gradient-to-b from-blue-50/80 via-indigo-50/40 to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          {/* Status Badge matching Admin Overview pill design */}
          {user ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-blue-200/80 text-blue-700 shadow-xs font-bold text-xs mb-8 animate-fade-in">
              <User className="w-4 h-4 text-blue-600" />
              <span>Signed in as <strong>{user.name}</strong> ({user.role?.toUpperCase()})</span>
              <Link to={getDashboardRoute()} className="ml-2 font-extrabold underline text-blue-600 hover:text-blue-800">
                Go to Dashboard →
              </Link>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-blue-200/80 text-blue-700 shadow-xs font-bold text-xs mb-8">
              <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
              <span>Smart HealthSphere Clinical Engine v2.0</span>
            </div>
          )}

          {/* Hero Headline */}
          <h1 className="max-w-4xl mx-auto font-black text-4xl sm:text-6xl tracking-tight text-slate-900 leading-tight">
            AI-Assisted Telemedicine Triage &{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
              Encrypted EHR Platform
            </span>
          </h1>

          <p className="max-w-2xl mx-auto mt-6 text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
            Evaluate symptoms with intelligent AI clinical triage, connect with specialists via virtual telemedicine rooms, and protect sensitive medical history with AES-256 field-level encryption.
          </p>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
            <button
              onClick={() => setIsTriageOpen(true)}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/25 transition flex items-center justify-center gap-3 cursor-pointer"
            >
              <Sparkles className="w-5 h-5" />
              <span>Launch AI Symptom Triage</span>
            </button>

            <Link
              to="/doctors"
              className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-800 font-bold rounded-2xl border border-slate-200 shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Explore Doctors</span>
              <ArrowRight className="w-5 h-5 text-slate-400" />
            </Link>

            {user && (
              <Link
                to={getDashboardRoute()}
                className="w-full sm:w-auto px-8 py-4 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-2xl border border-blue-200 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <LayoutDashboard className="w-5 h-5 text-blue-600" />
                <span>My Dashboard</span>
              </Link>
            )}
          </div>

          {/* Feature Highlights Cards - Pure White Admin Style */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {/* Feature 1: AI Symptom Triage */}
            <div 
              onClick={() => handleCardClick('triage')}
              className="bg-white p-8 rounded-[2rem] border border-slate-200/80 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:border-blue-500/50 transition-all duration-300 cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl w-fit mb-6 group-hover:scale-105 transition-transform">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                  AI Symptom Triage
                </h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">
                  Algorithm-driven symptom evaluation that calculates urgency scores, flags red-flag emergencies, and maps patients to specialists.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-blue-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Specialist Mapping Engine
                </span>
                <span className="text-xs font-extrabold text-blue-600 group-hover:translate-x-1 transition-transform">
                  Open Triage →
                </span>
              </div>
            </div>

            {/* Feature 2: AES-256 Encrypted EHR */}
            <div 
              onClick={() => handleCardClick('ehr')}
              className="bg-white p-8 rounded-[2rem] border border-slate-200/80 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:border-indigo-500/50 transition-all duration-300 cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl w-fit mb-6 group-hover:scale-105 transition-transform">
                  <Lock className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                  AES-256 Encrypted EHR
                </h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">
                  Field-level cryptographic security ensuring clinical notes, vitals, and e-prescriptions are encrypted in transit and at rest.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-indigo-700">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  HIPAA-Compliant Vault
                </span>
                <span className="text-xs font-extrabold text-indigo-600 group-hover:translate-x-1 transition-transform">
                  Access Vault →
                </span>
              </div>
            </div>

            {/* Feature 3: Telemedicine Consultations */}
            <div 
              onClick={() => handleCardClick('telemedicine')}
              className="bg-white p-8 rounded-[2rem] border border-slate-200/80 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:border-purple-500/50 transition-all duration-300 cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="p-3.5 bg-purple-50 text-purple-600 rounded-2xl w-fit mb-6 group-hover:scale-105 transition-transform">
                  <Video className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-purple-600 transition-colors">
                  Telemedicine Consultations
                </h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">
                  Dynamic virtual video room generation allowing seamless patient-doctor tele-consultations with digital prescriptions.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-purple-700">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  WebRTC Video Rooms
                </span>
                <span className="text-xs font-extrabold text-purple-600 group-hover:translate-x-1 transition-transform">
                  {user ? 'My Consultations →' : 'Find Specialists →'}
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="bg-white py-8 border-t border-slate-200/80 text-center text-xs font-semibold text-slate-500">
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
