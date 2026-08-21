import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  FileText, 
  Settings, 
  LogOut,
  User,
  HeartPulse,
  Clock
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const role = location.pathname.split('/')[1] || 'patient'; // patient, doctor, admin

  const patientLinks = [
    { name: 'Dashboard', path: '/patient/dashboard', icon: LayoutDashboard },
    { name: 'Find a Doctor', path: '/doctors', icon: HeartPulse },
    { name: 'My Appointments', path: '/patient/appointments', icon: Calendar },
    { name: 'Medical Records', path: '/patient/records', icon: FileText },
  ];

  const doctorLinks = [
    { name: 'Dashboard', path: '/doctor/dashboard', icon: LayoutDashboard },
    { name: 'Appointments', path: '/doctor/appointments', icon: Calendar },
    { name: 'Patient Records', path: '/doctor/patient-records', icon: FileText },
    { name: 'Working Hours', path: '/doctor/availability', icon: Clock },
  ];

  const adminLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Manage Users', path: '/admin/users', icon: User },
    { name: 'Manage Doctors', path: '/admin/doctors', icon: HeartPulse },
    { name: 'Manage Appointments', path: '/admin/appointments', icon: Calendar },
  ];

  const links = role === 'admin' ? adminLinks : role === 'doctor' ? doctorLinks : patientLinks;

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div className="w-64 bg-primary-600 h-screen fixed left-0 top-0 flex flex-col shadow-xl z-40 rounded-tr-3xl rounded-br-3xl">
      <div className="h-24 flex items-center justify-center px-6">
        <Link to="/" className="text-2xl font-bold text-white flex items-center space-x-2">
           <HeartPulse className="h-10 w-10 text-white" />
        </Link>
      </div>
      
      <div className="flex-1 py-8 flex flex-col space-y-4 px-4">
        {links.map((link) => {
          const isActive = location.pathname.includes(link.path);
          const Icon = link.icon;
          return (
            <Link
              key={link.name}
              to={link.path}
              className={`flex items-center justify-center w-12 h-12 mx-auto rounded-xl transition-all ${
                isActive 
                  ? 'bg-white text-primary-600 shadow-lg' 
                  : 'text-indigo-200 hover:bg-primary-500 hover:text-white'
              }`}
              title={link.name}
            >
              <Icon className="h-6 w-6" />
            </Link>
          );
        })}
      </div>

      <div className="p-6 flex justify-center border-t border-primary-500">
        <button onClick={handleLogout} className="text-indigo-200 hover:text-white transition-colors">
          <LogOut className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
