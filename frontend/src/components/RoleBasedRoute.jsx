import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const RoleBasedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <div>Đang tải...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role?.name)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default RoleBasedRoute



