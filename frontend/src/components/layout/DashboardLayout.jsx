import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Bell, Search, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSearch } from '../../context/SearchContext';

const DashboardLayout = () => {
  const { user } = useAuth();
  const { searchTerm, setSearchTerm } = useSearch();
  const navigate = useNavigate();
  
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const [showProfileMenu, setShowProfileMenu] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [notifications, setNotifications] = React.useState([]);

  React.useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await import('../../api/axios').then(m => m.default.get('/notifications/me'));
        setNotifications(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    if (user) fetchNotifications();
  }, [user]);

  const markAllAsRead = async () => {
    try {
      await import('../../api/axios').then(m => m.default.patch('/notifications/mark-all-read'));
      setNotifications(notifications.map(n => ({...n, isRead: true})));
    } catch (err) { console.error(err); }
  };

  const markAsRead = async (id) => {
    try {
      await import('../../api/axios').then(m => m.default.patch(`/notifications/${id}/read`));
      setNotifications(notifications.map(n => n._id === id ? {...n, isRead: true} : n));
    } catch (err) { console.error(err); }
  };

  return (
    <div className="min-h-screen bg-indigo-50/50 flex">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-h-screen p-6 max-w-[calc(100vw-16rem)] overflow-x-hidden">
        <div className="bg-white rounded-3xl shadow-sm border border-indigo-100 flex-1 flex flex-col overflow-hidden max-w-full">
          {/* Top Header */}
          <header className="h-20 bg-white flex items-center justify-between px-8 sticky top-0 z-30 border-b border-gray-50">
            <div className="relative flex items-center">
              <Search className="h-4 w-4 absolute left-4 text-gray-400 pointer-events-none" />
              <input 
                id="header-global-search"
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search anything..." 
                className="pl-11 pr-10 py-2.5 bg-gray-50 border border-gray-100 rounded-full focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all w-72 text-sm"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')} 
                  className="absolute right-3 text-gray-400 hover:text-gray-600 p-1"
                  title="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-full hover:bg-gray-100 relative text-gray-500 transition-colors"
              >
                <Bell className="h-6 w-6" />
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-50 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800">Notifications</h3>
                    <button 
                      onClick={markAllAsRead}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length > 0 ? notifications.map(notif => (
                      <div 
                        key={notif._id} 
                        onClick={() => markAsRead(notif._id)}
                        className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 ${!notif.isRead ? 'bg-indigo-50/30' : ''}`}
                      >
                        <p className="text-sm font-semibold text-gray-800">{notif.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{notif.message}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{new Date(notif.createdAt).toLocaleDateString()} {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                      </div>
                    )) : (
                      <div className="px-4 py-6 text-center text-gray-500 text-sm">
                        No new notifications
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="relative">
              <div 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="h-10 w-10 rounded-full bg-primary-100 border border-primary-200 flex items-center justify-center text-primary-700 font-semibold cursor-pointer"
              >
                {getInitials(user?.name)}
              </div>
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-50 mb-2">
                    <p className="font-bold text-gray-800">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">My Profile</button>
                  <button 
                    onClick={() => {
                      localStorage.removeItem('token');
                      window.location.href = '/login';
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  </div>
  );
};

export default DashboardLayout;
