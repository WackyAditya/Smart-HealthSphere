import React, { useEffect, useState, useMemo } from 'react';
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
  AlertTriangle,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSearch } from '../context/SearchContext';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Helper to convert time string (e.g. "09:00", "09:30 AM", "17:30", "5:30 PM") into minutes from midnight
const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return null;
  const str = timeStr.trim().toUpperCase();
  const isPM = str.includes('PM');
  const isAM = str.includes('AM');
  const clean = str.replace(/[AP]M/, '').trim();
  const [hStr, mStr] = clean.split(':');
  let hours = parseInt(hStr, 10);
  const minutes = parseInt(mStr || '0', 10);
  if (isNaN(hours) || isNaN(minutes)) return null;

  if (isPM && hours < 12) hours += 12;
  if (isAM && hours === 12) hours = 0;

  return hours * 60 + minutes;
};

const formatMinutesToTime = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const hPad = String(hours).padStart(2, '0');
  const mPad = String(mins).padStart(2, '0');
  return `${hPad}:${mPad}`;
};

const formatTimeTo12Hour = (time24) => {
  const mins = parseTimeToMinutes(time24);
  if (mins === null) return time24;
  const hours = Math.floor(mins / 60);
  const m = mins % 60;
  const period = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
};

const getDayNameFromDateStr = (dateStr) => {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return DAYS_OF_WEEK[dt.getDay()];
};

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
  const [fetchError, setFetchError] = useState('');
  const [localSearchTerm, setLocalSearchTerm] = useState(initialSearch || (initialSpec !== 'All' ? initialSpec : ''));
  const [selectedSpecialty, setSelectedSpecialty] = useState(initialSpec);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  
  // Form state for booking
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('');
  const [booking, setBooking] = useState(false);
  const [success, setSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Sync local search term with global header search if typed in DashboardLayout header
  const activeSearch = globalSearchTerm || localSearchTerm;

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setFetchError('');
      const res = await api.get('/doctors');
      setDoctors(res.data || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setFetchError(error.response?.data?.message || 'Failed to load doctors list. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

  // When date changes or doctor changes, fetch already-booked slots
  useEffect(() => {
    if (!selectedDoctor || !date) {
      setBookedSlots([]);
      return;
    }

    const fetchBooked = async () => {
      try {
        setLoadingSlots(true);
        const res = await api.get(`/appointments/doctor/${selectedDoctor._id}/booked-slots?date=${date}`);
        setBookedSlots(res.data || []);
      } catch (err) {
        console.error('Failed to load booked slots:', err);
        setBookedSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchBooked();
  }, [selectedDoctor, date]);

  // Doctor availability calculations
  const dayName = getDayNameFromDateStr(date);
  const docAvailability = selectedDoctor?.availability || [];
  const daySchedule = docAvailability.filter(
    av => av.day?.toLowerCase() === dayName?.toLowerCase()
  );

  const isDayAvailable = !date || docAvailability.length === 0 || daySchedule.length > 0;
  const availableDaysList = [...new Set(docAvailability.map(av => av.day))];

  // Generate 30-minute time slots for the chosen day
  const generatedTimeSlots = useMemo(() => {
    if (!date || !isDayAvailable) return [];
    
    const activeSlots = daySchedule.length > 0 
      ? daySchedule 
      : [{ startTime: '09:00', endTime: '17:00' }];

    const slots = [];
    activeSlots.forEach(range => {
      const startMin = parseTimeToMinutes(range.startTime) || 540;
      const endMin = parseTimeToMinutes(range.endTime) || 1020;
      for (let m = startMin; m <= endMin; m += 30) {
        slots.push({
          time24: formatMinutesToTime(m),
          time12: formatTimeTo12Hour(formatMinutesToTime(m)),
          minutes: m
        });
      }
    });

    // Remove duplicates and sort chronologically
    const unique = [];
    const seen = new Set();
    slots.sort((a, b) => a.minutes - b.minutes).forEach(s => {
      if (!seen.has(s.time12)) {
        seen.add(s.time12);
        unique.push(s);
      }
    });
    return unique;
  }, [date, daySchedule, isDayAvailable]);

  const isSlotBooked = (slot) => {
    if (!bookedSlots || bookedSlots.length === 0) return false;
    const sMin = parseTimeToMinutes(slot.time12);
    return bookedSlots.some(b => parseTimeToMinutes(b) === sMin);
  };

  const handleBookingStart = (doctor) => {
    if (!user || user.role !== 'patient') {
      navigate('/login?redirect=/doctors&message=Only patients can book appointments. Please log in with a patient account.');
      return;
    }
    const triageData = location.state?.triageResult;
    if (triageData && !reason) {
      setReason(`AI Triage [${triageData.triageLevel} - Score: ${triageData.riskScore}]: ${triageData.symptomsEvaluated || ''}`);
    }
    setSelectedDoctor(doctor);
    setDate('');
    setTime('');
    setBookingError('');
    setSuccess(false);
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    setBookingError('');

    if (!date) {
      setBookingError('Please choose a consultation date.');
      return;
    }

    if (!isDayAvailable) {
      setBookingError(`Dr. ${selectedDoctor.name} is not available on ${dayName}s. Available days: ${availableDaysList.join(', ')}.`);
      return;
    }

    if (!time) {
      setBookingError('Please select an available time slot.');
      return;
    }

    // Verify time is inside doctor's consultation hours
    const reqMinutes = parseTimeToMinutes(time);
    if (reqMinutes === null) {
      setBookingError('Please choose a valid time slot.');
      return;
    }

    const activeSlots = daySchedule.length > 0 
      ? daySchedule 
      : [{ startTime: '09:00', endTime: '17:00' }];

    const isInside = activeSlots.some(range => {
      const sMin = parseTimeToMinutes(range.startTime) || 540;
      const eMin = parseTimeToMinutes(range.endTime) || 1020;
      return reqMinutes >= sMin && reqMinutes <= eMin;
    });

    if (!isInside) {
      const rangesStr = activeSlots.map(s => `${s.startTime} - ${s.endTime}`).join(', ');
      setBookingError(`Selected time (${time}) is outside Dr. ${selectedDoctor.name}'s consultation hours on ${dayName} (${rangesStr}).`);
      return;
    }

    // Verify slot is not already booked
    const alreadyBooked = bookedSlots.some(b => parseTimeToMinutes(b) === reqMinutes);
    if (alreadyBooked) {
      setBookingError(`This time slot (${time}) is already booked. Please choose another time.`);
      return;
    }

    setBooking(true);
    try {
      await api.post('/appointments', {
        doctorId: selectedDoctor._id,
        date,
        time,
        reason,
        triageResult: location.state?.triageResult || null
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setSelectedDoctor(null);
        setDate('');
        setTime('');
        setReason('');
        setBookingError('');
      }, 2500);
    } catch (error) {
      setBookingError(error.response?.data?.message || 'Error booking appointment. Please try again.');
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
          {fetchError && doctors.length === 0 ? (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center text-rose-800 space-y-3">
              <AlertTriangle className="h-8 w-8 text-rose-600 mx-auto" />
              <h3 className="font-bold text-sm">Unable to load specialists</h3>
              <p className="text-xs text-rose-600">{fetchError}</p>
              <button
                onClick={fetchDoctors}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Retry Connection
              </button>
            </div>
          ) : (
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
          )}

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
                <form onSubmit={handleBookSubmit} className="space-y-4">
                  {bookingError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-start gap-2 font-medium animate-shake">
                      <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5 text-rose-600" />
                      <span>{bookingError}</span>
                    </div>
                  )}

                  {/* Working Hours Summary */}
                  <div className="bg-indigo-50/50 rounded-2xl p-3.5 border border-indigo-100">
                    <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-1.5 flex items-center">
                      <Clock className="h-3 w-3 mr-1" /> Doctor's Weekly Availability
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedDoctor.availability?.length > 0 ? selectedDoctor.availability.map((av, i) => (
                        <div key={i} className="bg-white text-primary-700 px-2.5 py-1 rounded-lg text-xs font-semibold shadow-2xs border border-indigo-100 flex items-center gap-1">
                          <span className="font-bold">{av.day}:</span> {av.startTime} - {av.endTime}
                        </div>
                      )) : <span className="text-xs text-gray-500">General Consultation: Mon-Fri (09:00 - 17:00)</span>}
                    </div>
                  </div>

                  {/* Preferred Date */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-primary-600" /> Preferred Date *
                      </label>
                      {date && dayName && (
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                          isDayAvailable 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {dayName} {isDayAvailable ? '• Available' : '• Unavailable'}
                        </span>
                      )}
                    </div>
                    <input 
                      type="date" 
                      required 
                      min={new Date().toISOString().split('T')[0]}
                      value={date} 
                      onChange={(e) => {
                        setDate(e.target.value);
                        setTime('');
                        setBookingError('');
                      }}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none font-semibold text-xs text-gray-800 cursor-pointer shadow-2xs"
                    />
                  </div>

                  {/* Unavailable Day Warning */}
                  {date && !isDayAvailable && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2 font-medium">
                      <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Dr. {selectedDoctor.name} does not have slots on {dayName}s.</p>
                        <p className="text-[11px] text-amber-800 mt-0.5">
                          Available consultation days: <strong className="font-extrabold">{availableDaysList.join(', ')}</strong>. Please pick another date above.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Easy Time Slot Selection (Interactive Chips) */}
                  {date && isDayAvailable && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-primary-600" /> Select Consultation Time *
                        </label>
                        {time && (
                          <span className="text-[11px] font-extrabold text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded-lg border border-primary-200 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-primary-600" /> Selected: {time}
                          </span>
                        )}
                      </div>

                      {loadingSlots ? (
                        <div className="flex items-center justify-center p-6 bg-gray-50 rounded-xl border border-gray-100">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></div>
                          <span className="text-xs text-gray-500 font-medium">Checking live schedule...</span>
                        </div>
                      ) : generatedTimeSlots.length > 0 ? (
                        <div className="space-y-2">
                          <div className="max-h-36 overflow-y-auto p-1 border border-gray-100 rounded-xl bg-gray-50/60">
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                              {generatedTimeSlots.map((slot, i) => {
                                const booked = isSlotBooked(slot);
                                const isSelected = time === slot.time12 || time === slot.time24;
                                return (
                                  <button
                                    key={i}
                                    type="button"
                                    disabled={booked}
                                    onClick={() => {
                                      setTime(slot.time12);
                                      setBookingError('');
                                    }}
                                    className={`py-2 px-1.5 rounded-lg text-[11px] font-bold transition-all text-center flex flex-col items-center justify-center cursor-pointer border ${
                                      booked 
                                        ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-60'
                                        : isSelected
                                        ? 'bg-primary-600 border-primary-600 text-white shadow-md shadow-primary-500/25 scale-[1.02]'
                                        : 'bg-white border-gray-200 text-gray-700 hover:border-primary-400 hover:bg-primary-50/60'
                                    }`}
                                  >
                                    <span>{slot.time12}</span>
                                    {booked && <span className="text-[8px] text-rose-500 font-extrabold">Booked</span>}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                          <p className="text-[10px] text-gray-400 text-right">Click any open slot above to select</p>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500 italic p-3 bg-gray-50 rounded-xl">No slots available for this day.</p>
                      )}
                    </div>
                  )}

                  {!date && (
                    <div className="p-3 bg-indigo-50/30 border border-dashed border-indigo-200 rounded-xl text-center">
                      <p className="text-xs text-gray-500">
                        👉 Please choose a <strong className="text-primary-700 font-semibold">Preferred Date</strong> above to view available time slots.
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1 block">Describe Your Condition *</label>
                    <textarea 
                      required 
                      value={reason} 
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Please briefly describe your symptoms or reason for visit..."
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none font-medium text-xs text-gray-800 transition"
                      rows={3}
                    ></textarea>
                  </div>

                  <button 
                    type="submit" 
                    disabled={booking || !date || !time || !isDayAvailable}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex justify-center items-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
