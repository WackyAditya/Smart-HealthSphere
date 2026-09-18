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
  X
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
    <div className="w-full max-w-full space-y-5 overflow-x-hidden">
      {/* Top Header matching Admin Overview style, with Total Specialists integrated */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Available Specialists</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5">Browse verified medical doctors and schedule consultations.</p>
        </div>

        {/* Compact Total Specialists Stat Card (replaces wide metric row) */}
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl px-5 py-3 text-white shadow-md relative overflow-hidden flex items-center gap-3.5 flex-shrink-0">
          <div>
            <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-wider">Total Specialists</p>
            <h3 className="text-2xl font-extrabold">{doctors.length} Doctors</h3>
          </div>
          <HeartPulse className="h-7 w-7 text-white/30 flex-shrink-0" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <>
          {/* Search & Filter Bar Container - Compact size */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 space-y-3.5">
            <div className="flex flex-col md:flex-row gap-2.5">
              <div className="flex-1 relative">
                <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input 
                  type="text" 
                  value={localSearchTerm}
                  onChange={(e) => setLocalSearchTerm(e.target.value)}
                  placeholder="Search by doctor name, specialization, or email..." 
                  className="w-full pl-10 pr-9 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-sm font-medium text-gray-800 placeholder-gray-400"
                />
                {localSearchTerm && (
                  <button 
                    onClick={() => setLocalSearchTerm('')} 
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                    title="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Specialty Filter Chips - Wraps naturally to prevent horizontal overflow */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <div className="flex items-center text-[11px] font-bold text-gray-400 uppercase tracking-wider pr-1 flex-shrink-0">
                <Filter className="w-3 h-3 mr-1" /> Filters:
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
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-primary-600 text-white shadow-xs'
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
          <div className="flex justify-between items-center px-1 pt-1">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Specialist Directory</h2>
              <p className="text-[11px] text-gray-400">
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

          {/* Doctors Grid - Perfectly fitted, no horizontal scroll */}
          {filteredDoctors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filteredDoctors.map(doctor => (
                <div 
                  key={doctor._id} 
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Avatar and Rating */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="h-13 w-13 rounded-xl bg-indigo-50 flex items-center justify-center text-primary-600 font-bold text-xl shadow-inner overflow-hidden border border-indigo-100 flex-shrink-0">
                        <img 
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent((doctor.name || 'Doctor').replace('Dr. ', ''))}&background=random&bold=true`} 
                          alt={doctor.name} 
                          className="h-full w-full object-cover" 
                        />
                      </div>
                      <div className="flex items-center space-x-1 bg-amber-50 text-amber-600 px-2 py-0.5 rounded-md font-bold text-xs">
                        <Star className="h-3 w-3 fill-current" />
                        <span>4.8</span>
                      </div>
                    </div>

                    {/* Name & Specialization */}
                    <div className="flex items-center space-x-1.5 mb-0.5">
                      <h3 className="text-base font-bold text-gray-900 hover:text-primary-600 transition-colors truncate">{doctor.name}</h3>
                      <ShieldCheck className="h-4 w-4 text-primary-500 flex-shrink-0" />
                    </div>
                    <p className="text-primary-600 font-semibold text-xs mb-2.5">{doctor.specialization || 'General Medicine'}</p>

                    {/* Meta info */}
                    <div className="space-y-1 text-xs text-gray-500 mb-3">
                      <div className="flex items-center">
                        <MapPin className="h-3.5 w-3.5 mr-1.5 text-gray-400 flex-shrink-0" />
                        <span className="truncate">Healthcare City, Medical Hub</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3.5 w-3.5 mr-1.5 text-gray-400 flex-shrink-0" />
                        <span>{doctor.experience || 5}+ Yrs Exp • ${doctor.consultationFee || 100} Fee</span>
                      </div>
                    </div>

                    {/* Working slots preview */}
                    <div className="pt-2.5 border-t border-gray-50">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Available Slots</p>
                      <div className="flex flex-wrap gap-1">
                        {doctor.availability?.length > 0 ? doctor.availability.slice(0, 3).map((av, i) => (
                          <span key={i} className="text-[10px] bg-indigo-50 text-primary-700 px-2 py-0.5 rounded font-medium border border-indigo-100/60">
                            {av.day.substring(0,3)} {av.startTime}
                          </span>
                        )) : <span className="text-[11px] text-gray-400">General Hours (9:00 - 17:00)</span>}
                      </div>
                    </div>
                  </div>

                  {/* Card Action */}
                  <div className="mt-4 pt-3 border-t border-gray-50">
                    <button 
                      onClick={() => handleBookingStart(doctor)}
                      className="w-full bg-primary-600 hover:bg-primary-700 active:scale-95 text-white py-2.5 rounded-xl font-bold text-xs transition-all shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Book Consultation</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-10 text-center border border-gray-100 shadow-sm">
              <Search className="h-10 w-10 text-gray-300 mx-auto mb-2" />
              <h3 className="text-base font-bold text-gray-800 mb-1">No Doctors Found</h3>
              <p className="text-gray-500 text-xs max-w-md mx-auto mb-3">
                We couldn't find any medical specialists matching "<span className="font-semibold text-gray-700">{activeSearch}</span>". Try searching by another specialty or doctor name.
              </p>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-primary-600 text-white rounded-xl font-bold text-xs hover:bg-primary-700 transition shadow-xs cursor-pointer"
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
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-100 animate-scale-up">
            <div className="bg-primary-600 p-5 text-white relative">
              <h2 className="text-lg font-bold">Schedule Consultation</h2>
              <p className="text-indigo-100 text-xs mt-0.5 font-medium">Dr. {selectedDoctor.name} ({selectedDoctor.specialization || 'Specialist'})</p>
              <button 
                onClick={() => setSelectedDoctor(null)} 
                className="absolute top-5 right-5 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-5">
              {success ? (
                <div className="text-center py-6">
                  <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-2xl bg-green-100 text-green-600 mb-3">
                    <ShieldCheck className="h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Request Successful!</h3>
                  <p className="text-gray-500 text-xs">Your appointment request has been sent for approval. You will receive a notification shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleBookSubmit} className="space-y-3.5">
                  {/* Slots Info */}
                  <div className="bg-indigo-50/50 rounded-xl p-3 border border-indigo-100">
                    <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-1.5 flex items-center">
                      <Clock className="h-3 w-3 mr-1" /> Working Hours
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedDoctor.availability?.length > 0 ? selectedDoctor.availability.map((av, i) => (
                        <div key={i} className="bg-white text-primary-700 px-2.5 py-1 rounded text-xs font-semibold shadow-xs border border-indigo-100">
                          {av.day}: {av.startTime} - {av.endTime}
                        </div>
                      )) : <span className="text-xs text-gray-500">General Hours: Mon-Fri (9:00 - 17:00)</span>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1 block">Preferred Date *</label>
                      <input 
                        type="date" 
                        required 
                        value={date} 
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none font-medium text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1 block">Preferred Time *</label>
                      <input 
                        type="time" 
                        required 
                        value={time} 
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none font-medium text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1 block">Describe Your Condition *</label>
                    <textarea 
                      required 
                      value={reason} 
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Please briefly describe your symptoms or reason for visit..."
                      className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none font-medium text-xs"
                      rows="2.5"
                    ></textarea>
                  </div>

                  <button 
                    type="submit" 
                    disabled={booking}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex justify-center items-center cursor-pointer disabled:opacity-50"
                  >
                    {booking ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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
