import React, { useEffect, useState } from 'react';
import { Calendar, Clock, CheckCircle, MoreHorizontal } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const COLORS = ['#4F46E5', '#F59E0B', '#EC4899'];

const PatientDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await api.get('/appointments/me');
        setAppointments(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchAppointments();
  }, []);

  const chartData = [
    { name: 'Pending', value: appointments.filter(a => a.status === 'pending').length },
    { name: 'Confirmed', value: appointments.filter(a => a.status === 'confirmed').length || 1 }, // default 1 to keep rendering
    { name: 'Cancelled', value: appointments.filter(a => a.status === 'cancelled').length },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Welcome Banner */}
        <div className="lg:col-span-1 bg-indigo-100 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-center">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-gray-800">
              {getGreeting()}, <span className="text-red-500">{user?.name || 'Rogar Curtis'}</span>
            </h2>
            <p className="text-sm text-gray-600 mt-2 max-w-xs">
              Whatever you do, do with determination. You have one life to live; do your work with passion and give your best.
            </p>
          </div>
        </div>

        {/* Stat Card 1 */}
        <div className="bg-primary-600 rounded-2xl p-6 text-white relative overflow-hidden flex flex-col justify-between">
          <div>
            <p className="text-indigo-200 text-sm font-medium">Total Appointments</p>
            <h3 className="text-4xl font-bold mt-2">{appointments.length}</h3>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-16 opacity-30">
             <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full fill-current">
                <path d="M0,50 C30,80 70,20 100,50 L100,100 L0,100 Z" />
             </svg>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium">Appointments Cancelled</p>
            <h3 className="text-4xl font-bold text-red-500 mt-2">
              {appointments.filter(a => a.status === 'cancelled').length}
            </h3>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-16 opacity-10 text-red-500">
             <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full stroke-current stroke-2 fill-none">
                <path d="M0,50 C30,30 70,70 100,50" />
             </svg>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        
        {/* Appointments List */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800">Recent Appointments</h3>
            <button className="text-primary-500 text-sm font-medium">See More</button>
          </div>
          
          <div className="w-full">
            <div className="grid grid-cols-4 text-sm font-medium text-gray-400 pb-4">
              <div className="col-span-2">Doctor Name</div>
              <div>Date</div>
              <div>Status</div>
            </div>
            
            <div className="space-y-3">
              {appointments.length > 0 ? appointments.slice(0, 5).map((apt) => {
                const isActive = apt.status === 'confirmed';
                return (
                  <div key={apt._id} className={`grid grid-cols-4 items-center p-3 rounded-xl transition-all ${isActive ? 'bg-primary-600 text-white shadow-lg shadow-indigo-200' : 'hover:bg-gray-50'}`}>
                    <div className="col-span-2 flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex-shrink-0">
                        <img src={`https://ui-avatars.com/api/?name=${apt.doctor?.name?.replace('Dr. ', '') || 'Doctor'}&background=random`} alt={apt.doctor?.name} className="h-full w-full rounded-full" />
                      </div>
                      <div>
                        <p className={`font-semibold ${isActive ? 'text-white' : 'text-gray-800'}`}>{apt.doctor?.name || 'Doctor'}</p>
                        <p className={`text-xs ${isActive ? 'text-indigo-200' : 'text-gray-400'}`}>{apt.time}</p>
                      </div>
                    </div>
                    <div className={`text-sm ${isActive ? 'text-white' : 'text-gray-600'}`}>
                      {new Date(apt.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                    <div>
                      {apt.status === 'completed' || apt.status === 'confirmed' ? (
                        <div className="h-8 w-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                          <CheckCircle className={`h-5 w-5 ${isActive ? 'text-white' : 'text-green-500'}`} />
                        </div>
                      ) : (
                        <div className={`text-xs font-semibold px-2 py-1 rounded-full w-fit ${apt.status === 'cancelled' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
                          {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              }) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No appointments scheduled yet.</p>
                  <button onClick={() => window.location.href='/doctors'} className="mt-4 btn-primary text-sm">Book an Appointment</button>
                </div>
              )}
            </div>
            <div className="text-center mt-6">
               <button className="text-primary-500 text-sm font-medium">More..</button>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800">Last day Patients Result</h3>
            <MoreHorizontal className="text-gray-400 h-5 w-5" />
          </div>
          
          <div className="flex-1 flex flex-col justify-center items-center relative">
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-gray-900">{appointments.length}</span>
              <span className="text-xs text-gray-400">Total</span>
            </div>
          </div>
          
          <div className="flex justify-between mt-6 text-xs font-medium text-gray-500">
            <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-[#4F46E5] mr-2"></div>Pending</div>
            <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-[#F59E0B] mr-2"></div>Confirmed</div>
            <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-[#EC4899] mr-2"></div>Cancelled</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
