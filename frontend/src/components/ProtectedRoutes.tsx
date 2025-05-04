import { Navigate, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { authService } from '../services/auth.service';

// Role types
export type UserRole = 'admin' | 'student' | 'technician';

// Props for protected routes
interface ProtectedRouteProps {
  allowedRoles: UserRole[];
  redirectPath?: string;
}

export const ProtectedRoute = ({ 
  allowedRoles, 
  redirectPath = '/login' 
}: ProtectedRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Kiểm tra token trong localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          setIsAuthenticated(false);
          setUserRole(null);
          setIsLoading(false);
          return;
        }

        // Lấy thông tin người dùng từ localStorage
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        
        if (userData && userData.role) {
          setIsAuthenticated(true);
          setUserRole(userData.role as UserRole);
        } else {
          // Nếu không có thông tin người dùng trong localStorage, lấy từ API
          const response = await authService.getCurrentUser();
          
          if (response.success) {
            setIsAuthenticated(true);
            setUserRole(response.data.role as UserRole);
            // Cập nhật thông tin người dùng vào localStorage
            localStorage.setItem('user', JSON.stringify(response.data));
          } else {
            // Token không hợp lệ
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setIsAuthenticated(false);
            setUserRole(null);
          }
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setUserRole(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Kiểm tra xác thực
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  // Kiểm tra phân quyền
  if (userRole && !allowedRoles.includes(userRole)) {
    console.log('User role:', userRole);
    console.log('Allowed roles:', allowedRoles);
    
    // Redirect tới trang phù hợp với vai trò
    if (userRole === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (userRole === 'student') {
      return <Navigate to="/booking" replace />;
    } else if (userRole === 'technician') {
      return <Navigate to="/technician/equipment" replace />;
    }
    
    // Fallback nếu không xác định được vai trò
    return <Navigate to="/" replace />;
  }

  // Nếu đã xác thực và có quyền, render các route con
  return <Outlet />;
};

// Route bảo vệ cho người chưa đăng nhập (ngược lại với ProtectedRoute)
export const PublicRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        // Lấy thông tin người dùng từ localStorage
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        
        if (userData && userData.role) {
          setIsAuthenticated(true);
          setUserRole(userData.role as UserRole);
          setIsLoading(false);
        } else {
          // Nếu không có thông tin người dùng trong localStorage, lấy từ API
          const response = await authService.getCurrentUser();
          
          if (response.success) {
            setIsAuthenticated(true);
            setUserRole(response.data.role as UserRole);
            // Cập nhật thông tin người dùng vào localStorage
            localStorage.setItem('user', JSON.stringify(response.data));
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setIsAuthenticated(false);
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Nếu đã đăng nhập, chuyển hướng người dùng đến trang phù hợp với vai trò
  if (isAuthenticated && userRole) {
    console.log('User already authenticated, redirecting to appropriate page');
    
    if (userRole === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (userRole === 'student') {
      return <Navigate to="/booking" replace />;
    } else if (userRole === 'technician') {
      return <Navigate to="/technician/equipment" replace />;
    }
  }

  // Nếu chưa đăng nhập, render các route công khai
  return <Outlet />;
};