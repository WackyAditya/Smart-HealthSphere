import React, { useEffect, useState } from 'react';
import { Shield, PlusCircle, Trash2, Search, Clock, Calendar as CalendarIcon, X, Check, AlertCircle } from 'lucide-react';
import api from '../../api/axios';
import { useSearch } from '../../context/SearchContext';

const SPECIALTY_OPTIONS = [
  'Cardiology',
  'Dermatology',
  'Pediatrics',
  'Paediatrician',
  'Neurology',
  'Orthopedics',
  'General Medicine',
  'Psychiatry',
  'Ophthalmology',
  'Gynecology',
  'ENT Specialist'
];

const ManageDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const { searchTerm, setSearchTerm } = useSearch();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAvailModal, setShowAvailModal] = useState(false);

  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');
  
  const [newDoctor, setNewDoctor] = useState({
    name: '',
    email: '',
    password: '',
    specialization: 'General Medicine',
    customSpecialization: '',
    experience: '',
    consultationFee: ''
  });

  const [availability, setAvailability] = useState([]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users');
      setDoctors(res.data.filter(u => u.role === 'doctor'));
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    setModalError('');
    setModalSubmitting(true);

    const finalSpecialization = newDoctor.specialization === 'Other' 
      ? newDoctor.customSpecialization 
      : newDoctor.specialization;

    if (!finalSpecialization) {
      setModalError('Please specify a specialization');
      setModalSubmitting(false);
      return;
    }

    try {
      await api.post('/admin/doctors', {
        name: newDoctor.name.trim(),
        email: newDoctor.email.trim(),
        password: newDoctor.password,
        specialization: finalSpecialization,
        experience: Number(newDoctor.experience) || 0,
        consultationFee: Number(newDoctor.consultationFee) || 0
      });

      setShowAddModal(false);
      setNewDoctor({
        name: '',
        email: '',
        password: '',
        specialization: 'General Medicine',
        customSpecialization: '',
        experience: '',
        consultationFee: ''
      });
      setFeedbackMsg('Specialist profile created successfully!');
      setTimeout(() => setFeedbackMsg(''), 4000);
      fetchDoctors();
    } catch (error) {
      setModalError(error.response?.data?.message || 'Error adding doctor. Please check details.');
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleDeleteDoctor = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove Dr. ${name}? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/admin/users/${id}`);
      setDoctors(prev => prev.filter(d => d._id !== id));
      setFeedbackMsg(`Dr. ${name} was removed from the directory.`);
      setTimeout(() => setFeedbackMsg(''), 4000);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete doctor');
    }
  };

  const openAvailability = (doctor) => {
    setSelectedDoctor(doctor);
    setAvailability(doctor.availability || []);
    setShowAvailModal(true);
  };

  const addSlot = () => {
    setAvailability([...availability, { day: 'Monday', startTime: '09:00', endTime: '17:00' }]);
  };

  const removeSlot = (index) => {
    setAvailability(availability.filter((_, i) => i !== index));
  };

  const updateSlot = (index, field, value) => {
    const newAvail = [...availability];
    newAvail[index][field] = value;
    setAvailability(newAvail);
  };

  const saveAvailability = async () => {
    try {
      await api.patch(`/admin/doctors/${selectedDoctor._id}/availability`, { availability });
      setShowAvailModal(false);
      setFeedbackMsg(`Schedule updated for Dr. ${selectedDoctor.name}`);
      setTimeout(() => setFeedbackMsg(''), 4000);
      fetchDoctors();
    } catch (error) {
      alert('Error updating availability');
    }
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Filtered doctors list based on search term
  const filteredDoctors = doctors.filter(doc => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const nameMatch = doc.name?.toLowerCase().includes(term);
    const specMatch = doc.specialization?.toLowerCase().includes(term);
    const emailMatch = doc.email?.toLowerCase().includes(term);
    return nameMatch || specMatch || emailMatch;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Feedback Banner */}
      {feedbackMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-6 py-4 rounded-2xl flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center space-x-3">
            <Check className="h-5 w-5 text-emerald-600 flex-shrink-0" />
            <span className="font-semibold text-sm">{feedbackMsg}</span>
          </div>
          <button onClick={() => setFeedbackMsg('')} className="text-emerald-500 hover:text-emerald-700">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-[2.5rem] border border-indigo-50 shadow-sm gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Doctors Management</h1>
          <p className="text-gray-500 mt-1">Configure schedules, slots, and professional details.</p>
        </div>
        <button 
          id="btn-add-new-doctor"
          onClick={() => {
            setModalError('');
            setShowAddModal(true);
          }}
          className="bg-primary-600 hover:bg-primary-700 active:scale-95 text-white px-8 py-4 rounded-2xl font-bold flex items-center space-x-2 transition-all shadow-xl shadow-indigo-100 cursor-pointer"
        >
          <PlusCircle className="h-5 w-5" />
          <span>Add New Doctor</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4">
               <Shield className="h-6 w-6" />
            </div>
            <p className="text-gray-500 font-medium text-xs uppercase tracking-wider">Total Staff</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{doctors.length}</h3>
         </div>
         <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4">
               <Clock className="h-6 w-6" />
            </div>
            <p className="text-gray-500 font-medium text-xs uppercase tracking-wider">Active Slots</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">
               {doctors.reduce((acc, d) => acc + (d.availability?.length || 0), 0)}
            </h3>
         </div>
         <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
            <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 mb-4">
               <CalendarIcon className="h-6 w-6" />
            </div>
            <p className="text-gray-500 font-medium text-xs uppercase tracking-wider">Specialties</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">
               {[...new Set(doctors.map(d => d.specialization).filter(Boolean))].length}
            </h3>
         </div>
         
         {/* Add Profile Card - Fully Clickable */}
         <div 
           id="card-add-profile-quick"
           onClick={() => {
             setModalError('');
             setShowAddModal(true);
           }} 
           className="bg-primary-600 p-6 rounded-[2rem] shadow-lg shadow-indigo-100 text-white cursor-pointer hover:bg-primary-700 transition-all transform hover:-translate-y-0.5 active:scale-95 group"
         >
            <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center mb-4 group-hover:bg-white/30 transition-colors">
               <PlusCircle className="h-6 w-6 text-white" />
            </div>
            <p className="text-indigo-100 font-medium text-xs uppercase tracking-wider">Add Profile</p>
            <div className="flex items-center space-x-1 font-bold mt-1 text-white group-hover:translate-x-1 transition-transform">
               <span>Quick Create</span>
               <span>→</span>
            </div>
         </div>
      </div>

      {/* Directory */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
           <div>
             <h2 className="text-xl font-bold text-gray-800">Medical Directory</h2>
             <p className="text-xs text-gray-400 mt-0.5">
               Showing {filteredDoctors.length} of {doctors.length} specialists
             </p>
           </div>
           
           {/* Interactive Search Bar */}
           <div className="relative w-full md:w-80">
              <Search className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                id="input-doctor-search"
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, specialty, or email..." 
                className="w-full pl-11 pr-10 py-3 bg-gray-50 border border-transparent rounded-2xl text-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all" 
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')} 
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
           </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="text-gray-400 text-sm">Loading doctors directory...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                  <th className="px-8 py-5">Expert Profile</th>
                  <th className="px-8 py-5">Specialization</th>
                  <th className="px-8 py-5">Working Slots</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredDoctors.length > 0 ? (
                  filteredDoctors.map(doctor => (
                    <tr key={doctor._id} className="hover:bg-indigo-50/30 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-4">
                          <div className="h-14 w-14 rounded-2xl bg-primary-600 text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-indigo-100 flex-shrink-0">
                            {doctor.name ? doctor.name.charAt(0).toUpperCase() : 'D'}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{doctor.name}</p>
                            <p className="text-xs text-gray-400 font-medium">{doctor.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex flex-col">
                            <span className="text-gray-900 font-bold text-sm uppercase tracking-tight">{doctor.specialization || 'General Medicine'}</span>
                            <span className="text-[10px] text-gray-400 font-bold">{doctor.experience || 0} YRS EXPERIENCE • ${doctor.consultationFee || 0} FEE</span>
                         </div>
                      </td>
                      <td className="px-8 py-6">
                         <button 
                           onClick={() => openAvailability(doctor)}
                           className="flex items-center space-x-2 bg-indigo-50 text-primary-700 px-4 py-2 rounded-xl text-xs font-bold hover:bg-primary-600 hover:text-white transition-all border border-indigo-100"
                         >
                            <Clock className="h-3.5 w-3.5" />
                            <span>{doctor.availability?.length || 0} Slots Configured</span>
                         </button>
                      </td>
                      <td className="px-8 py-6 text-right">
                         <div className="flex justify-end space-x-3">
                            <button 
                              title="Edit Schedule"
                              onClick={() => openAvailability(doctor)} 
                              className="p-2.5 bg-gray-50 rounded-xl text-gray-400 hover:text-primary-600 hover:bg-indigo-50 transition-all cursor-pointer"
                            >
                               <Clock className="h-5 w-5" />
                            </button>
                            <button 
                              title="Remove Doctor"
                              onClick={() => handleDeleteDoctor(doctor._id, doctor.name)}
                              className="p-2.5 bg-gray-50 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                            >
                               <Trash2 className="h-5 w-5" />
                            </button>
                         </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-16">
                      <div className="max-w-md mx-auto space-y-3">
                        <Search className="h-12 w-12 text-gray-300 mx-auto" />
                        <p className="text-gray-600 font-semibold">No doctors found matching "{searchTerm}"</p>
                        <p className="text-xs text-gray-400">Try searching with a different name or medical specialty.</p>
                        <button 
                          onClick={() => setSearchTerm('')}
                          className="text-xs text-primary-600 hover:underline font-bold"
                        >
                          Clear Search Filter
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Doctor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl animate-scale-up border border-white/20">
            <div className="bg-primary-600 p-8 text-white relative">
               <h2 className="text-2xl md:text-3xl font-bold">Register Specialist</h2>
               <p className="text-indigo-100 text-sm mt-1 font-medium">Build your medical team by adding a new expert profile.</p>
               <button 
                 onClick={() => setShowAddModal(false)} 
                 className="absolute top-8 right-8 text-white/60 hover:text-white transition-colors p-1"
               >
                  <X className="h-7 w-7" />
               </button>
            </div>
            
            <form onSubmit={handleAddDoctor} className="p-8 space-y-5 bg-white max-h-[75vh] overflow-y-auto">
               {modalError && (
                 <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center space-x-2 text-sm">
                   <AlertCircle className="h-5 w-5 flex-shrink-0" />
                   <span>{modalError}</span>
                 </div>
               )}

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name *</label>
                     <input 
                       type="text" 
                       required 
                       placeholder="e.g. Dr. Jane Wilson"
                       className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary-500 focus:bg-white outline-none transition-all font-medium text-sm"
                       value={newDoctor.name} 
                       onChange={(e) => setNewDoctor({...newDoctor, name: e.target.value})} 
                     />
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address *</label>
                     <input 
                       type="email" 
                       required 
                       placeholder="doctor@healthcare.com"
                       className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary-500 focus:bg-white outline-none transition-all font-medium text-sm"
                       value={newDoctor.email} 
                       onChange={(e) => setNewDoctor({...newDoctor, email: e.target.value})} 
                     />
                  </div>
               </div>

               <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Account Password *</label>
                  <input 
                    type="password" 
                    required 
                    placeholder="Create a strong password (min 6 characters)"
                    minLength={6}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary-500 focus:bg-white outline-none transition-all font-medium text-sm"
                    value={newDoctor.password} 
                    onChange={(e) => setNewDoctor({...newDoctor, password: e.target.value})} 
                  />
               </div>

               <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Specialization *</label>
                  <select
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary-500 focus:bg-white outline-none transition-all font-medium text-sm"
                    value={newDoctor.specialization}
                    onChange={(e) => setNewDoctor({...newDoctor, specialization: e.target.value})}
                  >
                    {SPECIALTY_OPTIONS.map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                    <option value="Other">Other (Custom Specialization)</option>
                  </select>
               </div>

               {newDoctor.specialization === 'Other' && (
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Specify Specialization *</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. Oncologist, Endocrinologist"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary-500 focus:bg-white outline-none transition-all font-medium text-sm"
                      value={newDoctor.customSpecialization} 
                      onChange={(e) => setNewDoctor({...newDoctor, customSpecialization: e.target.value})} 
                    />
                 </div>
               )}

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Experience (Years)</label>
                     <input 
                       type="number" 
                       min="0"
                       max="60"
                       placeholder="e.g. 8"
                       className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary-500 focus:bg-white outline-none transition-all font-medium text-sm"
                       value={newDoctor.experience} 
                       onChange={(e) => setNewDoctor({...newDoctor, experience: e.target.value})} 
                     />
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Session Fee ($)</label>
                     <input 
                       type="number" 
                       min="0"
                       placeholder="e.g. 150"
                       className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary-500 focus:bg-white outline-none transition-all font-medium text-sm"
                       value={newDoctor.consultationFee} 
                       onChange={(e) => setNewDoctor({...newDoctor, consultationFee: e.target.value})} 
                     />
                  </div>
               </div>

               <div className="pt-2">
                 <button 
                   type="submit" 
                   disabled={modalSubmitting}
                   className="w-full bg-primary-600 text-white py-4 rounded-2xl font-bold text-base hover:bg-primary-700 transition-all shadow-xl shadow-indigo-100 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                 >
                    {modalSubmitting ? 'Creating Profile...' : 'Complete Doctor Registration'}
                 </button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* Availability Modal */}
      {showAvailModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-scale-up border border-white/20">
            <div className="bg-indigo-600 p-8 text-white flex justify-between items-center">
               <div>
                  <h2 className="text-2xl font-bold">Configure Availability</h2>
                  <p className="text-indigo-100 text-sm font-medium mt-1">Dr. {selectedDoctor?.name}</p>
               </div>
               <button onClick={() => setShowAvailModal(false)} className="bg-white/20 p-2 rounded-xl hover:bg-white/30 transition-colors">
                  <X className="h-6 w-6" />
               </button>
            </div>
            
            <div className="p-8 bg-gray-50/50">
               <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 scrollbar-thin">
                  {availability.map((slot, index) => (
                    <div key={index} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-4 animate-fade-in">
                       <div className="flex-1 w-full">
                          <label className="text-[9px] font-black text-gray-400 uppercase ml-1">DAY</label>
                          <select 
                            className="w-full mt-1 px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500 font-bold text-gray-700"
                            value={slot.day} onChange={(e) => updateSlot(index, 'day', e.target.value)}
                          >
                             {days.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                       </div>
                       <div className="flex-1 w-full">
                          <label className="text-[9px] font-black text-gray-400 uppercase ml-1">FROM</label>
                          <input 
                            type="time" className="w-full mt-1 px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500 font-bold"
                            value={slot.startTime} onChange={(e) => updateSlot(index, 'startTime', e.target.value)}
                          />
                       </div>
                       <div className="flex-1 w-full">
                          <label className="text-[9px] font-black text-gray-400 uppercase ml-1">TO</label>
                          <input 
                            type="time" className="w-full mt-1 px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500 font-bold"
                            value={slot.endTime} onChange={(e) => updateSlot(index, 'endTime', e.target.value)}
                          />
                       </div>
                       <button onClick={() => removeSlot(index)} className="mt-4 md:mt-4 p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all cursor-pointer">
                          <Trash2 className="h-5 w-5" />
                       </button>
                    </div>
                  ))}
                  
                  {availability.length === 0 && (
                     <div className="text-center py-10 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                        <Clock className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                        <p className="text-gray-400 font-medium">No slots defined for this expert.</p>
                     </div>
                  )}
               </div>

               <button 
                 onClick={addSlot}
                 className="w-full mt-6 py-4 bg-white border-2 border-dashed border-indigo-200 text-primary-600 rounded-2xl font-bold hover:bg-indigo-50 hover:border-primary-500 transition-all flex items-center justify-center space-x-2 cursor-pointer"
               >
                  <PlusCircle className="h-5 w-5" />
                  <span>Add Work Slot</span>
               </button>

               <div className="flex space-x-4 mt-8 pt-6 border-t border-gray-100">
                  <button onClick={() => setShowAvailModal(false)} className="flex-1 py-4 font-bold text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">Discard</button>
                  <button onClick={saveAvailability} className="flex-[2] bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all cursor-pointer">Save Schedule Changes</button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageDoctors;

