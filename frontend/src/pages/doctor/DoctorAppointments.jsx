import React, { useEffect, useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Video, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Filter, 
  FileText, 
  User, 
  AlertCircle,
  Sparkles,
  Shield,
  X,
  ExternalLink
} from 'lucide-react';
import api from '../../api/axios';
import { useSearch } from '../../context/SearchContext';

const DoctorAppointments = () => {
  const { searchTerm, setSearchTerm } = useSearch();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApt, setSelectedApt] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [feedback, setFeedback] = useState('');

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/appointments/my-appointments');
      setAppointments(res.data);
    } catch (error) {
      console.error('Error fetching doctor appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.patch(`/appointments/${id}/status`, { status });
      setFeedback(`Appointment updated to ${status}.`);
      setTimeout(() => setFeedback(''), 4000);
      fetchAppointments();
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating status');
    }
  };

  const openDetails = (apt) => {
    setSelectedApt(apt);
    setShowDetailModal(true);
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
    if (!searchTerm.trim()) return matchesStatus;

    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      apt.patient?.name?.toLowerCase().includes(term) ||
      apt.patient?.email?.toLowerCase().includes(term) ||
      apt.reason?.toLowerCase().includes(term);

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
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

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-[2.5rem] border border-indigo-50 shadow-sm gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Doctor Appointments & Telemedicine</h1>
          <p className="text-gray-500 mt-1">Review scheduled consultations, approve bookings, and launch virtual video rooms.</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-80">
          <Search className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search patient, email, or notes..." 
            className="w-full pl-11 pr-10 py-3 bg-gray-50 border border-transparent rounded-2xl text-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === st 
                  ? 'bg-primary-600 text-white shadow-md shadow-indigo-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-primary-600'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Appointments List / Table */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center space-y-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
            <p className="text-gray-400 text-sm">Loading consultations...</p>
          </div>
        ) : filteredAppointments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                  <th className="px-8 py-5">Patient Information</th>
                  <th className="px-6 py-5">Schedule Date/Time</th>
                  <th className="px-6 py-5">Condition / AI Triage</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-8 py-5 text-right">Actions & Meet Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredAppointments.map(apt => (
                  <tr key={apt._id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-primary-600 flex items-center justify-center font-bold text-lg flex-shrink-0">
                          {apt.patient?.name ? apt.patient.name.charAt(0).toUpperCase() : 'P'}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{apt.patient?.name || 'Patient'}</p>
                          <p className="text-xs text-gray-400">{apt.patient?.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-6">
                      <div className="flex items-center space-x-2 text-sm font-semibold text-gray-800">
                        <Calendar className="h-4 w-4 text-primary-500" />
                        <span>{new Date(apt.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                        <Clock className="h-3.5 w-3.5 text-gray-400" />
                        <span>{apt.time}</span>
                      </div>
                    </td>

                    <td className="px-6 py-6">
                      <p className="text-xs font-semibold text-gray-800 line-clamp-1 max-w-xs">{apt.reason || 'General checkup'}</p>
                      {apt.triageResult?.triageLevel && (
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md mt-1 ${
                          apt.triageResult.triageLevel === 'Emergency' ? 'bg-red-100 text-red-700' :
                          apt.triageResult.triageLevel === 'Urgent' ? 'bg-amber-100 text-amber-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>{apt.triageResult.triageLevel} Priority</span>
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize inline-flex items-center gap-1 ${
                        apt.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700' :
                        apt.status === 'completed' ? 'bg-blue-50 text-blue-700' :
                        apt.status === 'cancelled' ? 'bg-red-50 text-red-700' :
                        'bg-amber-50 text-amber-700'
                      }`}>
                        {apt.status}
                      </span>
                    </td>

                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Live Join Video Meet Button */}
                        {apt.status === 'confirmed' && apt.telemedicineRoomUrl && (
                          <a 
                            href={apt.telemedicineRoomUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-black px-4 py-2 rounded-xl shadow-md shadow-emerald-100 flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <Video className="h-4 w-4 animate-pulse" />
                            <span>Join Video Call</span>
                          </a>
                        )}

                        {apt.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(apt._id, 'confirmed')}
                              className="px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(apt._id, 'cancelled')}
                              className="px-3 py-2 bg-red-50 text-red-700 hover:bg-red-600 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                            >
                              Decline
                            </button>
                          </>
                        )}

                        {apt.status === 'confirmed' && (
                          <button
                            onClick={() => handleStatusUpdate(apt._id, 'completed')}
                            className="px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                          >
                            Finish Visit
                          </button>
                        )}

                        <button 
                          onClick={() => openDetails(apt)}
                          className="px-3 py-2 bg-indigo-50 text-primary-700 hover:bg-primary-600 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center text-gray-400">
            <Calendar className="h-12 w-12 text-gray-200 mx-auto mb-2" />
            <p className="font-semibold text-gray-600">No appointments matching this filter.</p>
          </div>
        )}
      </div>

      {/* Appointment Detail Modal */}
      {showDetailModal && selectedApt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-scale-up border border-white/20">
            <div className="bg-primary-600 p-8 text-white relative">
              <h2 className="text-2xl font-bold">Consultation Overview</h2>
              <p className="text-indigo-100 text-xs mt-1">ID: {selectedApt._id}</p>
              <button 
                onClick={() => setShowDetailModal(false)}
                className="absolute top-8 right-8 text-white/70 hover:text-white p-1"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-8 space-y-4">
              <div className="bg-gray-50 p-4 rounded-2xl space-y-2">
                <p className="text-xs font-bold text-gray-400 uppercase">Patient</p>
                <p className="text-base font-bold text-gray-900">{selectedApt.patient?.name}</p>
                <p className="text-xs text-gray-500">{selectedApt.patient?.email}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <p className="text-xs font-bold text-gray-400 uppercase">Date</p>
                  <p className="text-sm font-bold text-gray-800">{new Date(selectedApt.date).toLocaleDateString()}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <p className="text-xs font-bold text-gray-400 uppercase">Time</p>
                  <p className="text-sm font-bold text-gray-800">{selectedApt.time}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl">
                <p className="text-xs font-bold text-gray-400 uppercase">Symptoms / Reason</p>
                <p className="text-sm text-gray-700 mt-1">{selectedApt.reason || 'No description provided.'}</p>
              </div>

              {selectedApt.telemedicineRoomUrl && (
                <div className="pt-2">
                  <a 
                    href={selectedApt.telemedicineRoomUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 transition"
                  >
                    <Video className="w-5 h-5" />
                    <span>Launch Telemedicine Room</span>
                    <ExternalLink className="w-4 h-4 ml-1" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;
