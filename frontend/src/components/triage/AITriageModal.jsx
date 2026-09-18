import React, { useState } from 'react';
import { Activity, AlertTriangle, CheckCircle, ShieldAlert, Sparkles, X, ArrowRight, Stethoscope } from 'lucide-react';
import api from '../../api/axios';

const AITriageModal = ({ isOpen, onClose, onSelectSpecialty }) => {
  const [symptoms, setSymptoms] = useState('');
  const [durationDays, setDurationDays] = useState(2);
  const [severityRating, setSeverityRating] = useState(5);
  const [age, setAge] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!symptoms.trim()) {
      setError('Please describe your symptoms.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/triage/analyze', {
        symptoms,
        durationDays: Number(durationDays),
        severityRating: Number(severityRating),
        age: age ? Number(age) : undefined
      });
      setResult(res.data.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to complete triage analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadgeColor = (level) => {
    switch (level) {
      case 'Emergency': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'High Risk': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Moderate': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 relative border border-slate-200 my-8 text-slate-900 font-sans">
        
        {/* Header */}
        <button 
          onClick={onClose} 
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              Smart HealthSphere AI Triage Assistant
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Intelligent Clinical Evaluation & Specialist Recommendation
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 text-rose-700 rounded-xl text-sm border border-rose-200 flex items-center gap-2 font-medium">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {!result ? (
          <form onSubmit={handleAnalyze} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Describe your symptoms or chief complaint:
              </label>
              <textarea
                rows="3"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="e.g. Chest pain with mild shortness of breath when walking, or headache and persistent fever..."
                className="w-full p-3.5 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-semibold text-slate-900 transition-all placeholder:font-normal"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Duration (Days):
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-600 outline-none text-sm font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Severity Rating (1-10):
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={severityRating}
                  onChange={(e) => setSeverityRating(e.target.value)}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="text-right text-xs text-blue-600 font-extrabold">
                  {severityRating} / 10
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Patient Age (Optional):
                </label>
                <input
                  type="number"
                  placeholder="e.g. 35"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-600 outline-none text-sm font-bold text-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/20 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              {loading ? (
                <>
                  <Activity className="w-5 h-5 animate-spin" />
                  Running Clinical AI Evaluation...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Evaluate Symptoms & Recommend Doctor
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            {/* Triage Level & Score Header */}
            <div className="p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-4 bg-slate-50 border-slate-200/80">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">
                  Calculated Triage Category
                </span>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${getRiskBadgeColor(result.triageLevel)}`}>
                    {result.triageLevel}
                  </span>
                  <span className="text-xs font-bold text-slate-700">
                    Risk Score: {result.riskScore} / 100
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">
                  Recommended Specialty
                </span>
                <span className="text-base font-extrabold text-blue-600 flex items-center gap-1 justify-end">
                  <Stethoscope className="w-4 h-4" />
                  {result.recommendedSpecialty}
                </span>
              </div>
            </div>

            {/* Emergency Warning Alert */}
            {result.isEmergency && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-sm flex items-start gap-3">
                <ShieldAlert className="w-6 h-6 flex-shrink-0 text-rose-600" />
                <div>
                  <h4 className="font-extrabold text-rose-900">Emergency Alert Detected!</h4>
                  <p className="mt-1 text-xs font-medium">{result.emergencyReason}</p>
                </div>
              </div>
            )}

            {/* Clinical Advice */}
            <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-100">
              <h4 className="font-bold text-sm text-blue-950 mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                AI Clinical Guidance:
              </h4>
              <ul className="space-y-1.5 text-xs font-medium text-slate-700">
                {result.clinicalAdvice.map((advice, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>{advice}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => setResult(null)}
                className="w-full sm:w-auto px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Re-evaluate Symptoms
              </button>
              <button
                onClick={() => {
                  onSelectSpecialty(result.recommendedSpecialty, result);
                  onClose();
                }}
                className="w-full sm:flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/20 active:scale-95 transition flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                Find & Book {result.recommendedSpecialty} Specialist
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AITriageModal;
