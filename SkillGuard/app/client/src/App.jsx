import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';

// Public & Student Pages
import { HomePage } from './pages/HomePage';
import { CourseCatalogPage } from './pages/CourseCatalogPage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { CoursePlayerPage } from './pages/CoursePlayerPage';

// Admin Pages
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminCoursesPage } from './pages/AdminCoursesPage';
import { CourseFormPage } from './pages/CourseFormPage';
import { AdminStudentsPage } from './pages/AdminStudentsPage';
import { ExamPage } from './pages/ExamPage';
import { AdminExamsPage } from './pages/AdminExamsPage';
import { CertificatesPage, VerifyCertificatePage } from './pages/CertificatesPage';

export const App = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main className="main-content">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/courses" element={<CourseCatalogPage />} />
          <Route path="/courses/:id" element={<CourseDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify/:certificateId" element={<VerifyCertificatePage />} />

          {/* Student Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['Student', 'Admin']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/certificates" element={<ProtectedRoute allowedRoles={['Student','Admin']}><CertificatesPage /></ProtectedRoute>} />
          <Route path="/exam/:examId" element={<ProtectedRoute allowedRoles={['Student','Admin']}><ExamPage /></ProtectedRoute>} />
          <Route
            path="/learn/:courseId"
            element={
              <ProtectedRoute allowedRoles={['Student', 'Admin']}>
                <CoursePlayerPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/courses"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminCoursesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/courses/new"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <CourseFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/courses/edit/:id"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <CourseFormPage />
              </ProtectedRoute>
            }
          />
          <Route path="/admin/exams" element={<ProtectedRoute allowedRoles={['Admin']}><AdminExamsPage /></ProtectedRoute>} />
          <Route
            path="/admin/students"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminStudentsPage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;
