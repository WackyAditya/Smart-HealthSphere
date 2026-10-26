import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  FileText, 
  User, 
  HeartPulse, 
  Clock 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const location = useLocation();
  const { user } = useAuth();
  
  // Use logged in user role, or fallback to URL path, or default to patient
  const pathRole = location.pathname.split('/')[1];
  const role = user?.role || (pathRole === 'admin' ? 'admin' : pathRole === 'doctor' ? 'doctor' : 'patient');

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

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <div className={`w-64 bg-primary-600 h-screen fixed left-0 top-0 flex flex-col shadow-2xl z-50 rounded-tr-3xl rounded-br-3xl transition-transform duration-300 ease-in-out ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="h-24 flex items-center justify-between px-6 border-b border-white/10">
          <Link to="/" className="text-xl font-extrabold text-white flex items-center space-x-3" title="Smart HealthSphere">
             <div className="p-2 bg-white/20 rounded-xl">
               <HeartPulse className="h-6 w-6 text-white" />
             </div>
             <span className="tracking-tight">HealthSphere</span>
          </Link>
        </div>
        
        <div className="flex-1 py-6 flex flex-col space-y-2 px-4 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-indigo-200/80">
            {role.toUpperCase()} PORTAL
          </div>
          {links.map((link) => {
            const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileOpen && setMobileOpen(false)}
                className={`flex items-center space-x-3.5 px-4 py-3 rounded-2xl transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-white text-primary-600 shadow-md font-bold' 
                    : 'text-indigo-100 hover:bg-primary-500 hover:text-white font-medium'
                }`}
                title={link.name}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm truncate">{link.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
