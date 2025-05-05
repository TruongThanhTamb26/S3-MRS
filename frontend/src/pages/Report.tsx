import React, { useState, useEffect } from "react";
import { DashNavbar } from "../components/DashNavbar";
import { adminService } from "../services/admin.service";
import { reportService } from "../services/report.service";
import { format, subDays, parseISO } from "date-fns";
import { 
  BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, Cell 
} from 'recharts';

const AdminReport: React.FC = () => {
  // State variables
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("booking");
  const [dateRange, setDateRange] = useState({
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });
  
  // Data states
  const [bookingStats, setBookingStats] = useState<any[]>([]);
  const [roomStats, setRoomStats] = useState<any[]>([]);
  const [userStats, setUserStats] = useState<any[]>([]);
  const [summaryData, setSummaryData] = useState({
    totalBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    mostUsedRoom: 'N/A',
    roomCount: 0,
    userCount: 0,
    newUserCount: 0
  });

  // Fetch data when component mounts or date range changes
  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  // Fetch report data based on active tab
  const fetchReportData = async () => {
    setIsLoading(true);
    setError("");

    try {
      // Fetch booking statistics
      const bookingResponse = await reportService.getUsageReport(
        dateRange.startDate, 
        dateRange.endDate
      );

      if (bookingResponse.success) {
        setBookingStats(bookingResponse.data.bookingsByStatus || []);
        setSummaryData(prev => ({
          ...prev,
          totalBookings: bookingResponse.data.totalBookings || 0,
          completedBookings: bookingResponse.data.completedBookings || 0,
          cancelledBookings: bookingResponse.data.cancelledBookings || 0
        }));
      }

      // Fetch room statistics
      const roomResponse = await reportService.getRoomUtilizationReport(
        dateRange.startDate, 
        dateRange.endDate
      );

      
      if (roomResponse.success) {
        const roomData = roomResponse.data.roomUtilization || [];
        setRoomStats(roomData);
        
        const mostUsedRoom = roomData.length > 0 
          ? roomData.sort((a: any, b: any) => b.utilization - a.utilization)[0].name 
          : 'N/A';
          
        setSummaryData(prev => ({
          ...prev,
          mostUsedRoom,
          roomCount: roomData.length
        }));
      }

      // Fetch user statistics
      const userResponse = await adminService.getAllUsers();
      
      if (userResponse.success) {
        // Process user data for chart
        const roleCount: Record<string, number> = {};
        userResponse.data.forEach((user: any) => {
          const role = translateRole(user.role);
          roleCount[role] = (roleCount[role] || 0) + 1;
        });
        
        const chartData = Object.keys(roleCount).map(role => ({
          name: role,
          value: roleCount[role]
        }));
        
        setUserStats(chartData);
        
        // Count new users
        const newUsers = userResponse.data.filter((user: any) => {
          const createdAt = new Date(user.createdAt);
          return createdAt >= parseISO(dateRange.startDate) && 
                 createdAt <= parseISO(dateRange.endDate);
        }).length;
        
        setSummaryData(prev => ({
          ...prev,
          userCount: userResponse.data.length,
          newUserCount: newUsers
        }));
      }
    } catch (err: any) {
      console.error("Error fetching report data:", err);
      setError(err.message || "Đã xảy ra lỗi khi tải dữ liệu báo cáo");
    } finally {
      setIsLoading(false);
    }
  };

  // Translate role names to Vietnamese
  const translateRole = (role: string): string => {
    switch(role) {
      case 'admin': return 'Quản trị viên';
      case 'technician': return 'Kỹ thuật viên';
      case 'user': return 'Người dùng';
      default: return role;
    }
  };

  // Translate booking status to Vietnamese
  const translateStatus = (status: string): string => {
    switch(status) {
      case 'confirmed': return 'Đã xác nhận';
      case 'checked-in': return 'Đang sử dụng';
      case 'completed': return 'Đã sử dụng';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  // Handle date range change
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Export current report as CSV
  const handleExportCSV = async () => {
    try {
      let exportType = '';
      switch(activeTab) {
        case 'booking': exportType = 'booking'; break;
        case 'room': exportType = 'room-utilization'; break;
        case 'user': exportType = 'user-activity'; break;
      }
      
      const blob = await reportService.exportReport(
        exportType, 
        dateRange.startDate, 
        dateRange.endDate
      );
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${exportType}-report-${dateRange.startDate}-to-${dateRange.endDate}.csv`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      console.error("Error exporting report:", err);
      setError(err.message || "Đã xảy ra lỗi khi xuất báo cáo");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <DashNavbar />
      
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        
        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p>{error}</p>
          </div>
        )}
        
        {/* Filter Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Từ ngày
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                Đến ngày
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        
        </div>
        
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('booking')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'booking'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Đặt phòng
            </button>
            <button
              onClick={() => setActiveTab('room')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'room'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Phòng học
            </button>
            <button
              onClick={() => setActiveTab('user')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'user'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Người dùng
            </button>
          </nav>
        </div>
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-center my-12">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        {/* Report Content */}
        {!isLoading && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {activeTab === 'booking' && (
                <>
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Tổng số đặt phòng
                    </h2>
                    <p className="mt-2 text-3xl font-extrabold text-gray-900">
                      {summaryData.totalBookings}
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Đã hoàn thành
                    </h2>
                    <p className="mt-2 text-3xl font-extrabold text-green-600">
                      {summaryData.completedBookings}
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Đã hủy
                    </h2>
                    <p className="mt-2 text-3xl font-extrabold text-red-600">
                      {summaryData.cancelledBookings}
                    </p>
                  </div>
                </>
              )}
              
              {activeTab === 'room' && (
                <>
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Tổng số phòng
                    </h2>
                    <p className="mt-2 text-3xl font-extrabold text-gray-900">
                      {summaryData.roomCount}
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Phòng sử dụng nhiều nhất
                    </h2>
                    <p className="mt-2 text-xl font-bold text-blue-600">
                      {summaryData.mostUsedRoom}
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Thời gian báo cáo
                    </h2>
                    <p className="mt-2 text-lg font-bold text-gray-700">
                      {dateRange.startDate} đến {dateRange.endDate}
                    </p>
                  </div>
                </>
              )}
              
              {activeTab === 'user' && (
                <>
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Tổng số người dùng
                    </h2>
                    <p className="mt-2 text-3xl font-extrabold text-gray-900">
                      {summaryData.userCount}
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Người dùng mới
                    </h2>
                    <p className="mt-2 text-3xl font-extrabold text-green-600">
                      {summaryData.newUserCount}
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Thời gian báo cáo
                    </h2>
                    <p className="mt-2 text-lg font-bold text-gray-700">
                      {dateRange.startDate} đến {dateRange.endDate}
                    </p>
                  </div>
                </>
              )}
            </div>
            
            {/* Charts */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              {activeTab === 'booking' && (
                <>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Phân bố trạng thái đặt phòng
                  </h2>
                  {bookingStats.length > 0 ? (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={bookingStats.map(item => ({
                              ...item,
                              name: translateStatus(item.status)
                            }))}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={130}
                            fill="#8884d8"
                            dataKey="count"
                            nameKey="name"
                          >
                            {bookingStats.map((_: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-10">
                      Không có dữ liệu đặt phòng trong khoảng thời gian này
                    </p>
                  )}
                </>
              )}
              
              {activeTab === 'room' && (
                <>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Thống kê sử dụng phòng học
                  </h2>
                  {roomStats.length > 0 ? (
                    <div className="h-96">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={roomStats.slice(0, 10)} // Show top 10 rooms
                          layout="vertical"
                          margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis 
                            dataKey="name" 
                            type="category" 
                            tick={{ fontSize: 12 }} 
                            width={100}
                          />
                          <Tooltip formatter={(value) => [`${value}`, '']} />
                          <Legend />
                          <Bar 
                            dataKey="bookings" 
                            name="Số lượt đặt" 
                            fill="#8884d8" 
                          />
                          <Bar 
                            dataKey="hours" 
                            name="Số giờ sử dụng" 
                            fill="#82ca9d" 
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-10">
                      Không có dữ liệu sử dụng phòng trong khoảng thời gian này
                    </p>
                  )}
                </>
              )}
              
              {activeTab === 'user' && (
                <>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Phân bố người dùng theo vai trò
                  </h2>
                  {userStats.length > 0 ? (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={userStats}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({name, value}) => `${name}: ${value}`}
                            outerRadius={130}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                          >
                            {userStats.map((_: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-10">
                      Không có dữ liệu người dùng
                    </p>
                  )}
                </>
              )}
            </div>
            
            {/* Data Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {activeTab === 'booking' ? 'Chi tiết đặt phòng' : 
                   activeTab === 'room' ? 'Chi tiết sử dụng phòng' : 
                   'Chi tiết người dùng'}
                </h3>
              </div>
              
              <div className="overflow-x-auto">
                {activeTab === 'booking' && (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Trạng thái
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Số lượng
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tỷ lệ
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {bookingStats.map((stat, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {translateStatus(stat.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {stat.count}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {summaryData.totalBookings > 0 
                              ? `${((stat.count / summaryData.totalBookings) * 100).toFixed(1)}%` 
                              : '0%'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                
                {activeTab === 'room' && (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Phòng
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Số lượt đặt
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Số giờ sử dụng
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tỷ lệ sử dụng
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {roomStats.map((room, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {room.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {room.bookings}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {room.hours}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {room.utilization}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                
                {activeTab === 'user' && (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Vai trò
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Số lượng
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tỷ lệ
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {userStats.map((stat, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {stat.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {stat.value}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {summaryData.userCount > 0 
                              ? `${((stat.value / summaryData.userCount) * 100).toFixed(1)}%` 
                              : '0%'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminReport;