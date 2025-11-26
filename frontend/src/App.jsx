import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import RoleBasedRoute from './components/RoleBasedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Documents from './pages/Documents'
import DocumentDetail from './pages/DocumentDetail'
import UploadDocument from './pages/UploadDocument'
import Categories from './pages/Categories'
import Departments from './pages/Departments'
import Users from './pages/Users'
import AuditLogs from './pages/AuditLogs'
import Layout from './components/Layout'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="documents" element={<Documents />} />
            <Route path="documents/:id" element={<DocumentDetail />} />
            <Route path="documents/upload" element={<UploadDocument />} />
            <Route 
              path="categories" 
              element={
                <RoleBasedRoute allowedRoles={['admin']}>
                  <Categories />
                </RoleBasedRoute>
              } 
            />
            <Route 
              path="departments" 
              element={
                <RoleBasedRoute allowedRoles={['admin']}>
                  <Departments />
                </RoleBasedRoute>
              } 
            />
            <Route 
              path="users" 
              element={
                <RoleBasedRoute allowedRoles={['admin']}>
                  <Users />
                </RoleBasedRoute>
              } 
            />
            <Route 
              path="audit-logs" 
              element={
                <RoleBasedRoute allowedRoles={['admin']}>
                  <AuditLogs />
                </RoleBasedRoute>
              } 
            />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App

