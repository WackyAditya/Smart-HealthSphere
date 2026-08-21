import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import { User, Star, X, Calendar, Clock, HeartPulse, ShieldCheck, MapPin, Search, Filter, Sparkles } from 'lucide-react';
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
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Hero Section - Seamless full bleed top */}
      <div className="bg-gradient-to-b from-indigo-700 via-primary-600 to-primary-700 pt-28 pb-32 md:pt-36 md:pb-40 px-4 text-center text-white relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-full opacity-15 pointer-events-none">
            <div className="absolute top-10 left-10 w-80 h-80 bg-white rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-300 rounded-full blur-3xl animate-pulse"></div>
         </div>
         
         <div className="relative z-10 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold text-xs mb-6">
              <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
              <span>Certified Healthcare Specialists Directory</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight text-white drop-shadow-sm">
              Find Your Specialist
            </h1>
            <p className="text-indigo-100 text-base md:text-lg font-medium opacity-90 max-w-2xl mx-auto">
               Access world-class healthcare with top-rated medical experts. Book your consultation in just a few clicks.
            </p>
         </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 -mt-14 relative z-20">
        {/* Search & Filters Box */}
        <div className="bg-white p-4 md:p-6 rounded-[2.5rem] shadow-xl shadow-indigo-100/70 border border-indigo-50 space-y-4 mb-10">
           <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                 <Search className="h-5 w-5 absolute left-4.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                 <input 
                   id="input-specialist-search"
                   type="text" 
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   placeholder="Search by doctor name, specialization, or email..." 
                   className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none font-medium text-gray-800 placeholder-gray-400 transition-all text-sm md:text-base" 
                 />
                 {searchTerm && (
                   <button 
                     onClick={() => setSearchTerm('')}
                     className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
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
                className="bg-primary-600 hover:bg-primary-700 active:scale-95 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-100 flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Search className="h-5 w-5" />
                <span>Search</span>
              </button>
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
                        setSearchTerm('');
                      } else {
                        setSearchTerm(spec);
                      }
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-primary-600 text-white shadow-md shadow-indigo-200 scale-105'
                        : 'bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-primary-600'
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
             <h2 className="text-xl font-bold text-gray-800">Available Specialists</h2>
             <p className="text-xs text-gray-400 mt-0.5">
               Showing {filteredDoctors.length} {filteredDoctors.length === 1 ? 'doctor' : 'doctors'}
               {(searchTerm || selectedSpecialty !== 'All') && (
                 <span> matching your criteria</span>
               )}
             </p>
           </div>
           {(searchTerm || selectedSpecialty !== 'All') && (
             <button 
               onClick={clearFilters}
               className="text-xs font-bold text-primary-600 hover:text-primary-700 hover:underline"
             >
               Reset Filters
             </button>
           )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="text-gray-400 text-sm font-medium">Finding available doctors...</p>
          </div>
        ) : filteredDoctors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDoctors.map(doctor => (
              <div key={doctor._id} className="group bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-100/60 transition-all duration-500 flex flex-col overflow-hidden">
                {/* Card Top */}
                <div className="p-8 pb-4 flex items-start justify-between">
                   <div className="h-20 w-20 rounded-[1.5rem] bg-indigo-50 flex items-center justify-center text-primary-600 font-bold text-3xl shadow-inner group-hover:scale-105 transition-transform duration-500 overflow-hidden">
                      <img 
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent((doctor.name || 'Doctor').replace('Dr. ', ''))}&background=random&bold=true`} 
                        alt={doctor.name} 
                        className="h-full w-full object-cover" 
                      />
                   </div>
                   <div className="flex flex-col items-end">
                      <div className="flex items-center space-x-1 bg-amber-50 text-amber-600 px-3 py-1.5 rounded-xl font-bold text-xs">
                         <Star className="h-3.5 w-3.5 fill-current" />
                         <span>4.8</span>
                      </div>
                      <span className="text-[10px] font-black text-gray-300 mt-2 tracking-widest uppercase">1.2K Reviews</span>
                   </div>
                </div>

                {/* Card Body */}
                <div className="px-8 py-4 flex-1">
                   <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-xl font-black text-gray-900 group-hover:text-primary-600 transition-colors">{doctor.name}</h3>
                      <ShieldCheck className="h-5 w-5 text-primary-500 flex-shrink-0" />
                   </div>
                   <p className="text-primary-600 font-bold text-sm tracking-wide mb-4">{doctor.specialization || 'General Medicine'}</p>
                   
                   <div className="space-y-2.5">
                      <div className="flex items-center text-gray-500 text-sm font-medium">
                         <MapPin className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                         <span>Healthcare City, Medical Hub</span>
                      </div>
                      <div className="flex items-center text-gray-500 text-sm font-medium">
                         <Clock className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                         <span>{doctor.experience || 5}+ Years Experience • ${doctor.consultationFee || 100} Fee</span>
                      </div>
                   </div>

                   {/* Availability Preview */}
                   <div className="mt-6 pt-6 border-t border-gray-50">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Available Slots</p>
                      <div className="flex flex-wrap gap-2">
                        {doctor.availability?.length > 0 ? doctor.availability.slice(0, 3).map((av, i) => (
                          <span key={i} className="text-[10px] bg-indigo-50 text-primary-700 px-3 py-1.5 rounded-lg font-bold border border-indigo-100/60">
                            {av.day.substring(0,3)} {av.startTime}
                          </span>
                        )) : <span className="text-xs text-gray-400">Slots on request</span>}
                      </div>
                   </div>
                </div>

                {/* Card Footer */}
                <div className="p-8 pt-4">
                   <button 
                     onClick={() => handleBookingStart(doctor)}
                     className="w-full bg-primary-600 text-white py-4 rounded-2xl font-black text-base hover:bg-primary-700 transition-all shadow-lg shadow-indigo-100 active:scale-95 flex items-center justify-center space-x-2 cursor-pointer"
                   >
                     <Calendar className="h-5 w-5" />
                     <span>Book Appointment</span>
                   </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] p-16 text-center border border-gray-100 shadow-sm">
            <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-gray-800 mb-2">No Doctors Found</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
              We couldn't find any medical specialists matching "<span className="font-semibold text-gray-700">{searchTerm}</span>". Try searching by another specialty or doctor name.
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-primary-600 text-white rounded-xl font-bold text-sm hover:bg-primary-700 transition shadow-md shadow-indigo-100 cursor-pointer"
            >
              Show All Doctors
            </button>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-scale-up border border-white/20">
            <div className="bg-primary-600 p-8 md:p-10 text-white relative">
               <h2 className="text-2xl md:text-3xl font-black">Schedule Consultation</h2>
               <p className="text-indigo-100 text-base md:text-lg mt-1">Dr. {selectedDoctor.name} ({selectedDoctor.specialization || 'Specialist'})</p>
               <button onClick={() => setSelectedDoctor(null)} className="absolute top-8 right-8 bg-white/20 p-2 rounded-2xl hover:bg-white/30 transition-all cursor-pointer">
                  <X className="h-7 w-7" />
               </button>
            </div>
            
            <div className="p-8 md:p-10">
              {success ? (
                <div className="text-center py-12 animate-fade-in">
                  <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-[2rem] bg-green-100 text-green-600 mb-6">
                     <ShieldCheck className="h-10 w-10" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-gray-900 mb-3">Request Successful!</h3>
                  <p className="text-gray-500 font-medium text-base">Your appointment request has been sent for approval. You will receive a notification shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleBookSubmit} className="space-y-6">
                  {/* Slots Info */}
                  <div className="bg-indigo-50/50 rounded-3xl p-6 border border-indigo-100">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3 flex items-center">
                       <Clock className="h-4 w-4 mr-2" /> Verified Working Hours
                    </p>
                    <div className="flex flex-wrap gap-2.5">
                      {selectedDoctor.availability?.length > 0 ? selectedDoctor.availability.map((av, i) => (
                        <div key={i} className="bg-white text-primary-700 px-3.5 py-2 rounded-xl text-xs font-black shadow-sm border border-indigo-100">
                          {av.day}: {av.startTime} - {av.endTime}
                        </div>
                      )) : <span className="text-sm text-gray-500">General Hours: Mon-Fri (9:00 - 17:00)</span>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Preferred Date *</label>
                       <input 
                         type="date" required value={date} onChange={(e) => setDate(e.target.value)}
                         className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none font-bold text-sm"
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Preferred Time *</label>
                       <input 
                         type="time" required value={time} onChange={(e) => setTime(e.target.value)}
                         className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none font-bold text-sm"
                       />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Describe Your Condition *</label>
                     <textarea 
                       required value={reason} onChange={(e) => setReason(e.target.value)}
                       placeholder="Please briefly describe your symptoms or reason for visit..."
                       className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none font-medium text-sm"
                       rows="3"
                     ></textarea>
                  </div>

                  <button 
                    type="submit" 
                    disabled={booking}
                    className="w-full bg-primary-600 text-white py-4.5 rounded-2xl text-lg font-black shadow-xl shadow-indigo-100 hover:bg-primary-700 transition-all flex justify-center items-center group cursor-pointer disabled:opacity-50"
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
