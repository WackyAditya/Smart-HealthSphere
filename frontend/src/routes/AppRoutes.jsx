import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';

// Layouts
import Navbar from '../components/layout/Navbar';
import DashboardLayout from '../components/layout/DashboardLayout';

// Public Pages
import Home from '../pages/Home';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import DoctorsList from '../pages/DoctorsList';

// Patient Pages
import PatientDashboard from '../pages/patient/PatientDashboard';
import MyAppointments from '../pages/patient/MyAppointments';
import MedicalRecords from '../pages/patient/MedicalRecords';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import ManageUsers from '../pages/admin/ManageUsers';
import ManageDoctors from '../pages/admin/ManageDoctors';
import ManageAppointments from '../pages/admin/ManageAppointments';

// Doctor Pages
import DoctorDashboard from '../pages/doctor/DoctorDashboard';
import DoctorAppointments from '../pages/doctor/DoctorAppointments';
import PatientRecords from '../pages/doctor/PatientRecords';
import Availability from '../pages/doctor/Availability';

// A layout for public pages (with Navbar)
const PublicLayout = () => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-grow">
      <Outlet />
    </main>
  </div>
);

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes with Navbar */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/doctors" element={<DoctorsList />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Dashboard Routes with Sidebar */}
        <Route element={<DashboardLayout />}>
          {/* Patient */}
          <Route path="/patient/dashboard" element={<PatientDashboard />} />
          <Route path="/patient/appointments" element={<MyAppointments />} />
          <Route path="/patient/records" element={<MedicalRecords />} />
          
          {/* Admin */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<ManageUsers />} />
          <Route path="/admin/doctors" element={<ManageDoctors />} />
          <Route path="/admin/appointments" element={<ManageAppointments />} />

          {/* Doctor */}
          <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
          <Route path="/doctor/appointments" element={<DoctorAppointments />} />
          <Route path="/doctor/patient-records" element={<PatientRecords />} />
          <Route path="/doctor/availability" element={<Availability />} />
          
          {/* Fallbacks */}
          <Route path="/patient/*" element={<div className="p-4">Under Construction</div>} />
          <Route path="/doctor/*" element={<div className="p-4">Under Construction</div>} />
          <Route path="/admin/*" element={<div className="p-4">Under Construction</div>} />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRoutes;
