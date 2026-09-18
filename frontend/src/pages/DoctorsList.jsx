import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../api/axios';
import { User, Star, X, Calendar, Clock, HeartPulse, ShieldCheck, MapPin, Search, Filter, Sparkles, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
  
  const queryParams = new URLSearchParams(location.search);
  const initialSearch = queryParams.get('search') || '';
  const initialSpec = queryParams.get('specialization') || 'All';

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(initialSearch || (initialSpec !== 'All' ? initialSpec : ''));
  const [selectedSpecialty, setSelectedSpecialty] = useState(initialSpec);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  
  // Form state for booking
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('');
  const [booking, setBooking] = useState(false);
  const [success, setSuccess] = useState(false);

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
      setSearchTerm(spec);
    } else if (q) {
      setSearchTerm(q);
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
      }, 3000);
    } catch (error) {
      alert(error.response?.data?.message || 'Error booking appointment');
    } finally {
      setBooking(false);
    }
  };

  // Filter doctors by search query and category
  const filteredDoctors = doctors.filter(doctor => {
    const term = searchTerm.trim().toLowerCase();
    
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
    setSearchTerm('');
    setSelectedSpecialty('All');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans">
      {/* Hero Section matching Home Page Theme */}
      <div className="bg-gradient-to-b from-blue-50/80 via-indigo-50/40 to-slate-50 pt-28 pb-20 md:pt-32 md:pb-24 px-4 text-center relative overflow-hidden">
         <div className="relative z-10 max-w-5xl mx-auto">
            {/* Top Navigation Row */}
            <div className="flex items-center justify-between gap-4 mb-6">
              <Link 
                to="/"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-700 font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-slate-400" />
                <Home className="w-3.5 h-3.5 text-blue-600" />
                <span>Return to Home</span>
              </Link>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-blue-200/80 text-blue-700 font-semibold text-xs shadow-xs">
                <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
                <span>Certified Healthcare Specialists Directory</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight text-slate-900">
              Find Your{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                Specialist
              </span>
            </h1>
            <p className="text-slate-600 text-base md:text-lg font-medium max-w-2xl mx-auto">
               Access world-class healthcare with top-rated medical experts. Book your consultation in just a few clicks.
            </p>
         </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 -mt-10 relative z-20">
        {/* Search & Filters Box - Clean White Admin Style */}
        <div className="bg-white p-4 md:p-6 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-200/80 space-y-4 mb-10">
           <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                 <Search className="h-5 w-5 absolute left-4.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                 <input 
                   id="input-specialist-search"
                   type="text" 
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   placeholder="Search by doctor name, specialization, or email..." 
                   className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none font-semibold text-slate-900 placeholder-slate-400 transition-all text-sm md:text-base" 
                 />
                 {searchTerm && (
                   <button 
                     onClick={() => setSearchTerm('')}
                     className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors cursor-pointer"
                     title="Clear search"
                   >
                     <X className="h-4 w-4" />
                   </button>
                 )}
              </div>
              <button 
                onClick={() => {
                  const element = document.getElementById('specialist-results');
                  if (element) element.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-md shadow-blue-600/20 flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Search className="h-5 w-5" />
                <span>Search</span>
              </button>
           </div>

           {/* Specialty Filter Chips */}
           <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
              <div className="flex items-center text-xs font-bold text-slate-400 uppercase tracking-wider pl-1 mr-1 flex-shrink-0">
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
                        setSearchTerm('');
                      } else {
                        setSearchTerm(spec);
                      }
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 scale-105'
                        : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600'
                    }`}
                  >
                    {spec}
                  </button>
                );
              })}
           </div>
        </div>

        {/* Results Header */}
        <div id="specialist-results" className="flex justify-between items-center mb-6 px-2">
           <div>
             <h2 className="text-xl font-bold text-slate-900">Available Specialists</h2>
             <p className="text-xs text-slate-400 font-medium mt-0.5">
               Showing {filteredDoctors.length} {filteredDoctors.length === 1 ? 'doctor' : 'doctors'}
               {(searchTerm || selectedSpecialty !== 'All') && (
                 <span> matching your criteria</span>
               )}
             </p>
           </div>
           {(searchTerm || selectedSpecialty !== 'All') && (
             <button 
               onClick={clearFilters}
               className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
             >
               Reset Filters
             </button>
           )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-slate-400 text-sm font-medium">Finding available doctors...</p>
          </div>
        ) : filteredDoctors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDoctors.map(doctor => (
              <div key={doctor._id} className="group bg-white rounded-[2.5rem] border border-slate-200/80 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-500/40 transition-all duration-300 flex flex-col overflow-hidden">
                {/* Card Top */}
                <div className="p-8 pb-4 flex items-start justify-between">
                   <div className="h-20 w-20 rounded-[1.5rem] bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-3xl shadow-inner group-hover:scale-105 transition-transform duration-300 overflow-hidden border border-blue-100">
                      <img 
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent((doctor.name || 'Doctor').replace('Dr. ', ''))}&background=random&bold=true`} 
                        alt={doctor.name} 
                        className="h-full w-full object-cover" 
                      />
                   </div>
                   <div className="flex flex-col items-end">
                      <div className="flex items-center space-x-1 bg-amber-50 text-amber-700 border border-amber-200/60 px-3 py-1.5 rounded-xl font-bold text-xs">
                         <Star className="h-3.5 w-3.5 fill-current text-amber-500" />
                         <span>4.8</span>
                      </div>
                      <span className="text-[10px] font-black text-slate-300 mt-2 tracking-widest uppercase">1.2K Reviews</span>
                   </div>
                </div>

                {/* Card Body */}
                <div className="px-8 py-4 flex-1">
                   <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">{doctor.name}</h3>
                      <ShieldCheck className="h-5 w-5 text-blue-600 flex-shrink-0" />
                   </div>
                   <p className="text-blue-600 font-bold text-sm tracking-wide mb-4">{doctor.specialization || 'General Medicine'}</p>
                   
                   <div className="space-y-2.5">
                      <div className="flex items-center text-slate-500 text-sm font-medium">
                         <MapPin className="h-4 w-4 mr-2 text-slate-400 flex-shrink-0" />
                         <span>Healthcare City, Medical Hub</span>
                      </div>
                      <div className="flex items-center text-slate-500 text-sm font-medium">
                         <Clock className="h-4 w-4 mr-2 text-slate-400 flex-shrink-0" />
                         <span>{doctor.experience || 5}+ Years Experience • ${doctor.consultationFee || 100} Fee</span>
                      </div>
                   </div>

                   {/* Availability Preview */}
                   <div className="mt-6 pt-6 border-t border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Available Slots</p>
                      <div className="flex flex-wrap gap-2">
                        {doctor.availability?.length > 0 ? doctor.availability.slice(0, 3).map((av, i) => (
                          <span key={i} className="text-[10px] bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg font-bold border border-blue-100">
                            {av.day.substring(0,3)} {av.startTime}
                          </span>
                        )) : <span className="text-xs text-slate-400 font-medium">Slots on request</span>}
                      </div>
                   </div>
                </div>

                {/* Card Footer */}
                <div className="p-8 pt-4">
                   <button 
                     onClick={() => handleBookingStart(doctor)}
                     className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold text-base transition-all shadow-md shadow-blue-600/20 active:scale-95 flex items-center justify-center space-x-2 cursor-pointer"
                   >
                     <Calendar className="h-5 w-5" />
                     <span>Book Appointment</span>
                   </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] p-16 text-center border border-slate-200/80 shadow-sm">
            <Search className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-slate-800 mb-2">No Doctors Found</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto mb-6 font-medium">
              We couldn't find any medical specialists matching "<span className="font-semibold text-slate-700">{searchTerm}</span>". Try searching by another specialty or doctor name.
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition shadow-md shadow-blue-600/20 cursor-pointer"
            >
              Show All Doctors
            </button>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-200">
            <div className="bg-blue-600 p-8 md:p-10 text-white relative">
               <h2 className="text-2xl md:text-3xl font-black">Schedule Consultation</h2>
               <p className="text-blue-100 text-base md:text-lg mt-1 font-medium">Dr. {selectedDoctor.name} ({selectedDoctor.specialization || 'Specialist'})</p>
               <button onClick={() => setSelectedDoctor(null)} className="absolute top-8 right-8 bg-white/20 p-2 rounded-2xl hover:bg-white/30 transition-all cursor-pointer">
                  <X className="h-7 w-7 text-white" />
               </button>
            </div>
            
            <div className="p-8 md:p-10">
              {success ? (
                <div className="text-center py-12">
                  <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-[2rem] bg-emerald-100 text-emerald-600 mb-6">
                     <ShieldCheck className="h-10 w-10" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-3">Request Successful!</h3>
                  <p className="text-slate-500 font-medium text-base">Your appointment request has been sent for approval. You will receive a notification shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleBookSubmit} className="space-y-6">
                  {/* Slots Info */}
                  <div className="bg-blue-50/70 rounded-3xl p-6 border border-blue-100">
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-3 flex items-center">
                       <Clock className="h-4 w-4 mr-2" /> Verified Working Hours
                    </p>
                    <div className="flex flex-wrap gap-2.5">
                      {selectedDoctor.availability?.length > 0 ? selectedDoctor.availability.map((av, i) => (
                        <div key={i} className="bg-white text-blue-700 px-3.5 py-2 rounded-xl text-xs font-black shadow-xs border border-blue-100">
                          {av.day}: {av.startTime} - {av.endTime}
                        </div>
                      )) : <span className="text-sm text-slate-500 font-medium">General Hours: Mon-Fri (9:00 - 17:00)</span>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Preferred Date *</label>
                       <input 
                         type="date" required value={date} onChange={(e) => setDate(e.target.value)}
                         className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none font-bold text-sm text-slate-900"
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Preferred Time *</label>
                       <input 
                         type="time" required value={time} onChange={(e) => setTime(e.target.value)}
                         className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none font-bold text-sm text-slate-900"
                       />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Describe Your Condition *</label>
                     <textarea 
                       required value={reason} onChange={(e) => setReason(e.target.value)}
                       placeholder="Please briefly describe your symptoms or reason for visit..."
                       className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none font-semibold text-sm text-slate-900"
                       rows="3"
                     ></textarea>
                  </div>

                  <button 
                    type="submit" 
                    disabled={booking}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4.5 rounded-2xl text-lg font-black shadow-lg shadow-blue-600/20 transition-all flex justify-center items-center group cursor-pointer disabled:opacity-50"
                  >
                    {booking ? (
                      <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-white"></div>
                    ) : (
                      <span className="flex items-center group-hover:scale-102 transition-transform">
                         Send Booking Request <HeartPulse className="ml-3 h-5 w-5" />
                      </span>
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
