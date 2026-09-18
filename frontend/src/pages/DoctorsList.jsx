import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import { 
  HeartPulse, 
  ShieldCheck, 
  Star, 
  Clock, 
  MapPin, 
  Search, 
  Filter, 
  Calendar, 
  X, 
  Stethoscope, 
  Activity, 
  Users 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSearch } from '../context/SearchContext';

const SPECIALTY_CHIPS = [
  'All',
  'Cardiology',
  'Paediatrician',
  'Pediatrics',
  'Dermatology',
  'Neurology',
  'Orthopedics',
  'General Medicine',
  'Psychiatry',
  'Gynecology'
];

const DoctorsList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { searchTerm: globalSearchTerm } = useSearch();
  
  const queryParams = new URLSearchParams(location.search);
  const initialSearch = queryParams.get('search') || '';
  const initialSpec = queryParams.get('specialization') || 'All';

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [localSearchTerm, setLocalSearchTerm] = useState(initialSearch || (initialSpec !== 'All' ? initialSpec : ''));
  const [selectedSpecialty, setSelectedSpecialty] = useState(initialSpec);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  
  // Form state for booking
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('');
  const [booking, setBooking] = useState(false);
  const [success, setSuccess] = useState(false);

  // Sync local search term with global header search if typed in DashboardLayout header
  const activeSearch = globalSearchTerm || localSearchTerm;

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const res = await api.get('/doctors');
        setDoctors(res.data);
      } catch (error) {
        console.error('Error fetching doctors:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  // Update filter when query param changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const spec = params.get('specialization');
    const q = params.get('search');
    if (spec) {
      setSelectedSpecialty(spec);
      setLocalSearchTerm(spec);
    } else if (q) {
      setLocalSearchTerm(q);
    }
  }, [location.search]);

  const handleBookingStart = (doctor) => {
    if (!user || user.role !== 'patient') {
      navigate('/login?redirect=/doctors&message=Only patients can book appointments. Please log in with a patient account.');
      return;
    }
    setSelectedDoctor(doctor);
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    setBooking(true);
    try {
      await api.post('/appointments', {
        doctorId: selectedDoctor._id,
        date,
        time,
        reason
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setSelectedDoctor(null);
        setDate('');
        setTime('');
        setReason('');
      }, 2500);
    } catch (error) {
      alert(error.response?.data?.message || 'Error booking appointment');
    } finally {
      setBooking(false);
    }
  };

  // Filter doctors by search query and category
  const filteredDoctors = doctors.filter(doctor => {
    const term = activeSearch.trim().toLowerCase();
    
    // Specialty pill filter check
    const matchesCategory = 
      selectedSpecialty === 'All' || 
      doctor.specialization?.toLowerCase() === selectedSpecialty.toLowerCase() ||
      (selectedSpecialty === 'Pediatrics' && doctor.specialization?.toLowerCase() === 'paediatrician') ||
      (selectedSpecialty === 'Paediatrician' && doctor.specialization?.toLowerCase() === 'pediatrics');

    if (!term) return matchesCategory;

    const matchesSearch = 
      doctor.name?.toLowerCase().includes(term) ||
      doctor.specialization?.toLowerCase().includes(term) ||
      doctor.email?.toLowerCase().includes(term);

    return matchesCategory && matchesSearch;
  });

  const clearFilters = () => {
    setLocalSearchTerm('');
    setSelectedSpecialty('All');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header matching Admin Overview style */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Available Specialists</h1>
          <p className="text-gray-500 mt-1">Browse verified medical doctors and schedule consultations.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <>
          {/* Overview Metric Cards matching Admin Overview in Pic 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1 - Blue gradient */}
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <p className="text-indigo-100 font-medium">Total Specialists</p>
                  <h3 className="text-4xl font-bold mt-2">{doctors.length} Doctors</h3>
                </div>
                <p className="text-xs text-indigo-200 mt-2">Verified & Ready for Appointments</p>
                <HeartPulse className="h-10 w-10 text-white/30 absolute bottom-0 right-0" />
              </div>
            </div>

            {/* Card 2 - Blue icon circle */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center space-x-4">
              <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                <Stethoscope className="h-7 w-7" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Clinical Specialties</p>
                <h3 className="text-2xl font-bold text-gray-800">{SPECIALTY_CHIPS.length - 1} Departments</h3>
                <p className="text-xs text-gray-400 mt-1">Cardiology, Pediatrics, Neurology & more</p>
              </div>
            </div>

            {/* Card 3 - Emerald icon circle */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center space-x-4">
              <div className="h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                <Activity className="h-7 w-7" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Telemedicine Ready</p>
                <h3 className="text-2xl font-bold text-gray-800">Instant Virtual Rooms</h3>
                <p className="text-xs text-gray-400 mt-1">WebRTC video consultation support</p>
              </div>
            </div>
          </div>

          {/* Search & Filter Bar Container matching Pic 1 container style */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input 
                  type="text" 
                  value={localSearchTerm}
                  onChange={(e) => setLocalSearchTerm(e.target.value)}
                  placeholder="Search by doctor name, specialization, or email..." 
                  className="w-full pl-11 pr-10 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-sm font-medium text-gray-800 placeholder-gray-400"
                />
                {localSearchTerm && (
                  <button 
                    onClick={() => setLocalSearchTerm('')} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                    title="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Specialty Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
              <div className="flex items-center text-xs font-bold text-gray-400 uppercase tracking-wider pl-1 mr-1 flex-shrink-0">
                <Filter className="w-3.5 h-3.5 mr-1" /> Filters:
              </div>
              {SPECIALTY_CHIPS.map((spec) => {
                const isActive = selectedSpecialty.toLowerCase() === spec.toLowerCase();
                return (
                  <button
                    key={spec}
                    onClick={() => {
                      setSelectedSpecialty(spec);
                      if (spec === 'All') {
                        setLocalSearchTerm('');
                      } else {
                        setLocalSearchTerm(spec);
                      }
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-primary-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-primary-600'
                    }`}
                  >
                    {spec}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Results Summary Header */}
          <div className="flex justify-between items-center px-1">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Specialist Directory</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Showing {filteredDoctors.length} {filteredDoctors.length === 1 ? 'doctor' : 'doctors'}
                {(activeSearch || selectedSpecialty !== 'All') && (
                  <span> matching your criteria</span>
                )}
              </p>
            </div>
            {(activeSearch || selectedSpecialty !== 'All') && (
              <button 
                onClick={clearFilters}
                className="text-xs font-bold text-primary-600 hover:text-primary-700 hover:underline cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* Doctors Grid */}
          {filteredDoctors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.map(doctor => (
                <div 
                  key={doctor._id} 
                  className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Avatar and Rating */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="h-16 w-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-primary-600 font-bold text-2xl shadow-inner overflow-hidden border border-indigo-100">
                        <img 
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent((doctor.name || 'Doctor').replace('Dr. ', ''))}&background=random&bold=true`} 
                          alt={doctor.name} 
                          className="h-full w-full object-cover" 
                        />
                      </div>
                      <div className="flex items-center space-x-1 bg-amber-50 text-amber-600 px-2.5 py-1 rounded-lg font-bold text-xs">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        <span>4.8</span>
                      </div>
                    </div>

                    {/* Name & Specialization */}
                    <div className="flex items-center space-x-1.5 mb-1">
                      <h3 className="text-lg font-bold text-gray-900 hover:text-primary-600 transition-colors">{doctor.name}</h3>
                      <ShieldCheck className="h-4 w-4 text-primary-500 flex-shrink-0" />
                    </div>
                    <p className="text-primary-600 font-semibold text-xs mb-3">{doctor.specialization || 'General Medicine'}</p>

                    {/* Meta info */}
                    <div className="space-y-1.5 text-xs text-gray-500 mb-4">
                      <div className="flex items-center">
                        <MapPin className="h-3.5 w-3.5 mr-2 text-gray-400 flex-shrink-0" />
                        <span>Healthcare City, Medical Hub</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3.5 w-3.5 mr-2 text-gray-400 flex-shrink-0" />
                        <span>{doctor.experience || 5}+ Yrs Exp • ${doctor.consultationFee || 100} Consultation Fee</span>
                      </div>
                    </div>

                    {/* Working slots preview */}
                    <div className="pt-3 border-t border-gray-50">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Available Slots</p>
                      <div className="flex flex-wrap gap-1.5">
                        {doctor.availability?.length > 0 ? doctor.availability.slice(0, 3).map((av, i) => (
                          <span key={i} className="text-[10px] bg-indigo-50 text-primary-700 px-2.5 py-1 rounded-md font-medium border border-indigo-100/60">
                            {av.day.substring(0,3)} {av.startTime}
                          </span>
                        )) : <span className="text-xs text-gray-400">General Hours (9:00 - 17:00)</span>}
                      </div>
                    </div>
                  </div>

                  {/* Card Action */}
                  <div className="mt-6 pt-4 border-t border-gray-50">
                    <button 
                      onClick={() => handleBookingStart(doctor)}
                      className="w-full bg-primary-600 hover:bg-primary-700 active:scale-95 text-white py-3 rounded-xl font-bold text-sm transition-all shadow-sm flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <Calendar className="h-4 w-4" />
                      <span>Book Consultation</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-800 mb-1">No Doctors Found</h3>
              <p className="text-gray-500 text-xs max-w-md mx-auto mb-4">
                We couldn't find any medical specialists matching "<span className="font-semibold text-gray-700">{activeSearch}</span>". Try searching by another specialty or doctor name.
              </p>
              <button
                onClick={clearFilters}
                className="px-5 py-2.5 bg-primary-600 text-white rounded-xl font-bold text-xs hover:bg-primary-700 transition shadow-sm cursor-pointer"
              >
                Show All Doctors
              </button>
            </div>
          )}
        </>
      )}

      {/* Schedule Consultation Modal matching Admin Dashboard modal styling */}
      {selectedDoctor && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl border border-gray-100 animate-scale-up">
            <div className="bg-primary-600 p-6 text-white relative">
              <h2 className="text-xl font-bold">Schedule Consultation</h2>
              <p className="text-indigo-100 text-sm mt-0.5 font-medium">Dr. {selectedDoctor.name} ({selectedDoctor.specialization || 'Specialist'})</p>
              <button 
                onClick={() => setSelectedDoctor(null)} 
                className="absolute top-6 right-6 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition cursor-pointer"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              {success ? (
                <div className="text-center py-8">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-green-100 text-green-600 mb-4">
                    <ShieldCheck className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Request Successful!</h3>
                  <p className="text-gray-500 text-sm">Your appointment request has been sent for approval. You will receive a notification shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleBookSubmit} className="space-y-4">
                  {/* Slots Info */}
                  <div className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100">
                    <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-2 flex items-center">
                      <Clock className="h-3.5 w-3.5 mr-1.5" /> Working Hours
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedDoctor.availability?.length > 0 ? selectedDoctor.availability.map((av, i) => (
                        <div key={i} className="bg-white text-primary-700 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs border border-indigo-100">
                          {av.day}: {av.startTime} - {av.endTime}
                        </div>
                      )) : <span className="text-xs text-gray-500">General Hours: Mon-Fri (9:00 - 17:00)</span>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-1 block">Preferred Date *</label>
                      <input 
                        type="date" 
                        required 
                        value={date} 
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none font-medium text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-1 block">Preferred Time *</label>
                      <input 
                        type="time" 
                        required 
                        value={time} 
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none font-medium text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-1 block">Describe Your Condition *</label>
                    <textarea 
                      required 
                      value={reason} 
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Please briefly describe your symptoms or reason for visit..."
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none font-medium text-sm"
                      rows="3"
                    ></textarea>
                  </div>

                  <button 
                    type="submit" 
                    disabled={booking}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3.5 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex justify-center items-center cursor-pointer disabled:opacity-50"
                  >
                    {booking ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <span>Submit Consultation Request</span>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorsList;
