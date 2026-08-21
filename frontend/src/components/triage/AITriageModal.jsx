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
      case 'Emergency': return 'bg-red-500/10 text-red-600 border-red-500/30';
      case 'High Risk': return 'bg-orange-500/10 text-orange-600 border-orange-500/30';
      case 'Moderate': return 'bg-amber-500/10 text-amber-600 border-amber-500/30';
      default: return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full p-6 relative border border-slate-200 dark:border-slate-700 my-8">
        
        {/* Header */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 rounded-xl">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Smart HealthSphere AI Triage Assistant
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Intelligent Clinical Evaluation & Specialist Recommendation
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300 rounded-xl text-sm border border-red-200 dark:border-red-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {!result ? (
          <form onSubmit={handleAnalyze} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Describe your symptoms or chief complaint:
              </label>
              <textarea
                rows="3"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="e.g. Chest pain with mild shortness of breath when walking, or headache and persistent fever..."
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Duration (Days):
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Severity Rating (1-10):
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={severityRating}
                  onChange={(e) => setSeverityRating(e.target.value)}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="text-right text-xs text-indigo-600 font-bold dark:text-indigo-400">
                  {severityRating} / 10
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Patient Age (Optional):
                </label>
                <input
                  type="number"
                  placeholder="e.g. 35"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2"
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
            <div className="p-4 rounded-xl border flex flex-wrap items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                  Calculated Triage Category
                </span>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`px-3 py-1 rounded-full text-sm font-bold border ${getRiskBadgeColor(result.triageLevel)}`}>
                    {result.triageLevel}
                  </span>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    Risk Score: {result.riskScore} / 100
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 block">
                  Recommended Specialty
                </span>
                <span className="text-base font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 justify-end">
                  <Stethoscope className="w-4 h-4" />
                  {result.recommendedSpecialty}
                </span>
              </div>
            </div>

            {/* Emergency Warning Alert */}
            {result.isEmergency && (
              <div className="p-4 bg-red-500/15 border border-red-500/30 text-red-700 dark:text-red-300 rounded-xl text-sm flex items-start gap-3">
                <ShieldAlert className="w-6 h-6 flex-shrink-0 text-red-600 dark:text-red-400" />
                <div>
                  <h4 className="font-bold text-red-800 dark:text-red-200">Emergency Alert Detected!</h4>
                  <p className="mt-1 text-xs">{result.emergencyReason}</p>
                </div>
              </div>
            )}

            {/* Clinical Advice */}
            <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/40">
              <h4 className="font-bold text-sm text-indigo-900 dark:text-indigo-300 mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                AI Clinical Guidance:
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                {result.clinicalAdvice.map((advice, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-indigo-500 font-bold">•</span>
                    <span>{advice}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => setResult(null)}
                className="w-full sm:w-auto px-4 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-sm font-semibold transition"
              >
                Re-evaluate Symptoms
              </button>
              <button
                onClick={() => {
                  onSelectSpecialty(result.recommendedSpecialty, result);
                  onClose();
                }}
                className="w-full sm:flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 text-sm"
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
