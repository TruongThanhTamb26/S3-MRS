import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashNavbar } from "../components/DashNavbar";
import { adminService } from "../services/admin.service";
import { reportService } from "../services/report.service";
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

interface Equipment {
  Mic: number;
  Projector: number;
  AirCon: number;
  [key: string]: number;
}

interface Room {
  id: number;
  name: string;
  capacity: number;
  location: string;
  status: string;
  equipment: Equipment;
}

interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: string;
}

interface Reservation {
  id: number;
  roomId: number;
  userId: number;
  startTime: string;
  endTime: string;
  status: string;
  room?: Room;
  user?: User;
  createdAt: string;
  updatedAt: string;
}

const Dashboard: React.FC = () => {
  // State variables
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [stats, setStats] = useState({
    totalRooms: 0,
    availableRooms: 0,
    totalBookings: 0,
    totalUsers: 0
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [roomUtilization, setRoomUtilization] = useState<any[]>([]);
  const [timeDistribution, setTimeDistribution] = useState<any[]>([]);
  const [reportPeriod, setReportPeriod] = useState<'day' | 'week' | 'month'>('week');

  const [selectedBooking, setSelectedBooking] = useState<Reservation | null>(null);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  
  const navigate = useNavigate();

  // Fetch all dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError("");
      
      try {
        // Fetch room statistics
        const roomsResponse = await adminService.getAllRooms();
        
        // Fetch booking statistics
        const bookingsResponse = await adminService.getAllReservations({ 
          limit: 5, 
          sort: 'createdAt:desc' 
        });
        
        // Fetch user statistics
        const usersResponse = await adminService.getAllUsers();
        
        // Fetch usage report
        const today = new Date();
        const startDate = new Date();
        
        // Set date range based on selected period
        if (reportPeriod === 'day') {
          startDate.setDate(today.getDate() - 1);
        } else if (reportPeriod === 'week') {
          startDate.setDate(today.getDate() - 7);
        } else {
          startDate.setMonth(today.getMonth() - 1);
        }
        
        const todayPlusOne = new Date(today);
        todayPlusOne.setDate(today.getDate() + 1);
        
        const usageResponse = await reportService.getUsageReport(
          startDate.toISOString().split('T')[0],
          todayPlusOne.toISOString().split('T')[0]
        );

        const enhancedBookings = bookingsResponse.data.map(booking => {
          // Find matching user
          const user = usersResponse.data.find(u => u.id === booking.userId);
          // Find matching room
          const room = roomsResponse.data.find(r => r.id === booking.roomId);
          
          // Return booking with joined user and room data
          return {
            ...booking,
            user: user || null,
            room: room || null
          };
        });

        setRecentBookings(enhancedBookings);

        
        // Process and set data
        if (roomsResponse.success && bookingsResponse.success && usersResponse.success && usageResponse.success) {
          // Set basic statistics
          setStats({
            totalRooms: roomsResponse.data.length,
            availableRooms: roomsResponse.data.filter(room => room.status === 'available').length,
            totalBookings: bookingsResponse.data.length,
            totalUsers: usersResponse.data.length
          });
          
          // Join user and room data with bookings
          const enhancedBookings = bookingsResponse.data.map(booking => {
            // Find matching user
            const user = usersResponse.data.find(u => u.id === booking.userId);
            // Find matching room
            const room = roomsResponse.data.find(r => r.id === booking.roomId);
            
            // Return booking with joined user and room data
            return {
              ...booking,
              user: user || null,
              room: room || null
            };
          });
          
          // Set enhanced bookings with user and room info
          setRecentBookings(enhancedBookings);
          console.log("Enhanced bookings with user and room data:", enhancedBookings);
          
          // Process usage data for charts
          if (usageResponse.data.roomUtilization) {
            setRoomUtilization(usageResponse.data.roomUtilization);
          } else {
            setRoomUtilization([]);
          }
          if (usageResponse.data.timeDistribution) {
            setTimeDistribution(usageResponse.data.timeDistribution);
          } else {
            setTimeDistribution([]);
          }
        } else {
          setError("Không thể tải dữ liệu dashboard");
        }
      } catch (err: any) {
        console.error("Error fetching dashboard data:", err);
        setError(err.message || "Đã xảy ra lỗi khi tải dữ liệu dashboard");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();

    
  }, [reportPeriod]);

  // Status colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  

  // Generate status data for pie chart
  const statusData = [
    { name: 'Đã xác nhận', value: recentBookings.filter(b => b.status === 'confirmed').length },
    { name: 'Đang sử dụng', value: recentBookings.filter(b => b.status === 'checked-in').length },
    { name: 'Đã hủy', value: recentBookings.filter(b => b.status === 'cancelled').length },
    { name: 'Hoàn thành', value: recentBookings.filter(b => b.status === 'completed').length }
  ].filter(item => item.value > 0);


  const openBookingDetail = (booking: any) => {
    setSelectedBooking(booking);
    setShowDetailModal(true);
  };
  
  const closeBookingDetail = () => {
    setShowDetailModal(false);
    setSelectedBooking(null);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <DashNavbar />
      
      <div className="p-6">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          
          <div className="flex space-x-2 mt-4 md:mt-0">
            <button
              onClick={() => setReportPeriod('day')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                reportPeriod === 'day' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              24h qua
            </button>
            <button
              onClick={() => setReportPeriod('week')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                reportPeriod === 'week' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              7 ngày qua
            </button>
            <button
              onClick={() => setReportPeriod('month')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                reportPeriod === 'month' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              30 ngày qua
            </button>
          </div>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p>{error}</p>
          </div>
        )}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-center my-12">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        {!isLoading && (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6 flex flex-col">
                <div className="text-sm text-gray-500 mb-1">Tổng số phòng</div>
                <div className="text-3xl font-bold text-blue-600">{stats.totalRooms}</div>
                <div className="text-xs text-gray-500 mt-2">
                  {stats.availableRooms} phòng trống ({Math.round((stats.availableRooms / stats.totalRooms) * 100 || 0)}%)
                </div>
                <button 
                  onClick={() => navigate('/admin/rooms')}
                  className="mt-auto pt-2 text-blue-600 text-sm hover:underline"
                >
                  Quản lý phòng &rarr;
                </button>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6 flex flex-col">
                <div className="text-sm text-gray-500 mb-1">Tổng số đặt phòng</div>
                <div className="text-3xl font-bold text-green-600">{stats.totalBookings}</div>
                <button 
                  onClick={() => navigate('/admin/bookings')}
                  className="mt-auto pt-2 text-green-600 text-sm hover:underline"
                >
                  Quản lý đặt phòng &rarr;
                </button>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6 flex flex-col">
                <div className="text-sm text-gray-500 mb-1">Người dùng</div>
                <div className="text-3xl font-bold text-purple-600">{stats.totalUsers}</div>
                <div className="text-xs text-gray-500 mt-2">
                  Quản lý người dùng hệ thống
                </div>
                <button 
                  onClick={() => navigate('/admin/users')}
                  className="mt-auto pt-2 text-purple-600 text-sm hover:underline"
                >
                  Quản lý người dùng &rarr;
                </button>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6 flex flex-col">
                <div className="text-sm text-gray-500 mb-1">Báo cáo</div>
                <div className="text-3xl font-bold text-orange-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Xem số liệu thống kê chi tiết
                </div>
                <button 
                  onClick={() => navigate('/admin/report')}
                  className="mt-auto pt-2 text-orange-600 text-sm hover:underline"
                >
                  Xem báo cáo &rarr;
                </button>
              </div>
              
              
            </div>
            
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Room Utilization Chart */}
              <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Mức độ sử dụng phòng học</h2>
                {roomUtilization.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={roomUtilization}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="bookings" name="Số lần đặt" fill="#8884d8" />
                        <Bar dataKey="hours" name="Số giờ sử dụng" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-80 flex items-center justify-center">
                    <p className="text-gray-500">Không có dữ liệu sử dụng phòng</p>
                  </div>
                )}
              </div>
              
              {/* Booking Status Chart */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Trạng thái đặt phòng</h2>
                {statusData.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-80 flex items-center justify-center">
                    <p className="text-gray-500">Không có dữ liệu trạng thái</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Time distribution chart */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Phân bố đặt phòng theo giờ</h2>
              {timeDistribution.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={timeDistribution}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="bookings" name="Số lượt đặt" stroke="#8884d8" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center">
                  <p className="text-gray-500">Không có dữ liệu phân bố thời gian</p>
                </div>
              )}
            </div>
            
            {/* Recent Bookings */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Đặt phòng gần đây</h2>
                <button 
                  onClick={() => navigate('/admin/bookings')}
                  className="text-blue-600 text-sm hover:underline"
                >
                  Xem tất cả
                </button>
              </div>
              
              {recentBookings.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Người đặt
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Phòng
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Thời gian
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Trạng thái
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentBookings.slice(0, 5).map((booking) => {
                      // Format date and time
                      const startTime = new Date(booking.startTime);
                      const endTime = new Date(booking.endTime);
                      const formattedDate = startTime.toLocaleDateString('vi-VN');
                      const formattedTime = `${startTime.getHours()}:${String(startTime.getMinutes()).padStart(2, '0')} - ${endTime.getHours()}:${String(endTime.getMinutes()).padStart(2, '0')}`;
                      
                      type BookingStatus = 'confirmed' | 'cancelled' | 'checked-in' | 'completed';
                      
                      // Map status to display text
                      const statusText = {
                        'confirmed': 'Đã xác nhận',
                        'cancelled': 'Đã hủy',
                        'checked-in': 'Đang sử dụng',
                        'completed': 'Hoàn thành'
                      }[booking.status as BookingStatus] || booking.status;
                      
                      // Map status to color
                      const statusColor = {
                        'confirmed': 'bg-blue-100 text-blue-800',
                        'cancelled': 'bg-red-100 text-red-800',
                        'checked-in': 'bg-green-100 text-green-800',
                        'completed': 'bg-gray-100 text-gray-800'
                      }[booking.status as BookingStatus] || 'bg-gray-100 text-gray-800';
                      
                      return (
                        <tr key={booking.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {booking.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                          {booking.user?.fullName || `User #${booking.userId}`}
                          </div>
                          <div className="text-sm text-gray-500">
                          {booking.user?.email || ''}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {booking.room?.name || `Phòng #${booking.roomId}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formattedDate}</div>
                          <div className="text-sm text-gray-500">{formattedTime}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor}`}>
                          {statusText}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                          onClick={() => openBookingDetail(booking)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                          Chi tiết
                          </button>
                        </td>
                        </tr>
                      );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p>Chưa có đặt phòng nào</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      {/* Booking Detail Modal */}
      {showDetailModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  Chi tiết đặt phòng #{selectedBooking.id}
                </h2>
                <button 
                  onClick={closeBookingDetail}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Booking Info */}
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium text-gray-700 mb-2">Thông tin đặt phòng</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">ID:</span>
                      <span className="font-medium">{selectedBooking.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Ngày tạo:</span>
                      <span className="font-medium">
                        {new Date(selectedBooking.createdAt).toLocaleString('vi-VN')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Trạng thái:</span>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        {
                          'confirmed': 'bg-blue-100 text-blue-800',
                          'cancelled': 'bg-red-100 text-red-800',
                          'rejected': 'bg-red-100 text-red-800',
                          'checked-in': 'bg-green-100 text-green-800',
                          'completed': 'bg-gray-100 text-gray-800'
                        }[selectedBooking.status] || 'bg-gray-100 text-gray-800'
                      }`}>
                        {
                          {
                            'confirmed': 'Đã xác nhận',
                            'cancelled': 'Đã hủy',
                            'checked-in': 'Đang sử dụng',
                            'completed': 'Hoàn thành',
                            'rejected': 'Đã từ chối'
                          }[selectedBooking.status] || selectedBooking.status
                        }
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Room Info */}
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium text-gray-700 mb-2">Thông tin phòng</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Phòng:</span>
                      <span className="font-medium">
                        {selectedBooking.room?.name || `Phòng #${selectedBooking.roomId}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">cơ sở:</span>
                      <span className="font-medium">
                        {selectedBooking.room?.location || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Sức chứa:</span>
                      <span className="font-medium">
                        {selectedBooking.room?.capacity || 'N/A'} người
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* User Info */}
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium text-gray-700 mb-2">Thông tin người đặt</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Họ tên:</span>
                      <span className="font-medium">
                        {selectedBooking.user?.fullName || `User #${selectedBooking.userId}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Email:</span>
                      <span className="font-medium">
                        {selectedBooking.user?.email || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Vai trò:</span>
                      <span className="font-medium">
                        {selectedBooking.user?.role === 'student' ? 'Sinh viên' : 
                        selectedBooking.user?.role === 'admin' ? 'Quản trị viên' : 
                        selectedBooking.user?.role === 'technician' ? 'Kỹ thuật viên' : 
                        selectedBooking.user?.role || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Time Info */}
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium text-gray-700 mb-2">Thời gian sử dụng</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Ngày:</span>
                      <span className="font-medium">
                        {new Date(selectedBooking.startTime).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Bắt đầu:</span>
                      <span className="font-medium">
                        {new Date(selectedBooking.startTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Kết thúc:</span>
                      <span className="font-medium">
                        {new Date(selectedBooking.endTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex justify-end space-x-2">
                <button
                  onClick={closeBookingDetail}
                  className="px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
                >
                  Đóng
                </button>
                <button
                  onClick={() => navigate(`/admin/bookings/${selectedBooking.id}`)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Xem đầy đủ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;