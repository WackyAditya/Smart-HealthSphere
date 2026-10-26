import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Bell, Search, X, Menu, User, ShieldCheck, Mail, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSearch } from '../../context/SearchContext';
import api from '../../api/axios'; // Bug 5 Fix: Static import

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const { searchTerm, setSearchTerm } = useSearch();
  const navigate = useNavigate();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications/me');
        setNotifications(res.data);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };
    if (user) fetchNotifications();
  }, [user]);

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/mark-all-read');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-indigo-50/50 flex">
      {/* Sidebar with mobile toggle support (Bug 7 Fix) */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen p-3 sm:p-6 w-full max-w-full overflow-x-hidden">
        <div className="bg-white rounded-3xl shadow-sm border border-indigo-100 flex-1 flex flex-col overflow-hidden max-w-full">
          {/* Top Header */}
          <header className="h-20 bg-white flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30 border-b border-gray-50">
            <div className="flex items-center gap-3">
              {/* Mobile Hamburger Button */}
              <button
                onClick={() => setMobileOpen(true)}
                className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 lg:hidden cursor-pointer"
                title="Toggle Navigation"
              >
                <Menu className="h-6 w-6" />
              </button>

              <div className="relative flex items-center">
                <Search className="h-4 w-4 absolute left-4 text-gray-400 pointer-events-none" />
                <input 
                  id="header-global-search"
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search anything..." 
                  className="pl-11 pr-10 py-2.5 bg-gray-50 border border-gray-100 rounded-full focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all w-48 sm:w-72 text-xs sm:text-sm"
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')} 
                    className="absolute right-3 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                    title="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-full hover:bg-gray-100 relative text-gray-500 transition-colors cursor-pointer"
                >
                  <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
                  {notifications.filter(n => !n.isRead).length > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
                  )}
                </button>
                
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-50 flex justify-between items-center">
                      <h3 className="font-bold text-gray-800 text-sm">Notifications</h3>
                      <button 
                        onClick={markAllAsRead}
                        className="text-xs text-primary-600 hover:text-primary-700 font-semibold cursor-pointer"
                      >
                        Mark all read
                      </button>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length > 0 ? notifications.map(notif => (
                        <div 
                          key={notif._id} 
                          onClick={() => markAsRead(notif._id)}
                          className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 ${!notif.isRead ? 'bg-indigo-50/40' : ''}`}
                        >
                          <p className="text-xs font-bold text-gray-800">{notif.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{notif.message}</p>
                          <p className="text-[10px] text-gray-400 mt-1">
                            {new Date(notif.createdAt).toLocaleDateString()} {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      )) : (
                        <div className="px-4 py-6 text-center text-gray-500 text-xs">
                          No notifications
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar & Dropdown */}
              <div className="relative">
                <div 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="h-10 w-10 rounded-full bg-primary-100 border border-primary-200 flex items-center justify-center text-primary-700 font-bold text-xs sm:text-sm cursor-pointer shadow-xs hover:scale-105 transition-transform"
                >
                  {getInitials(user?.name)}
                </div>
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-scale-up">
                    <div className="px-4 py-2 border-b border-gray-50 mb-1">
                      <p className="font-bold text-gray-900 text-sm truncate">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {user?.role}
                      </span>
                    </div>

                    {/* Bug 6 Fix: Wire My Profile button */}
                    <button 
                      onClick={() => {
                        setShowProfileMenu(false);
                        setShowProfileModal(true);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                    >
                      <User className="w-4 h-4 text-gray-400" />
                      <span>My Profile</span>
                    </button>

                    <button 
                      onClick={() => {
                        if (logout) logout();
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        navigate('/login');
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                    >
                      <X className="w-4 h-4 text-rose-400" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Bug 6 Fix: My Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 animate-scale-up relative">
            <button 
              onClick={() => setShowProfileModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-primary-100 text-primary-700 font-black text-2xl flex items-center justify-center border border-primary-200">
                {getInitials(user?.name)}
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-gray-900">{user?.name}</h3>
                <p className="text-xs font-semibold text-gray-500">{user?.email}</p>
                <div className="inline-flex items-center gap-1 mt-1 text-[11px] font-bold text-primary-600 bg-primary-50 px-2.5 py-0.5 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified {user?.role?.toUpperCase()}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-100 text-xs text-gray-600">
              <div className="flex justify-between py-1 border-b border-gray-200/50">
                <span className="font-semibold text-gray-400">Account Role</span>
                <span className="font-bold text-gray-800 capitalize">{user?.role}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200/50">
                <span className="font-semibold text-gray-400">User ID</span>
                <span className="font-mono text-gray-700">{user?._id || user?.id || 'Active'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="font-semibold text-gray-400">Security Clearance</span>
                <span className="font-bold text-emerald-600">AES-256 Vault Access</span>
              </div>
            </div>

            <button
              onClick={() => setShowProfileModal(false)}
              className="mt-6 w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-200 transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
