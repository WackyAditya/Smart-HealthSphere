import React, { useEffect, useState } from 'react';
import { 
  Clock, 
  PlusCircle, 
  Trash2, 
  Save, 
  CheckCircle2, 
  Calendar, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const Availability = () => {
  const { user } = useAuth();
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const fetchCurrentSchedule = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/doctors/${user?._id || user?.id}`);
        setAvailability(res.data.availability || []);
      } catch (error) {
        console.error('Error fetching doctor schedule:', error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchCurrentSchedule();
  }, [user]);

  const addSlot = () => {
    setAvailability([
      ...availability,
      { day: 'Monday', startTime: '09:00', endTime: '17:00' }
    ]);
  };

  const removeSlot = (index) => {
    setAvailability(availability.filter((_, i) => i !== index));
  };

  const updateSlot = (index, field, value) => {
    const updated = [...availability];
    updated[index][field] = value;
    setAvailability(updated);
  };

  const saveSchedule = async () => {
    setSaving(true);
    try {
      await api.patch('/doctors/availability/me', { availability });
      setFeedback('Your weekly consultation schedule has been saved successfully!');
      setTimeout(() => setFeedback(''), 4000);
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving availability');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Feedback Banner */}
      {feedback && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-6 py-4 rounded-2xl flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
            <span className="font-semibold text-sm">{feedback}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-indigo-50 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Working Hours & Availability</h1>
          <p className="text-gray-500 mt-1">Configure consultation time slots when patients can book appointments with you.</p>
        </div>
        <button
          onClick={saveSchedule}
          disabled={saving}
          className="bg-primary-600 hover:bg-primary-700 active:scale-95 text-white px-8 py-4 rounded-2xl font-bold flex items-center space-x-2 transition-all shadow-xl shadow-indigo-100 cursor-pointer disabled:opacity-50"
        >
          <Save className="h-5 w-5" />
          <span>{saving ? 'Saving...' : 'Save Schedule'}</span>
        </button>
      </div>

      {/* Schedule Container */}
      <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm space-y-6">
        {loading ? (
          <div className="p-16 flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {availability.map((slot, index) => (
                <div 
                  key={index}
                  className="bg-gray-50/70 p-6 rounded-3xl border border-gray-100 flex flex-col md:flex-row items-center gap-4 animate-fade-in"
                >
                  <div className="flex-1 w-full">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Day of Week</label>
                    <select
                      value={slot.day}
                      onChange={(e) => updateSlot(index, 'day', e.target.value)}
                      className="w-full mt-1 px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 font-bold text-gray-800 outline-none text-sm"
                    >
                      {DAYS.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex-1 w-full">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Start Time</label>
                    <input 
                      type="time"
                      value={slot.startTime}
                      onChange={(e) => updateSlot(index, 'startTime', e.target.value)}
                      className="w-full mt-1 px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 font-bold text-gray-800 outline-none text-sm"
                    />
                  </div>

                  <div className="flex-1 w-full">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">End Time</label>
                    <input 
                      type="time"
                      value={slot.endTime}
                      onChange={(e) => updateSlot(index, 'endTime', e.target.value)}
                      className="w-full mt-1 px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 font-bold text-gray-800 outline-none text-sm"
                    />
                  </div>

                  <button
                    onClick={() => removeSlot(index)}
                    className="mt-2 md:mt-5 p-3.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                    title="Remove Slot"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}

              {availability.length === 0 && (
                <div className="text-center py-12 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200">
                  <Clock className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="font-bold text-gray-700">No working hours defined yet.</p>
                  <p className="text-xs text-gray-400 mt-1">Add your available consultation slots so patients can book appointments with you.</p>
                </div>
              )}
            </div>

            <button
              onClick={addSlot}
              className="w-full py-4 bg-white border-2 border-dashed border-indigo-200 text-primary-600 rounded-2xl font-bold hover:bg-indigo-50 hover:border-primary-500 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <PlusCircle className="h-5 w-5" />
              <span>Add Time Slot</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Availability;
