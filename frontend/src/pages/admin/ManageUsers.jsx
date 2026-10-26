import React, { useEffect, useState } from 'react';
import { Shield, ShieldAlert, Trash2, CheckCircle2, UserCheck, UserX, X } from 'lucide-react';
import api from '../../api/axios';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleApproval = async (id) => {
    try {
      await api.patch(`/admin/doctors/${id}/approval`);
      setFeedback('Doctor approval status updated');
      setTimeout(() => setFeedback(''), 3500);
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating approval');
    }
  };

  const toggleActiveStatus = async (user) => {
    const newStatus = user.isActive === false ? true : false;
    try {
      await api.patch(`/admin/users/${user._id}/status`, { isActive: newStatus });
      setFeedback(`User ${user.name} is now ${newStatus ? 'Active' : 'Deactivated'}`);
      setTimeout(() => setFeedback(''), 3500);
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating status');
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to delete user ${user.name}? This will remove their credentials.`)) return;
    try {
      await api.delete(`/admin/users/${user._id}`);
      setFeedback(`User ${user.name} removed successfully.`);
      setTimeout(() => setFeedback(''), 3500);
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || 'Error deleting user');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {feedback && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-6 py-3.5 rounded-2xl flex items-center justify-between text-xs font-bold animate-fade-in">
          <span>{feedback}</span>
          <button onClick={() => setFeedback('')} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex justify-between items-center mb-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
          <p className="text-gray-500 text-sm">Overview and security control for all registered users, specialists, and administrators.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase font-bold tracking-wider border-b border-gray-100">
                  <th className="px-6 py-4">User Details</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Joined Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {users.map(u => (
                  <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-800">
                      <div className="flex items-center space-x-3">
                         <div className="h-10 w-10 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center font-bold text-sm">
                            {/* Bug 25 Fix: Safe property access */}
                            {(u.name || 'User').charAt(0).toUpperCase()}
                         </div>
                         <div>
                            <p className="font-bold text-gray-900">{u.name || 'Unnamed'}</p>
                            <p className="text-xs text-gray-400">{u.email}</p>
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 capitalize">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                        u.role === 'doctor' ? 'bg-indigo-100 text-indigo-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {u.isActive === false ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                          Deactivated
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                    {/* Bug 26 Fix: Full User Administration Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {u.role === 'doctor' && !u.isApproved && (
                          <button 
                            onClick={() => toggleApproval(u._id)} 
                            className="px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 text-xs font-bold rounded-lg cursor-pointer"
                            title="Approve Doctor"
                          >
                            Approve
                          </button>
                        )}
                        <button
                          onClick={() => toggleActiveStatus(u)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition ${
                            u.isActive === false 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                          }`}
                          title={u.isActive === false ? 'Reactivate Account' : 'Deactivate Account'}
                        >
                          {u.isActive === false ? 'Activate' : 'Deactivate'}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
