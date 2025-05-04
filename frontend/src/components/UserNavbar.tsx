import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api.service';

interface UserNavbarProps {
  title?: string;
}

const UserNavbar: React.FC<UserNavbarProps> = ({ title = "S3-MRS" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Helper function to determine if a route is active
  const isActive = (path: string): boolean => {
    return location.pathname.startsWith(path);
  };

  // Handle logout functionality
  const handleLogout = async () => {
    try {
      // Call the logout endpoint (if your API has one)
      await api.post('/users/logout');
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      // Always remove token and user data from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login page
      navigate('/login');
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <div className="bg-blue-700 text-white px-6 py-3 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <img src="/BACHKHOA.png" alt="BK Logo" className="w-8 h-8" />
        <h1 className="font-semibold text-sm md:text-lg">
          {title}
        </h1>
      </div>
      <div className="flex gap-4 text-sm md:text-base">
        <button 
          onClick={() => navigate("/booking")}
          className={`hover:underline transition-colors ${isActive('/booking') ? 'font-bold' : ''}`}
        >
          Đặt chỗ
        </button>
        <button
          onClick={() => navigate("/manage")}
          className={`hover:underline transition-colors ${isActive('/manage') ? 'font-bold' : ''}`}
        >
          Quản lý đặt chỗ
        </button>
        
        {/* Profile dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)} 
            className={`bg-white text-blue-700 px-3 py-1 rounded-full ${
              isActive('/profile') ? 'font-bold' : ''
            }`}
          >
            👤
          </button>
          
          {/* Dropdown menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-50 overflow-hidden">
              <div className="py-2">
                <button 
                  onClick={() => {
                    navigate("/profile");
                    setDropdownOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  Chỉnh sửa thông tin
                </button>
                
                <button 
                  onClick={() => {
                    navigate("/profile?tab=password");
                    setDropdownOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  Đổi mật khẩu
                </button>

                <hr className="my-1 border-gray-200" />
                
                <button 
                  onClick={() => {
                    handleLogout();
                    setDropdownOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 4a1 1 0 10-2 0v4.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L14 11.586V7z" clipRule="evenodd" />
                  </svg>
                  Đăng xuất
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserNavbar;