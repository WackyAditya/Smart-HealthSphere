import React, { useEffect, useState } from 'react';
import { 
  FileText, 
  Search, 
  PlusCircle, 
  Lock, 
  ShieldCheck, 
  Activity, 
  Clock, 
  User, 
  X,
  Check,
  Calendar,
  RefreshCw
} from 'lucide-react';
import api from '../../api/axios';
import { useSearch } from '../../context/SearchContext';

const PatientRecords = () => {
  const { searchTerm, setSearchTerm } = useSearch();
  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');

  const [newRecord, setNewRecord] = useState({
    patientId: '',
    title: '',
    description: '',
    recordType: 'Clinical Evaluation',
    vitals: { bp: '120/80', pulse: '72', temp: '98.6°F' }
  });

  const loadPatients = async () => {
    try {
      setLoadingPatients(true);
      const res = await api.get('/doctors/patients/all');
      if (Array.isArray(res.data) && res.data.length > 0) {
        setPatients(res.data);
        if (!newRecord.patientId && res.data.length > 0) {
          setNewRecord(prev => ({ ...prev, patientId: res.data[0]._id }));
        }
        return;
      }
    } catch (err) {
      console.warn('Could not fetch from /doctors/patients/all, attempting fallback:', err);
    }
    
    // Fallback: extract unique patients from doctor appointments
    try {
      const aptRes = await api.get('/appointments/me');
      const patientMap = {};
      (aptRes.data || []).forEach(a => {
        if (a.patient && a.patient._id) {
          patientMap[a.patient._id] = {
            _id: a.patient._id,
            name: a.patient.name,
            email: a.patient.email,
            hasAppointment: true
          };
        }
      });
      const list = Object.values(patientMap);
      setPatients(list);
      if (!newRecord.patientId && list.length > 0) {
        setNewRecord(prev => ({ ...prev, patientId: list[0]._id }));
      }
    } catch (e) {
      console.error('Fallback patient error:', e);
    } finally {
      setLoadingPatients(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const recRes = await api.get('/medical-records');
      setRecords(recRes.data || []);
      await loadPatients();
    } catch (error) {
      console.error('Error fetching records:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (showAddModal) {
      loadPatients();
    }
  }, [showAddModal]);

  const handleCreateRecord = async (e) => {
    e.preventDefault();
    if (!newRecord.patientId) {
      alert('Please select a patient');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/medical-records', newRecord);
      setShowAddModal(false);
      setNewRecord({
        patientId: '',
        title: '',
        description: '',
        recordType: 'Clinical Evaluation',
        vitals: { bp: '120/80', pulse: '72', temp: '98.6°F' }
      });
      setFeedback('New encrypted medical record created successfully!');
      setTimeout(() => setFeedback(''), 4000);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating record');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredRecords = records.filter(rec => {
    if (!searchTerm?.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      rec.title?.toLowerCase().includes(term) ||
      rec.patient?.name?.toLowerCase().includes(term) ||
      rec.decryptedDescription?.toLowerCase().includes(term) ||
      rec.recordType?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Feedback */}
      {feedback && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-6 py-4 rounded-2xl flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center space-x-3">
            <ShieldCheck className="h-5 w-5 text-emerald-600 flex-shrink-0" />
            <span className="font-semibold text-sm">{feedback}</span>
          </div>
          <button onClick={() => setFeedback('')} className="text-emerald-500 hover:text-emerald-700">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-[2.5rem] border border-indigo-50 shadow-sm gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-bold text-gray-800">Patient Electronic Health Records</h1>
            <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-black rounded-full uppercase flex items-center gap-1">
              <Lock className="h-3 w-3" /> AES-256
            </span>
          </div>
          <p className="text-gray-500 mt-1">Review diagnostic histories, vitals, and write encrypted clinical notes.</p>
        </div>
        <button
          onClick={() => {
            loadPatients();
            setShowAddModal(true);
          }}
          className="bg-primary-600 hover:bg-primary-700 active:scale-95 text-white px-8 py-4 rounded-2xl font-bold flex items-center space-x-2 transition-all shadow-xl shadow-indigo-100 cursor-pointer"
        >
          <PlusCircle className="h-5 w-5" />
          <span>New Clinical Record</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center">
        <div className="relative w-full md:w-96">
          <Search className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search patient, diagnosis, or record title..." 
            className="w-full pl-11 pr-10 py-3 bg-gray-50 border border-transparent rounded-2xl text-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Records Grid */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden p-8">
        {loading ? (
          <div className="p-16 flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredRecords.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecords.map(rec => (
              <div 
                key={rec._id}
                onClick={() => setSelectedRecord(rec)}
                className="p-6 bg-gray-50/70 hover:bg-indigo-50/50 border border-gray-100 rounded-3xl transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 font-bold text-xs rounded-xl">
                      {rec.recordType || 'Clinical Note'}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium">
                      {new Date(rec.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="font-bold text-gray-900 text-base group-hover:text-primary-600 transition-colors">
                    {rec.title}
                  </h3>

                  <p className="text-xs text-gray-500 mt-2 line-clamp-3 leading-relaxed">
                    {rec.decryptedDescription || rec.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200/60 flex items-center justify-between text-xs text-gray-500 font-medium">
                  <div className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-primary-500" />
                    <span>{rec.patient?.name || 'Patient'}</span>
                  </div>
                  <span className="text-primary-600 font-bold group-hover:underline">View Notes →</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-gray-400">
            <FileText className="h-12 w-12 text-gray-200 mx-auto mb-2" />
            <p className="font-semibold text-gray-600">No medical records found.</p>
          </div>
        )}
      </div>

      {/* Record Details Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl animate-scale-up border border-white/20">
            <div className="bg-primary-600 p-8 text-white relative">
              <div className="flex items-center gap-2 mb-1">
                <Lock className="w-4 h-4 text-indigo-200" />
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Decrypted EHR Record</span>
              </div>
              <h2 className="text-2xl font-bold">{selectedRecord.title}</h2>
              <p className="text-indigo-100 text-xs mt-1">Patient: {selectedRecord.patient?.name}</p>
              <button 
                onClick={() => setSelectedRecord(null)}
                className="absolute top-8 right-8 text-white/70 hover:text-white p-1"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-8 space-y-5 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <p className="text-[10px] font-black text-gray-400 uppercase">Created Date</p>
                  <p className="text-sm font-bold text-gray-800">{new Date(selectedRecord.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <p className="text-[10px] font-black text-gray-400 uppercase">Record Category</p>
                  <p className="text-sm font-bold text-purple-700">{selectedRecord.recordType || 'Clinical Evaluation'}</p>
                </div>
              </div>

              {selectedRecord.vitals && Object.keys(selectedRecord.vitals).length > 0 && (
                <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                  <p className="text-[10px] font-black text-primary-700 uppercase tracking-widest mb-2">Patient Vitals</p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white p-2 rounded-xl shadow-sm">
                      <p className="text-[9px] text-gray-400">BP</p>
                      <p className="text-xs font-bold text-gray-800">{selectedRecord.vitals.bp || '120/80'}</p>
                    </div>
                    <div className="bg-white p-2 rounded-xl shadow-sm">
                      <p className="text-[9px] text-gray-400">PULSE</p>
                      <p className="text-xs font-bold text-gray-800">{selectedRecord.vitals.pulse || '72 bpm'}</p>
                    </div>
                    <div className="bg-white p-2 rounded-xl shadow-sm">
                      <p className="text-[9px] text-gray-400">TEMP</p>
                      <p className="text-xs font-bold text-gray-800">{selectedRecord.vitals.temp || '98.6°F'}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-gray-50 p-5 rounded-2xl space-y-2">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Clinical Prescription & Notes</p>
                <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {selectedRecord.decryptedDescription || selectedRecord.description}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add New Record Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl animate-scale-up border border-white/20">
            <div className="bg-primary-600 p-8 text-white relative">
              <h2 className="text-2xl font-bold">New Clinical Record</h2>
              <p className="text-indigo-100 text-xs mt-1">Data is encrypted at rest using AES-256 cryptographic vault.</p>
              <button 
                onClick={() => setShowAddModal(false)}
                className="absolute top-8 right-8 text-white/70 hover:text-white p-1"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleCreateRecord} className="p-8 space-y-5">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select Patient *</label>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-primary-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {loadingPatients ? 'Loading patients...' : `${patients.length} available`}
                    </span>
                    <button 
                      type="button" 
                      onClick={loadPatients}
                      title="Refresh patients list"
                      className="text-gray-400 hover:text-primary-600 p-1 rounded-full hover:bg-gray-100 transition"
                    >
                      <RefreshCw className={`w-3 h-3 ${loadingPatients ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                <select 
                  required
                  value={newRecord.patientId}
                  onChange={(e) => setNewRecord({...newRecord, patientId: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary-500 outline-none text-sm font-bold text-gray-800 cursor-pointer"
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map(p => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.email}) {p.hasAppointment ? '• Recent Appointment' : ''}
                    </option>
                  ))}
                </select>

                {/* Quick select patient chips */}
                {patients.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {patients.map(p => (
                      <button
                        type="button"
                        key={p._id}
                        onClick={() => setNewRecord({...newRecord, patientId: p._id})}
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                          newRecord.patientId === p._id
                            ? 'bg-primary-600 text-white shadow-sm'
                            : 'bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-primary-600'
                        }`}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Record Title *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Annual Cardio Checkup"
                  value={newRecord.title}
                  onChange={(e) => setNewRecord({...newRecord, title: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary-500 outline-none text-sm font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Clinical Notes & Prescriptions (AES-256 Protected) *
                </label>
                <textarea 
                  required
                  rows={5}
                  value={newRecord.description}
                  onChange={(e) => setNewRecord({...newRecord, description: e.target.value})}
                  placeholder="Enter diagnostic impressions, prescribed medications, dosages..."
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary-500 outline-none text-sm font-medium"
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={submitting}
                className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Encrypt & Save to EHR</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientRecords;
