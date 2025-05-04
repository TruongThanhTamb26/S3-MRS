import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { authService } from "../services/auth.service";

export const DashNavbar: React.FC = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };
  
  const handleLogout = () => {
    authService.logout();
    window.location.href = '/login';
  };
  
  return (
    <nav className="bg-gradient-to-r from-blue-900 to-blue-700 text-white shadow-lg">
      {/* Desktop Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/admin/dashboard" className="flex items-center">
                <img src="/BACHKHOA.png" alt="Logo" className="w-10 h-10" />
                <span className="ml-2 font-bold text-lg hidden md:block">MRS Admin</span>
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link to="/admin/dashboard" 
                  className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                    isActive('/admin/dashboard') 
                      ? 'bg-blue-800 text-white' 
                      : 'text-gray-300 hover:bg-blue-800 hover:text-white'
                  }`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Dashboard
                </Link>
                
                <Link to="/admin/rooms" 
                  className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                    isActive('/admin/rooms') 
                      ? 'bg-blue-800 text-white' 
                      : 'text-gray-300 hover:bg-blue-800 hover:text-white'
                  }`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Phòng học
                </Link>
                
                <Link to="/admin/bookings" 
                  className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                    isActive('/admin/bookings') 
                      ? 'bg-blue-800 text-white' 
                      : 'text-gray-300 hover:bg-blue-800 hover:text-white'
                  }`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Đặt phòng
                </Link>
                
                <Link to="/admin/users" 
                  className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                    isActive('/admin/users') 
                      ? 'bg-blue-800 text-white' 
                      : 'text-gray-300 hover:bg-blue-800 hover:text-white'
                  }`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Người dùng
                </Link>
                
                <Link to="/admin/report" 
                  className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                    isActive('/admin/report') 
                      ? 'bg-blue-800 text-white' 
                      : 'text-gray-300 hover:bg-blue-800 hover:text-white'
                  }`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Thống kê
                </Link>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center">
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center max-w-xs bg-blue-800 rounded-full p-1 focus:outline-none"
                >
                  <img className="h-8 w-8 rounded-full object-cover" src="/admin-avatar.png" alt="User avatar" />
                  <span className="ml-2 mr-1 text-sm">Admin</span>
                  <svg className={`h-4 w-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {dropdownOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-10">
                    <Link to="/admin/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Hồ sơ
                    </Link>
                    <Link to="/admin/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Cài đặt
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!mobileMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/admin/dashboard" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/admin/dashboard') ? 'bg-blue-800 text-white' : 'text-gray-300 hover:bg-blue-800 hover:text-white'
              }`}>
              Dashboard
            </Link>
            <Link to="/admin/rooms" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/admin/rooms') ? 'bg-blue-800 text-white' : 'text-gray-300 hover:bg-blue-800 hover:text-white'
              }`}>
              Phòng học
            </Link>
            <Link to="/admin/bookings" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/admin/bookings') ? 'bg-blue-800 text-white' : 'text-gray-300 hover:bg-blue-800 hover:text-white'
              }`}>
              Đặt phòng
            </Link>
            <Link to="/admin/users" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/admin/users') ? 'bg-blue-800 text-white' : 'text-gray-300 hover:bg-blue-800 hover:text-white'
              }`}>
              Người dùng
            </Link>
            <Link to="/admin/report" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/admin/report') ? 'bg-blue-800 text-white' : 'text-gray-300 hover:bg-blue-800 hover:text-white'
              }`}>
              Thống kê
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-blue-900">
            <div className="flex items-center px-5">
              <div className="flex-shrink-0">
                <img className="h-10 w-10 rounded-full" src="/admin.png" alt="User avatar" />
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-white">Quản trị viên</div>
                <div className="text-sm font-medium text-blue-300">admin@hcmut.edu.vn</div>
              </div>
            </div>
            <div className="mt-3 px-2 space-y-1">
              <Link to="/admin/profile" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-blue-800 hover:text-white">
                Hồ sơ
              </Link>
              <Link to="/admin/settings" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-blue-800 hover:text-white">
                Cài đặt
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-blue-800 hover:text-white"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};