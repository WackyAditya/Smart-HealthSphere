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

// Security & Protected Routes
import ProtectedRoute from './ProtectedRoute';
import Unauthorized from '../pages/Unauthorized';
import NotFound from '../pages/NotFound';

import HealthConciergeBot from '../components/chat/HealthConciergeBot';

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
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
        </Route>

        {/* Dashboard Routes with Sidebar (Matching Admin Overview layout) */}
        <Route element={<DashboardLayout />}>
          <Route path="/doctors" element={<DoctorsList />} />
          
          {/* Patient Routes - Protected for Patients and Admins */}
          <Route path="/patient/dashboard" element={<ProtectedRoute allowedRoles={['patient', 'admin']}><PatientDashboard /></ProtectedRoute>} />
          <Route path="/patient/doctors" element={<ProtectedRoute allowedRoles={['patient', 'admin']}><DoctorsList /></ProtectedRoute>} />
          <Route path="/patient/appointments" element={<ProtectedRoute allowedRoles={['patient', 'admin']}><MyAppointments /></ProtectedRoute>} />
          <Route path="/patient/records" element={<ProtectedRoute allowedRoles={['patient', 'admin']}><MedicalRecords /></ProtectedRoute>} />
          
          {/* Admin Routes - Strictly Protected for Admins */}
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><ManageUsers /></ProtectedRoute>} />
          <Route path="/admin/doctors" element={<ProtectedRoute allowedRoles={['admin']}><ManageDoctors /></ProtectedRoute>} />
          <Route path="/admin/appointments" element={<ProtectedRoute allowedRoles={['admin']}><ManageAppointments /></ProtectedRoute>} />

          {/* Doctor Routes - Protected for Doctors and Admins */}
          <Route path="/doctor/dashboard" element={<ProtectedRoute allowedRoles={['doctor', 'admin']}><DoctorDashboard /></ProtectedRoute>} />
          <Route path="/doctor/appointments" element={<ProtectedRoute allowedRoles={['doctor', 'admin']}><DoctorAppointments /></ProtectedRoute>} />
          <Route path="/doctor/patient-records" element={<ProtectedRoute allowedRoles={['doctor', 'admin']}><PatientRecords /></ProtectedRoute>} />
          <Route path="/doctor/availability" element={<ProtectedRoute allowedRoles={['doctor', 'admin']}><Availability /></ProtectedRoute>} />
        </Route>

        {/* Global Catch-all 404 Route */}
        <Route element={<PublicLayout />}>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>

      {/* Floating 24/7 AI Health Concierge Bot */}
      <HealthConciergeBot />
    </Router>
  );
};

export default AppRoutes;
