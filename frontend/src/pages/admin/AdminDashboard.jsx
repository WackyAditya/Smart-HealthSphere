import React, { useEffect, useState } from 'react';
import { Users, Activity, FileText, UserPlus, DollarSign } from 'lucide-react';
import api from '../../api/axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    totalRecords: 0,
    mockRevenue: 0
  });
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [analyticsRes, appointmentsRes] = await Promise.all([
        api.get('/admin/analytics'),
        api.get('/admin/appointments')
      ]);
      setStats(analyticsRes.data);
      setPendingRequests(appointmentsRes.data.filter(a => a.status === 'pending').slice(0, 5));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await api.patch(`/appointments/${id}/status`, { status });
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Admin Overview</h1>
          <p className="text-gray-500 mt-1">System-wide analytics and control center.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <p className="text-indigo-100 font-medium">Total Revenue</p>
                  <h3 className="text-4xl font-bold mt-2">${stats.mockRevenue.toLocaleString()}</h3>
                </div>
                <DollarSign className="h-10 w-10 text-white/30 absolute bottom-0 right-0" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center space-x-4">
              <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <Users className="h-7 w-7" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <h3 className="text-2xl font-bold text-gray-800">{stats.totalUsers}</h3>
                <p className="text-xs text-gray-400 mt-1">{stats.totalPatients} Patients, {stats.totalDoctors} Doctors</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center space-x-4">
              <div className="h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <Activity className="h-7 w-7" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Appointments</p>
                <h3 className="text-2xl font-bold text-gray-800">{stats.totalAppointments}</h3>
              </div>
            </div>
          </div>

          {/* New Section: Pending Requests */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mt-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">New Appointment Requests</h2>
              <button onClick={() => window.location.href='/admin/appointments'} className="text-primary-600 text-sm font-medium">View All</button>
            </div>
            
            {pendingRequests.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-gray-400 text-sm border-b border-gray-50">
                      <th className="pb-4 font-medium">Patient</th>
                      <th className="pb-4 font-medium">Doctor</th>
                      <th className="pb-4 font-medium">Date/Time</th>
                      <th className="pb-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {pendingRequests.map(req => (
                      <tr key={req._id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 font-medium text-gray-800">{req.patient?.name}</td>
                        <td className="py-4 text-gray-600">{req.doctor?.name}</td>
                        <td className="py-4 text-gray-500 text-sm">{new Date(req.date).toLocaleDateString()} at {req.time}</td>
                        <td className="py-4 text-right">
                          <div className="flex justify-end space-x-2">
                            <button 
                              onClick={() => handleStatusChange(req._id, 'confirmed')}
                              className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-lg hover:bg-green-200"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleStatusChange(req._id, 'cancelled')}
                              className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-lg hover:bg-red-200"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl">
                No pending requests at the moment.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
