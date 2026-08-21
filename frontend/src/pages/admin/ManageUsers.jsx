import React, { useEffect, useState } from 'react';
import { Shield } from 'lucide-react';
import api from '../../api/axios';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

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
      fetchUsers();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
          <p className="text-gray-500 text-sm">Overview of all registered patients and administrators.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                  <th className="px-6 py-4 font-medium">User</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Joined Date</th>
                  <th className="px-6 py-4 font-medium">Status / Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(user => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-800">
                      <div className="flex items-center space-x-3">
                         <div className="h-10 w-10 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center font-bold">
                            {user.name.charAt(0)}
                         </div>
                         <div>
                            <p>{user.name}</p>
                            <p className="text-xs text-gray-400">{user.email}</p>
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 capitalize text-sm text-gray-600">{user.role}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      {user.role === 'doctor' ? (
                        user.isApproved ? (
                          <span className="text-green-600 flex items-center space-x-1 text-sm font-medium">
                            <Shield className="h-4 w-4" /> <span>Approved</span>
                          </span>
                        ) : (
                          <button onClick={() => toggleApproval(user._id)} className="btn-primary text-xs py-1 px-3">
                            Approve
                          </button>
                        )
                      ) : '-'}
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
