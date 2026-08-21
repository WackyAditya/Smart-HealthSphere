import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Calendar, Clock, Edit } from 'lucide-react';

const ManageAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/admin/appointments');
      setAppointments(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await api.patch(`/appointments/${id}/status`, { status });
      fetchAppointments();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">System Appointments Ledger</h1>
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                  <th className="px-6 py-4 font-medium">Patient</th>
                  <th className="px-6 py-4 font-medium">Doctor</th>
                  <th className="px-6 py-4 font-medium">Date & Time</th>
                  <th className="px-6 py-4 font-medium">Action / Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {appointments.map(apt => (
                  <tr key={apt._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {apt.patient?.name || 'Unknown Patient'}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {apt.doctor?.name || 'Unknown Doctor'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                        <Calendar className="h-4 w-4 text-primary-500" />
                        <span>{new Date(apt.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span>{apt.time}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {apt.status === 'pending' ? (
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleStatusChange(apt._id, 'confirmed')}
                            className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleStatusChange(apt._id, 'cancelled')}
                            className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                          apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                          apt.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {apt.status.toUpperCase()}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {appointments.length === 0 && (
              <div className="text-center py-12 text-gray-500">No appointments in the system.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageAppointments;
