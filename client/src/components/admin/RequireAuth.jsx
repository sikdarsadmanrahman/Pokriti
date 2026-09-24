import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../../app/authSlice.js';

export default function RequireAuth() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/admin/login" state={{ from: location }} replace />;
  return <Outlet />;
}
