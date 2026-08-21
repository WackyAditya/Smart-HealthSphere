import React, { useEffect, useState } from 'react';
import { Calendar, Clock, CheckCircle, Video, Sparkles, AlertCircle } from 'lucide-react';
import api from '../../api/axios';

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await api.get('/appointments/me');
        setAppointments(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const getTriageBadge = (level) => {
    switch (level) {
      case 'Emergency': return 'bg-red-500/10 text-red-600 border-red-500/30';
      case 'High Risk': return 'bg-orange-500/10 text-orange-600 border-orange-500/30';
      case 'Moderate': return 'bg-amber-500/10 text-amber-600 border-amber-500/30';
      default: return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30';
    }
  };

  const renderAppointments = (list) => (
    <div className="space-y-4">
      {list.length > 0 ? list.map((apt) => (
        <div key={apt._id} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all bg-white dark:bg-slate-800 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Doctor info */}
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex-shrink-0 flex items-center justify-center overflow-hidden border border-indigo-200 dark:border-indigo-800">
                <img src={`https://ui-avatars.com/api/?name=${apt.doctor?.name?.replace('Dr. ', '') || 'Doctor'}&background=random`} alt="Doctor" className="h-full w-full" />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-base">{apt.doctor?.name || 'Doctor'}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{apt.doctor?.specialization || 'General Practitioner'}</p>
                
                {/* Triage Badge if present */}
                {apt.triageResult?.triageLevel && (
                  <span className={`inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getTriageBadge(apt.triageResult.triageLevel)}`}>
                    <Sparkles className="w-3 h-3" />
                    AI Triage: {apt.triageResult.triageLevel} (Score: {apt.triageResult.riskScore})
                  </span>
                )}
              </div>
            </div>

            {/* Date & Time */}
            <div className="flex items-center gap-6">
              <div>
                <div className="flex items-center space-x-2 text-slate-800 dark:text-slate-200 font-medium text-sm">
                  <Calendar className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <span>{new Date(apt.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-500 text-xs mt-1">
                  <Clock className="h-4 w-4" />
                  <span>{apt.time}</span>
                </div>
              </div>

              {/* Status */}
              <div>
                <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold ${
                  apt.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30' :
                  apt.status === 'pending' ? 'bg-amber-500/10 text-amber-600 border border-amber-500/30' :
                  apt.status === 'cancelled' ? 'bg-red-500/10 text-red-600 border border-red-500/30' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {apt.status === 'confirmed' && <CheckCircle className="h-3.5 w-3.5" />}
                  <span>{apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}</span>
                </div>
              </div>
            </div>

            {/* Telemedicine Room CTA */}
            {apt.telemedicineRoomUrl && (
              <div>
                <a
                  href={apt.telemedicineRoomUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 transition flex items-center justify-center gap-2"
                >
                  <Video className="w-4 h-4 animate-pulse" />
                  Join Telemedicine Room
                </a>
              </div>
            )}
          </div>
        </div>
      )) : (
        <div className="text-center py-12 text-slate-500 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-sm">
          No appointments found in this category.
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Telemedicine Appointments</h1>
          <p className="text-slate-500 text-xs mt-1">Manage scheduled consultations and access virtual video clinic rooms.</p>
        </div>
        <button onClick={() => window.location.href='/doctors'} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md transition">
          Book New Consultation
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="space-y-8">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">Appointments & Telemedicine Rooms</h2>
            {renderAppointments(appointments)}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;

