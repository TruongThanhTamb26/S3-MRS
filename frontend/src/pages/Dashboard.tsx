import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashNavbar } from "../components/DashNavbar";
import { adminService } from "../services/admin.service";
import { reportService } from "../services/report.service";
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const Dashboard: React.FC = () => {
  // State variables
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [stats, setStats] = useState({
    totalRooms: 0,
    availableRooms: 0,
    totalBookings: 0,
    pendingBookings: 0,
    totalUsers: 0
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [roomUtilization, setRoomUtilization] = useState<any[]>([]);
  const [timeDistribution, setTimeDistribution] = useState<any[]>([]);
  const [reportPeriod, setReportPeriod] = useState<'day' | 'week' | 'month'>('week');
  
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
        const bookingsResponse = await adminService.getAllReservations({ limit: 5, sort: 'createdAt:desc' });
        
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
        
        const usageResponse = await reportService.getUsageReport(
          startDate.toISOString().split('T')[0],
          today.toISOString().split('T')[0]
        );
        
        // Process and set data
        if (roomsResponse.success && bookingsResponse.success && usersResponse.success && usageResponse.success) {
          // Set basic statistics
          setStats({
            totalRooms: roomsResponse.data.length,
            availableRooms: roomsResponse.data.filter(room => room.status === 'available').length,
            totalBookings: bookingsResponse.data.length,
            pendingBookings: bookingsResponse.data.filter(booking => booking.status === 'pending').length,
            totalUsers: usersResponse.data.length
          });
          
          // Set recent bookings
          setRecentBookings(bookingsResponse.data);
          
          // Process usage data for charts
          if (usageResponse.data.roomUtilization) {
            setRoomUtilization(usageResponse.data.roomUtilization);
          }
          
          if (usageResponse.data.timeDistribution) {
            setTimeDistribution(usageResponse.data.timeDistribution);
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

  // Sample data for demonstration (in case API doesn't return what we need)
  const generateSampleData = () => {
    // Room utilization sample data
    const roomUtilizationSample = [
      { name: 'H1-101', bookings: 12, hours: 24 },
      { name: 'H1-102', bookings: 8, hours: 16 },
      { name: 'H1-103', bookings: 15, hours: 30 },
      { name: 'H2-201', bookings: 5, hours: 10 },
      { name: 'H2-202', bookings: 18, hours: 36 },
    ];
    
    // Time distribution sample data
    const timeDistributionSample = [
      { hour: '07:00', bookings: 8 },
      { hour: '08:00', bookings: 15 },
      { hour: '09:00', bookings: 22 },
      { hour: '10:00', bookings: 25 },
      { hour: '11:00', bookings: 20 },
      { hour: '12:00', bookings: 10 },
      { hour: '13:00', bookings: 12 },
      { hour: '14:00', bookings: 24 },
      { hour: '15:00', bookings: 28 },
      { hour: '16:00', bookings: 20 },
      { hour: '17:00', bookings: 15 },
    ];
    
    if (roomUtilization.length === 0) {
      setRoomUtilization(roomUtilizationSample);
    }
    
    if (timeDistribution.length === 0) {
      setTimeDistribution(timeDistributionSample);
    }
  };

  // Generate sample data if needed
  useEffect(() => {
    if (!isLoading && !error && (roomUtilization.length === 0 || timeDistribution.length === 0)) {
      generateSampleData();
    }
  }, [isLoading, error, roomUtilization, timeDistribution]);

  // Status colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Generate status data for pie chart
  const statusData = [
    { name: 'Đã xác nhận', value: recentBookings.filter(b => b.status === 'confirmed').length },
    { name: 'Chờ xác nhận', value: recentBookings.filter(b => b.status === 'pending').length },
    { name: 'Đang sử dụng', value: recentBookings.filter(b => b.status === 'checked-in').length },
    { name: 'Đã hủy', value: recentBookings.filter(b => b.status === 'cancelled').length },
    { name: 'Hoàn thành', value: recentBookings.filter(b => b.status === 'completed').length }
  ].filter(item => item.value > 0);

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6 flex flex-col">
                <div className="text-sm text-gray-500 mb-1">Tổng số phòng</div>
                <div className="text-3xl font-bold text-blue-600">{stats.totalRooms}</div>
                <div className="text-xs text-gray-500 mt-2">
                  {stats.availableRooms} phòng trống ({Math.round((stats.availableRooms / stats.totalRooms) * 100)}%)
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
                <div className="text-xs text-gray-500 mt-2">
                  {stats.pendingBookings} đang chờ xác nhận
                </div>
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
              
              <div className="bg-white rounded-lg shadow-md p-6 flex flex-col">
                <div className="text-sm text-gray-500 mb-1">Thiết bị</div>
                <div className="text-3xl font-bold text-teal-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Quản lý thiết bị phòng học
                </div>
                <button 
                  onClick={() => navigate('/admin/equipment')}
                  className="mt-auto pt-2 text-teal-600 text-sm hover:underline"
                >
                  Quản lý thiết bị &rarr;
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
                    <p className="text-gray-500">Không có dữ liệu</p>
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
                    <p className="text-gray-500">Không có dữ liệu</p>
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
                  <p className="text-gray-500">Không có dữ liệu</p>
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
                      {recentBookings.map((booking) => {
                        // Format date and time
                        const startTime = new Date(booking.startTime);
                        const endTime = new Date(booking.endTime);
                        const formattedDate = startTime.toLocaleDateString('vi-VN');
                        const formattedTime = `${startTime.getHours()}:${String(startTime.getMinutes()).padStart(2, '0')} - ${endTime.getHours()}:${String(endTime.getMinutes()).padStart(2, '0')}`;
                        
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
              
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => navigate(`/admin/bookings/${booking.id}`)}
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
    </div>
  );
};

export default Dashboard;
