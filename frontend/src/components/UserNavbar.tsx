import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../services/api.service';
import { userService } from '../services/user.service';

interface UserNavbarProps {
  title?: string;
}

// Interface cho thông báo
interface Notification {
  id: number;
  message: string;
  time: string;
  read: boolean;
  reservationId?: number;
}

const UserNavbar: React.FC<UserNavbarProps> = ({ title = "S3-MRS" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Thêm state cho thông báo
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const notificationDropdownRef = useRef<HTMLDivElement>(null);

  // Helper function to determine if a route is active
  const isActive = (path: string): boolean => {
    return location.pathname.startsWith(path);
  };

  // Hàm để lấy thông báo
  const fetchNotifications = async () => {
    try {
      // Trong thực tế, bạn sẽ gọi API để lấy thông báo
      // Ở đây, tôi sẽ mô phỏng bằng cách kiểm tra đặt phòng sắp tới
      const response = await userService.getUserReservations();
      
      if (response.success && response.data) {
        const currentTime = new Date();
        const in15Minutes = new Date(currentTime.getTime() + 15 * 60000);
        
        // Lọc các đặt phòng sắp tới trong 15 phút
        const upcomingReservations = response.data.filter((reservation: any) => {
          const startTime = new Date(reservation.startTime);
          return startTime > currentTime && startTime <= in15Minutes && reservation.status === 'confirmed';
        });
        
        // Tạo thông báo cho mỗi đặt phòng sắp tới
        const newNotifications: Notification[] = upcomingReservations.map((reservation: any, index: number) => {
          const startTime = new Date(reservation.startTime);
          return {
            id: index + 1,
            message: `Phòng ${reservation.room?.name} sẽ bắt đầu lúc ${startTime.getHours()}:${String(startTime.getMinutes()).padStart(2, '0')}`,
            time: startTime.toLocaleTimeString(),
            read: false,
            reservationId: reservation.id
          };
        });
        
        setNotifications(newNotifications);
        setUnreadCount(newNotifications.filter(n => !n.read).length);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  // Hàm đánh dấu thông báo đã đọc
  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
    setUnreadCount(prev => prev - 1);
  };

  // Hàm đánh dấu tất cả thông báo đã đọc
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
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
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target as Node)) {
        setNotificationDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef, notificationDropdownRef]);

  // Fetch notifications on mount and every minute
  useEffect(() => {
    fetchNotifications();
    
    // Cập nhật thông báo mỗi phút
    const interval = setInterval(() => {
      fetchNotifications();
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-blue-700 text-white px-6 py-3 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <img src="/BACHKHOA.png" alt="BK Logo" className="w-8 h-8" />
        <h1 className="font-semibold text-sm md:text-lg">
          {title}
        </h1>
      </div>
      
      <div className="flex gap-4 items-center text-sm md:text-base">
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
        
        <button
          onClick={() => navigate("/qr-scanner")}
          className={`hover:underline transition-colors flex items-center ${isActive('/qr-scanner') ? 'font-bold' : ''}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v-4m6 0H4" />
          </svg>
          QR Scanner
        </button>
        
        {/* Notification bell */}
        <div className="relative" ref={notificationDropdownRef}>
          <button 
            onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
            className="relative flex items-center justify-center p-1 rounded-full hover:bg-blue-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            
            {/* Badge for unread notifications */}
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-xs text-white font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          
          {/* Notification dropdown */}
          {notificationDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 overflow-hidden">
              <div className="p-3 bg-blue-50 border-b border-blue-100 flex justify-between items-center">
                <h3 className="font-semibold text-gray-700">Thông báo</h3>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Đánh dấu tất cả đã đọc
                  </button>
                )}
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-6 px-4 text-center text-gray-500">
                    <p>Không có thông báo mới</p>
                  </div>
                ) : (
                  <div>
                    {notifications.map(notification => (
                      <div 
                        key={notification.id}
                        className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${notification.read ? 'bg-white' : 'bg-blue-50'}`}
                        onClick={() => {
                          if (!notification.read) {
                            markAsRead(notification.id);
                          }
                          if (notification.reservationId) {
                            navigate(`/manage?highlight=${notification.reservationId}`);
                            setNotificationDropdownOpen(false);
                          }
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="bg-blue-100 rounded-full p-2 mt-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm text-gray-800 font-medium">Sắp đến giờ đặt phòng</p>
                            <p className="text-sm text-gray-600">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {notifications.length > 0 && (
                <div className="p-2 bg-gray-50 border-t border-gray-100 text-center">
                  <button 
                    onClick={() => navigate('/manage')}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Xem tất cả đặt phòng
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
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