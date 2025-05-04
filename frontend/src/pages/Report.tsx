import React, { useState, useEffect } from "react";
import { DashNavbar } from "../components/DashNavbar";
import { adminService } from "../services/admin.service";
import { reportService } from "../services/report.service";
import { format, subDays, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const Report: React.FC = () => {
  // State variables
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [reportType, setReportType] = useState<string>("booking");
  const [dateRange, setDateRange] = useState({
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });
  const [reportData, setReportData] = useState<any>({
    bookingStats: [],
    roomUtilization: [],
    timeDistribution: [],
    userStats: [],
    summaryStats: {
      totalBookings: 0,
      successRate: 0,
      previousPeriodChange: 0,
      mostUsedRoom: '',
      avgUtilization: 0,
      totalUsers: 0,
      newUsers: 0
    }
  });
  const [exportLoading, setExportLoading] = useState<boolean>(false);

  // Fetch report data when report type or date range changes
  useEffect(() => {
    fetchReportData();
  }, [reportType, dateRange]);

  // Fetch relevant report data
  const fetchReportData = async () => {
    setIsLoading(true);
    setError("");

    try {
      // Calculate previous period for comparison
      const currentStartDate = parseISO(dateRange.startDate);
      const currentEndDate = parseISO(dateRange.endDate);
      const dayDiff = Math.round((currentEndDate.getTime() - currentStartDate.getTime()) / (1000 * 60 * 60 * 24));
      
      const previousStartDate = format(subDays(currentStartDate, dayDiff), 'yyyy-MM-dd');
      const previousEndDate = format(subDays(currentEndDate, dayDiff), 'yyyy-MM-dd');

      let response;
      let previousResponse;

      switch(reportType) {
        case "booking":
          // Current period data
          response = await reportService.getUsageReport(dateRange.startDate, dateRange.endDate);
          
          // Previous period data for comparison
          previousResponse = await reportService.getUsageReport(previousStartDate, previousEndDate);
          
          if (response.success) {
            const bookingsByStatus = response.data.bookingsByStatus || [];
            const timeDistribution = response.data.timeDistribution || [];
            
            // Calculate stats comparison
            let previousTotalBookings = 0;
            if (previousResponse.success) {
              previousTotalBookings = previousResponse.data.totalBookings || 0;
            }
            
            const currentTotalBookings = response.data.totalBookings || 0;
            const completedBookings = response.data.completedBookings || 0;
            
            // Calculate percentage change
            const percentChange = previousTotalBookings === 0 
              ? 100 
              : ((currentTotalBookings - previousTotalBookings) / previousTotalBookings) * 100;
            
            // Calculate success rate
            const successRate = currentTotalBookings === 0 
              ? 0 
              : (completedBookings / currentTotalBookings) * 100;
            
            setReportData(prev => ({
              ...prev,
              bookingStats: bookingsByStatus,
              timeDistribution: timeDistribution,
              summaryStats: {
                ...(prev.summaryStats || {}),
                totalBookings: currentTotalBookings,
                successRate: Math.round(successRate),
                previousPeriodChange: Math.round(percentChange)
              }
            }));
          }
          break;
          
        case "room":
          response = await reportService.getRoomUtilizationReport(dateRange.startDate, dateRange.endDate);
          
          if (response.success) {
            const roomUtilization = response.data.roomUtilization || [];
            
            // Sort rooms by usage (descending)
            roomUtilization.sort((a: any, b: any) => b.hours - a.hours);
            
            const mostUsedRoom = roomUtilization.length > 0 ? roomUtilization[0].name : 'N/A';
            
            // Calculate average utilization
            const avgUtilization = roomUtilization.length > 0
              ? roomUtilization.reduce((sum: number, room: any) => sum + room.utilization, 0) / roomUtilization.length
              : 0;
            
            setReportData(prev => ({
              ...prev,
              roomUtilization: roomUtilization,
              summaryStats: {
                ...(prev.summaryStats || {}),
                mostUsedRoom,
                avgUtilization: Math.round(avgUtilization)
              }
            }));
          }
          break;
          
        case "user":
          // Get user statistics
          const userActivityResponse = await reportService.getUserActivityReport(dateRange.startDate, dateRange.endDate);
          const allUsersResponse = await adminService.getAllUsers();
          
          if (userActivityResponse.success && allUsersResponse.success) {
            const userStats = processUserStats(allUsersResponse.data);
            const totalUsers = allUsersResponse.data.length;
            
            // Count new users created within the date range
            const newUsers = allUsersResponse.data.filter(user => {
              const createdAt = new Date(user.createdAt);
              return createdAt >= parseISO(dateRange.startDate) && createdAt <= parseISO(dateRange.endDate);
            }).length;
            
            setReportData(prev => ({
              ...prev,
              userStats,
              summaryStats: {
                ...(prev.summaryStats || {}),
                totalUsers,
                newUsers
              }
            }));
          }
          break;
      }
    } catch (err: any) {
      console.error("Error fetching report data:", err);
      setError(err.message || "Đã xảy ra lỗi khi tải dữ liệu báo cáo");
    } finally {
      setIsLoading(false);
    }
  };

  // Process user data for statistics
  const processUserStats = (users: any[]) => {
    const roleCount = users.reduce((acc: Record<string, number>, user) => {
      // Translate roles to Vietnamese for better display
      let roleName;
      switch(user.role) {
        case 'admin':
          roleName = 'Quản trị viên';
          break;
        case 'technician':
          roleName = 'Kỹ thuật viên';
          break;
        case 'user':
          roleName = 'Người dùng';
          break;
        default:
          roleName = user.role;
      }
      
      acc[roleName] = (acc[roleName] || 0) + 1;
      return acc;
    }, {});

    return Object.keys(roleCount).map(role => ({
      name: role,
      value: roleCount[role]
    }));
  };

  // Handle date range change
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle report download
  const handleExport = async (format: 'csv' | 'excel') => {
    setExportLoading(true);
    try {
      let exportType;
      switch(reportType) {
        case 'booking':
          exportType = 'booking';
          break;
        case 'room':
          exportType = 'room-utilization';
          break;
        case 'user':
          exportType = 'user-activity';
          break;
        default:
          exportType = 'general';
      }
      
      const blob = await reportService.exportReport(exportType, dateRange.startDate, dateRange.endDate);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${exportType}-report-${dateRange.startDate}-to-${dateRange.endDate}.${format}`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      console.error("Error exporting report:", err);
      setError(err.message || "Đã xảy ra lỗi khi xuất báo cáo");
    } finally {
      setExportLoading(false);
    }
  };

  // Format percentage for display
  const formatPercentChange = (value: number) => {
    const prefix = value >= 0 ? '+' : '';
    return `${prefix}${value}%`;
  };

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="min-h-screen bg-gray-100">
      <DashNavbar />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Báo cáo thống kê</h1>
            
            <div className="flex space-x-2">
              <button 
                onClick={() => handleExport('excel')}
                disabled={exportLoading || isLoading}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center disabled:opacity-50"
              >
                {exportLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang xuất...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Excel
                  </>
                )}
              </button>
              <button 
                onClick={() => handleExport('csv')}
                disabled={exportLoading || isLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                CSV
              </button>
            </div>
          </div>
          
          {/* Error message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              <p>{error}</p>
            </div>
          )}
          
          {/* Filter Controls */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="reportType" className="block text-sm font-medium text-gray-700 mb-1">Loại báo cáo</label>
                <select
                  id="reportType"
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="booking">Thống kê đặt phòng</option>
                  <option value="room">Thống kê sử dụng phòng</option>
                  <option value="user">Thống kê người dùng</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
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
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
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
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={fetchReportData}
                disabled={isLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang tạo báo cáo...
                  </>
                ) : (
                  'Tạo báo cáo'
                )}
              </button>
            </div>
          </div>
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-center my-12">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          
          {!isLoading && (
            <>
              {reportType === "booking" && (
                <>
                  {/* Booking Status Distribution */}
                  <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Phân bố trạng thái đặt phòng</h2>
                    {reportData.bookingStats && reportData.bookingStats.length > 0 ? (
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={reportData.bookingStats}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="count"
                              nameKey="status"
                            >
                              {reportData.bookingStats.map((_: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value, name) => {
                              // Translate status names for the tooltip
                              let statusName;
                              switch(name) {
                                case 'pending': return ['Chờ xác nhận', value];
                                case 'confirmed': return ['Đã xác nhận', value];
                                case 'checked-in': return ['Đang sử dụng', value];
                                case 'completed': return ['Đã sử dụng', value];
                                case 'cancelled': return ['Đã hủy', value];
                                default: return [name, value];
                              }
                            }} />
                            <Legend formatter={(value) => {
                              // Translate status names for the legend
                              switch(value) {
                                case 'pending': return 'Chờ xác nhận';
                                case 'confirmed': return 'Đã xác nhận';
                                case 'checked-in': return 'Đang sử dụng';
                                case 'completed': return 'Đã sử dụng';
                                case 'cancelled': return 'Đã hủy';
                                default: return value;
                              }
                            }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="flex justify-center items-center h-80 text-gray-500">
                        Không có dữ liệu để hiển thị
                      </div>
                    )}
                  </div>
                  
                  {/* Time Distribution */}
                  <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Phân bố đặt phòng theo giờ</h2>
                    {reportData.timeDistribution && reportData.timeDistribution.length > 0 ? (
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={reportData.timeDistribution}
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
                      <div className="flex justify-center items-center h-80 text-gray-500">
                        Không có dữ liệu để hiển thị
                      </div>
                    )}
                  </div>
                </>
              )}
              
              {reportType === "room" && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Mức độ sử dụng phòng học</h2>
                  {reportData.roomUtilization && reportData.roomUtilization.length > 0 ? (
                    <div className="h-96">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={reportData.roomUtilization}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          layout="vertical"
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" width={100} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="bookings" name="Số lần đặt" fill="#8884d8" />
                          <Bar dataKey="hours" name="Số giờ sử dụng" fill="#82ca9d" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="flex justify-center items-center h-96 text-gray-500">
                      Không có dữ liệu để hiển thị
                    </div>
                  )}
                </div>
              )}
              
              {reportType === "user" && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Thống kê người dùng theo vai trò</h2>
                  {reportData.userStats && reportData.userStats.length > 0 ? (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={reportData.userStats}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({name, value}) => `${name}: ${value}`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {reportData.userStats.map((_: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="flex justify-center items-center h-80 text-gray-500">
                      Không có dữ liệu để hiển thị
                    </div>
                  )}
                </div>
              )}
              
              {/* Summary Statistics */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Tóm tắt số liệu</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Chỉ số
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Giá trị
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          So với kỳ trước
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reportType === "booking" && (
                        <>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              Tổng số đặt phòng
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {reportData.summaryStats.totalBookings}
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                              reportData.summaryStats.previousPeriodChange >= 0 
                                ? 'text-green-500' 
                                : 'text-red-500'
                            }`}>
                              {formatPercentChange(reportData.summaryStats.previousPeriodChange)}
                            </td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              Tỷ lệ đặt phòng thành công
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {reportData.summaryStats.successRate}%
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              -
                            </td>
                          </tr>
                        </>
                      )}
                      
                      {reportType === "room" && (
                        <>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              Phòng sử dụng nhiều nhất
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {reportData.summaryStats.mostUsedRoom}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              -
                            </td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              Tỷ lệ sử dụng phòng trung bình
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {reportData.summaryStats.avgUtilization}%
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              -
                            </td>
                          </tr>
                        </>
                      )}
                      
                      {reportType === "user" && (
                        <>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              Tổng số người dùng
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {reportData.summaryStats.totalUsers}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              -
                            </td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              Người dùng mới trong kỳ
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {reportData.summaryStats.newUsers}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              -
                            </td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Report;