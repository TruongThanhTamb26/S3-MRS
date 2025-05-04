import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiLogOut, FiUser } from 'react-icons/fi';
import { authService } from '../services/auth.service';
import { toast } from 'react-toastify';

export const TechNavbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();
  
  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-blue-700' : '';
  };
  
  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await authService.getCurrentUser();
        if (response.success) {
          setUserData(response.data);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    
    fetchUserData();
  }, []);
  
  const handleLogout = async () => {
    try {
      await authService.logout();
      toast.success('Đăng xuất thành công');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Đã xảy ra lỗi khi đăng xuất');
    }
  };

  return (
    <nav className="bg-gradient-to-r from-blue-700 to-blue-500 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <img className="h-10 w-auto" src='/BACHKHOA.png' alt="HCMUT Logo" />
                <span className="text-white font-bold text-xl hidden md:block">Quản lý thiết bị</span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4 items-center">
              <Link
                to="/technician/equipment"
                className={`${isActive('/technician/equipment')} text-white hover:bg-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200`}
              >
                Quản lý thiết bị
              </Link>
            </div>
          </div>
          
          {/* User dropdown and mobile menu button */}
          <div className="flex items-center space-x-4">
            {/* User dropdown */}
            <div className="relative ml-3">
              <div>
                <button
                  type="button"
                  className="flex items-center space-x-2 text-white bg-blue-600 hover:bg-blue-700 rounded-full p-1 focus:outline-none"
                  id="user-menu-button"
                  aria-expanded="false"
                  aria-haspopup="true"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                >
                  <span className="sr-only">Mở menu người dùng</span>
                  <div className="h-8 w-8 rounded-full bg-blue-400 flex items-center justify-center text-white">
                    {userData?.fullName?.charAt(0) || <FiUser />}
                  </div>
                  <span className="hidden md:block text-sm">{userData?.fullName || 'Người dùng'}</span>
                </button>
              </div>

              {/* Dropdown menu */}
              {userDropdownOpen && (
                <div
                  className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="user-menu-button"
                >
                  <Link
                    to="/technician/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    Thông tin cá nhân
                  </Link>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                  >
                    <div className="flex items-center">
                      <FiLogOut className="mr-2" />
                      Đăng xuất
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white hover:bg-blue-700 focus:outline-none"
                aria-controls="mobile-menu"
                aria-expanded="false"
                onClick={() => setIsOpen(!isOpen)}
              >
                <span className="sr-only">Mở menu</span>
                {isOpen ? <FiX className="block h-6 w-6" /> : <FiMenu className="block h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`sm:hidden ${isOpen ? 'block' : 'hidden'}`} id="mobile-menu">
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link
            to="/technician/profile"
            className={`${isActive('/technician/profile')} text-white block px-3 py-2 rounded-md text-base font-medium`}
            onClick={() => setIsOpen(false)}
          >
            Hồ sơ
          </Link>
          <Link
            to="/technician/equipment"
            className={`${isActive('/technician/equipment')} text-white block px-3 py-2 rounded-md text-base font-medium`}
            onClick={() => setIsOpen(false)}
          >
            Quản lý thiết bị
          </Link>
          <button
            onClick={handleLogout}
            className="text-white block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700"
          >
            <div className="flex items-center">
              <FiLogOut className="mr-2" />
              Đăng xuất
            </div>
          </button>
        </div>
      </div>
    </nav>
  );
};