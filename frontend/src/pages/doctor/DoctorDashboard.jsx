import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Video, 
  PlusCircle, 
  FileText, 
  ArrowRight, 
  AlertCircle, 
  Stethoscope, 
  Sparkles,
  Shield,
  Activity,
  X,
  Lock
} from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useSearch } from '../../context/SearchContext';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const { searchTerm } = useSearch();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [prescriptionForm, setPrescriptionForm] = useState({
    title: '',
    description: '',
    recordType: 'Prescription & Clinical Note',
    vitals: { bp: '', pulse: '', temp: '' }
  });
  const [submittingRecord, setSubmittingRecord] = useState(false);
  const [feedback, setFeedback] = useState('');

  const fetchDoctorData = async () => {
    try {
      setLoading(true);
      const [aptRes, recRes] = await Promise.all([
        api.get('/appointments/me'),
        api.get('/medical-records')
      ]);
      setAppointments(aptRes.data);
      setRecords(recRes.data);
    } catch (error) {
      console.error('Error loading doctor dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorData();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.patch(`/appointments/${id}/status`, { status });
      setFeedback(`Appointment marked as ${status}.`);
      setTimeout(() => setFeedback(''), 4000);
      fetchDoctorData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating appointment status');
    }
  };

  const handleOpenPrescription = (apt) => {
    setSelectedAppointment(apt);
    setPrescriptionForm({
      title: `Consultation with ${apt.patient?.name || 'Patient'}`,
      description: `Diagnosis & Prescription for visit on ${new Date(apt.date).toLocaleDateString()}:\n- \n- \nRecommended Follow-up: 1 week.`,
      recordType: 'Prescription & Clinical Note',
      vitals: { bp: '120/80', pulse: '72', temp: '98.6°F' }
    });
    setShowPrescriptionModal(true);
  };

  const handleSavePrescription = async (e) => {
    e.preventDefault();
    if (!selectedAppointment) return;
    setSubmittingRecord(true);
    try {
      await api.post('/medical-records', {
        patientId: selectedAppointment.patient._id,
        title: prescriptionForm.title,
        description: prescriptionForm.description,
        recordType: prescriptionForm.recordType,
        vitals: prescriptionForm.vitals
      });
      setShowPrescriptionModal(false);
      setFeedback('Prescription & encrypted clinical notes recorded successfully!');
      setTimeout(() => setFeedback(''), 4000);
      fetchDoctorData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save clinical record');
    } finally {
      setSubmittingRecord(false);
    }
  };

  // Metrics calculations
  const todayStr = new Date().toDateString();
  const todayAppointments = appointments.filter(a => new Date(a.date).toDateString() === todayStr);
  const pendingRequests = appointments.filter(a => a.status === 'pending');
  const completedAppointments = appointments.filter(a => a.status === 'completed');
  const uniquePatients = new Set(appointments.map(a => a.patient?._id).filter(Boolean)).size;

  // Next upcoming confirmed appointment
  const nextAppointment = appointments.find(a => a.status === 'confirmed');

  // Filter appointments by global search
  const filteredAppointments = appointments.filter(a => {
    if (!searchTerm?.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      a.patient?.name?.toLowerCase().includes(term) ||
      a.patient?.email?.toLowerCase().includes(term) ||
      a.reason?.toLowerCase().includes(term) ||
      a.status?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Feedback Banner */}
      {feedback && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-6 py-4 rounded-2xl flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
            <span className="font-semibold text-sm">{feedback}</span>
          </div>
          <button onClick={() => setFeedback('')} className="text-emerald-500 hover:text-emerald-700">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-primary-700 via-indigo-600 to-purple-600 rounded-[2.5rem] p-8 md:p-10 text-white shadow-xl shadow-indigo-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold mb-3">
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Doctor Clinical Console</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold">
            Welcome, {user?.name?.startsWith('Dr.') ? user.name : `Dr. ${user?.name}`}
          </h1>
          <p className="text-indigo-100 text-sm md:text-base mt-1 max-w-xl">
            Manage your daily patient queues, conduct encrypted video teleconsultations, and record prescriptions.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap gap-3">
          <button 
            onClick={() => navigate('/doctor/appointments')}
            className="px-6 py-3.5 bg-white text-primary-700 font-bold rounded-2xl hover:bg-indigo-50 transition-all shadow-lg active:scale-95 text-sm flex items-center gap-2 cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>All Appointments</span>
          </button>
          <button 
            onClick={() => navigate('/doctor/availability')}
            className="px-6 py-3.5 bg-white/20 hover:bg-white/30 text-white font-bold rounded-2xl transition-all text-sm flex items-center gap-2 cursor-pointer backdrop-blur-md"
          >
            <Clock className="w-4 h-4" />
            <span>Working Slots</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-primary-600 flex-shrink-0">
            <Calendar className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Today's Queue</p>
            <h3 className="text-2xl font-black text-gray-900 mt-0.5">{todayAppointments.length}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="h-14 w-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 flex-shrink-0">
            <Clock className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending Requests</p>
            <h3 className="text-2xl font-black text-gray-900 mt-0.5">{pendingRequests.length}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="h-14 w-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Completed Visits</p>
            <h3 className="text-2xl font-black text-gray-900 mt-0.5">{completedAppointments.length}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="h-14 w-14 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 flex-shrink-0">
            <Users className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Patients</p>
            <h3 className="text-2xl font-black text-gray-900 mt-0.5">{uniquePatients}</h3>
          </div>
        </div>
      </div>

      {/* Featured Live Consultation Callout */}
      {nextAppointment && (
        <div className="bg-white rounded-[2.5rem] p-8 border-2 border-primary-200 shadow-lg shadow-indigo-100/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center space-x-5">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-md shadow-indigo-200">
              {nextAppointment.patient?.name ? nextAppointment.patient.name.charAt(0).toUpperCase() : 'P'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                  Next Scheduled Consultation
                </span>
                <span className="text-xs font-bold text-gray-400">
                  {new Date(nextAppointment.date).toLocaleDateString()} at {nextAppointment.time}
                </span>
              </div>
              <h3 className="text-2xl font-black text-gray-900 mt-1">{nextAppointment.patient?.name}</h3>
              <p className="text-xs text-gray-500 font-medium">Condition: {nextAppointment.reason || 'General Consultation'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {nextAppointment.telemedicineRoomUrl ? (
              <a 
                href={nextAppointment.telemedicineRoomUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 md:flex-initial bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black px-8 py-4 rounded-2xl shadow-lg shadow-emerald-100 transition-all flex items-center justify-center gap-2.5 active:scale-95 cursor-pointer text-sm md:text-base"
              >
                <Video className="h-5 w-5 animate-pulse" />
                <span>Join Video Meet</span>
              </a>
            ) : null}
            <button 
              onClick={() => handleOpenPrescription(nextAppointment)}
              className="bg-indigo-50 hover:bg-primary-600 hover:text-white text-primary-700 font-bold px-6 py-4 rounded-2xl transition-all border border-indigo-100 flex items-center gap-2 text-sm cursor-pointer"
            >
              <FileText className="h-4 w-4" />
              <span>Write Prescription</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Appointments & Encrypted EHR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Appointments Table (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b border-gray-50 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Patient Appointments</h2>
              <p className="text-xs text-gray-400 mt-0.5">Manage statuses and launch consultation rooms</p>
            </div>
            <button 
              onClick={() => navigate('/doctor/appointments')}
              className="text-xs font-bold text-primary-600 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {loading ? (
            <div className="p-16 flex justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
            </div>
          ) : filteredAppointments.length > 0 ? (
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                    <th className="px-8 py-4">Patient</th>
                    <th className="px-6 py-4">Date & Time</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-8 py-4 text-right">Consultation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredAppointments.slice(0, 6).map(apt => (
                    <tr key={apt._id} className="hover:bg-indigo-50/30 transition-colors">
                      <td className="px-8 py-5">
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{apt.patient?.name || 'Patient'}</p>
                          <p className="text-xs text-gray-400 truncate max-w-xs">{apt.reason || 'Routine checkup'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-xs">
                          <p className="font-bold text-gray-800">{new Date(apt.date).toLocaleDateString()}</p>
                          <p className="text-gray-400">{apt.time}</p>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize inline-flex items-center gap-1 ${
                          apt.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700' :
                          apt.status === 'completed' ? 'bg-blue-50 text-blue-700' :
                          apt.status === 'cancelled' ? 'bg-red-50 text-red-700' :
                          'bg-amber-50 text-amber-700'
                        }`}>
                          {apt.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {apt.status === 'pending' && (
                            <>
                              <button 
                                onClick={() => handleStatusUpdate(apt._id, 'confirmed')}
                                className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-xl text-xs font-bold transition-all"
                              >
                                Accept
                              </button>
                              <button 
                                onClick={() => handleStatusUpdate(apt._id, 'cancelled')}
                                className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-600 hover:text-white rounded-xl text-xs font-bold transition-all"
                              >
                                Decline
                              </button>
                            </>
                          )}

                          {apt.status === 'confirmed' && (
                            <>
                              {apt.telemedicineRoomUrl && (
                                <a 
                                  href={apt.telemedicineRoomUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Join Virtual Video Room"
                                  className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                                >
                                  <Video className="h-3.5 w-3.5" />
                                  <span>Join Meet</span>
                                </a>
                              )}
                              <button 
                                onClick={() => handleOpenPrescription(apt)}
                                title="Write Prescription"
                                className="p-1.5 bg-indigo-50 text-primary-700 rounded-xl hover:bg-primary-600 hover:text-white transition-all cursor-pointer"
                              >
                                <FileText className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleStatusUpdate(apt._id, 'completed')}
                                className="px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl text-xs font-bold transition-all"
                              >
                                Complete
                              </button>
                            </>
                          )}

                          {apt.status === 'completed' && (
                            <button 
                              onClick={() => handleOpenPrescription(apt)}
                              className="px-3 py-1.5 bg-indigo-50 text-primary-700 hover:bg-primary-600 hover:text-white rounded-xl text-xs font-bold transition-all"
                            >
                              Add Notes
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-gray-400">
              <Calendar className="h-12 w-12 mx-auto text-gray-200 mb-2" />
              <p className="text-sm">No appointments scheduled currently.</p>
            </div>
          )}
        </div>

        {/* Encrypted Clinical Records & Tools (1 Col) */}
        <div className="space-y-6">
          {/* Encrypted EHR Card */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-purple-50 rounded-2xl text-purple-600">
                  <Lock className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Encrypted EHR Vault</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">AES-256 Protected</p>
                </div>
              </div>
              <button 
                onClick={() => navigate('/doctor/patient-records')}
                className="text-xs font-bold text-primary-600 hover:underline"
              >
                All Records
              </button>
            </div>

            <div className="space-y-3">
              {records.slice(0, 4).map(rec => (
                <div key={rec._id} className="p-4 bg-gray-50 rounded-2xl hover:bg-indigo-50/50 transition-colors">
                  <div className="flex justify-between items-start">
                    <p className="text-xs font-bold text-gray-800">{rec.title}</p>
                    <span className="text-[10px] px-2 py-0.5 bg-purple-100 text-purple-700 rounded-lg font-bold">
                      {rec.recordType || 'Clinical'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {rec.decryptedDescription || rec.description}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-2">
                    Patient: {rec.patient?.name || 'Patient'} • {new Date(rec.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}

              {records.length === 0 && (
                <div className="text-center py-6 text-gray-400 text-xs">
                  No medical records logged yet.
                </div>
              )}
            </div>
          </div>

          {/* Quick Telemedicine Instructions */}
          <div className="bg-gradient-to-br from-indigo-500 to-primary-700 rounded-[2.5rem] p-8 text-white shadow-lg shadow-indigo-100">
            <div className="flex items-center space-x-2 text-indigo-200 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="h-4 w-4 text-yellow-300" />
              <span>Telehealth Instructions</span>
            </div>
            <h4 className="text-lg font-bold">Secure Virtual Clinic</h4>
            <p className="text-indigo-100 text-xs mt-2 leading-relaxed">
              Every confirmed booking automatically provisions an end-to-end encrypted WebRTC room. Patients and doctors can connect with HD video and audio without external software.
            </p>
          </div>
        </div>
      </div>

      {/* Prescription / Clinical Record Modal */}
      {showPrescriptionModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl animate-scale-up border border-white/20">
            <div className="bg-primary-600 p-8 text-white relative">
              <h2 className="text-2xl font-bold">Write Prescription & EHR</h2>
              <p className="text-indigo-100 text-xs mt-1">Patient: {selectedAppointment.patient?.name}</p>
              <button 
                onClick={() => setShowPrescriptionModal(false)}
                className="absolute top-8 right-8 text-white/70 hover:text-white p-1"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSavePrescription} className="p-8 space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Consultation Title</label>
                <input 
                  type="text" 
                  required
                  value={prescriptionForm.title}
                  onChange={(e) => setPrescriptionForm({...prescriptionForm, title: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary-500 outline-none text-sm font-semibold"
                />
              </div>

              {/* Vitals */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase">Blood Pressure</label>
                  <input 
                    type="text" 
                    placeholder="120/80"
                    value={prescriptionForm.vitals.bp}
                    onChange={(e) => setPrescriptionForm({
                      ...prescriptionForm, 
                      vitals: {...prescriptionForm.vitals, bp: e.target.value}
                    })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase">Pulse (BPM)</label>
                  <input 
                    type="text" 
                    placeholder="72"
                    value={prescriptionForm.vitals.pulse}
                    onChange={(e) => setPrescriptionForm({
                      ...prescriptionForm, 
                      vitals: {...prescriptionForm.vitals, pulse: e.target.value}
                    })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase">Body Temp</label>
                  <input 
                    type="text" 
                    placeholder="98.6°F"
                    value={prescriptionForm.vitals.temp}
                    onChange={(e) => setPrescriptionForm({
                      ...prescriptionForm, 
                      vitals: {...prescriptionForm.vitals, temp: e.target.value}
                    })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Diagnosis, Medications & Notes (AES-256 Encrypted)
                </label>
                <textarea 
                  required
                  rows={5}
                  value={prescriptionForm.description}
                  onChange={(e) => setPrescriptionForm({...prescriptionForm, description: e.target.value})}
                  placeholder="Enter medications, dosage instructions, and clinical advice..."
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary-500 outline-none text-sm font-medium"
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={submittingRecord}
                className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submittingRecord ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Save Encrypted Record</span>
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

export default DoctorDashboard;
