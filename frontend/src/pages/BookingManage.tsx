import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashNavbar } from "../components/DashNavbar";
import { adminService } from "../services/admin.service";

interface Room {
  id: number;
  name: string;
  capacity: number;
  location: string;
  status: string;
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

const BookingManagement: React.FC = () => {
  const navigate = useNavigate();
  
  // State
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRangeFilter, setDateRangeFilter] = useState({
    startDate: "",
    endDate: ""
  });
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentReservation, setCurrentReservation] = useState<Reservation | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  
  // Clear success message after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess("");
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [success]);
  
  // Fetch reservations on component mount
  useEffect(() => {
    fetchReservations();
  }, []);

  // Filter reservations when filters or search change
  useEffect(() => {
    let result = [...reservations];

    // Filter by search term
    if (searchTerm) {
      result = result.filter(reservation => 
        reservation.room?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.room?.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      result = result.filter(reservation => reservation.status === statusFilter);
    }

    // Filter by date range
    if (dateRangeFilter.startDate) {
      const startDate = new Date(dateRangeFilter.startDate);
      result = result.filter(reservation => new Date(reservation.startTime) >= startDate);
    }

    if (dateRangeFilter.endDate) {
      const endDate = new Date(dateRangeFilter.endDate);
      // Set to end of day
      endDate.setHours(23, 59, 59, 999);
      result = result.filter(reservation => new Date(reservation.startTime) <= endDate);
    }

    setFilteredReservations(result);
  }, [reservations, searchTerm, statusFilter, dateRangeFilter]);

  // Fetch reservations data
  const fetchReservations = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      const response = await adminService.getAllReservations();
      
      if (response.success) {
        setReservations(response.data);
        setFilteredReservations(response.data);
      } else {
        setError("Không thể tải danh sách đặt phòng");
      }
    } catch (err: any) {
      console.error("Error fetching reservations:", err);
      setError(err.message || "Đã xảy ra lỗi khi tải danh sách đặt phòng");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle date range filter change
  const handleDateFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRangeFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Format date and time
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  // Handle approve reservation
  const handleApproveReservation = async (id: number) => {
    setActionLoading(id);
    setError("");
    
    try {
      const response = await adminService.approveReservation(id);
      
      if (response.success) {
        // Update reservations list
        const updatedReservations = reservations.map(reservation => 
          reservation.id === id ? { ...reservation, status: 'confirmed' } : reservation
        );
        setReservations(updatedReservations);
        setSuccess("Xác nhận đặt phòng thành công");
      } else {
        setError("Không thể xác nhận đặt phòng");
      }
    } catch (err: any) {
      console.error("Error approving reservation:", err);
      setError(err.message || "Đã xảy ra lỗi khi xác nhận đặt phòng");
    } finally {
      setActionLoading(null);
    }
  };

  // Handle reject reservation
  const handleRejectReservation = async (id: number) => {
    setActionLoading(id);
    setError("");
    
    try {
      const response = await adminService.rejectReservation(id);
      
      if (response.success) {
        // Update reservations list
        const updatedReservations = reservations.map(reservation => 
          reservation.id === id ? { ...reservation, status: 'cancelled' } : reservation
        );
        setReservations(updatedReservations);
        setSuccess("Từ chối đặt phòng thành công");
      } else {
        setError("Không thể từ chối đặt phòng");
      }
    } catch (err: any) {
      console.error("Error rejecting reservation:", err);
      setError(err.message || "Đã xảy ra lỗi khi từ chối đặt phòng");
    } finally {
      setActionLoading(null);
    }
  };

  // Handle check-in
  const handleCheckIn = async (id: number) => {
    setActionLoading(id);
    setError("");
    
    try {
      const response = await adminService.checkInReservation(id);
      
      if (response.success) {
        // Update reservations list
        const updatedReservations = reservations.map(reservation => 
          reservation.id === id ? { ...reservation, status: 'checked-in' } : reservation
        );
        setReservations(updatedReservations);
        setSuccess("Check-in thành công");
      } else {
        setError("Không thể check-in");
      }
    } catch (err: any) {
      console.error("Error checking in:", err);
      setError(err.message || "Đã xảy ra lỗi khi check-in");
    } finally {
      setActionLoading(null);
    }
  };

  // Handle check-out
  const handleCheckOut = async (id: number) => {
    setActionLoading(id);
    setError("");
    
    try {
      const response = await adminService.checkOutReservation(id);
      
      if (response.success) {
        // Update reservations list
        const updatedReservations = reservations.map(reservation => 
          reservation.id === id ? { ...reservation, status: 'completed' } : reservation
        );
        setReservations(updatedReservations);
        setSuccess("Check-out thành công");
      } else {
        setError("Không thể check-out");
      }
    } catch (err: any) {
      console.error("Error checking out:", err);
      setError(err.message || "Đã xảy ra lỗi khi check-out");
    } finally {
      setActionLoading(null);
    }
  };

  // Show reservation details
  const openDetailsModal = (reservation: Reservation) => {
    setCurrentReservation(reservation);
    setShowDetailsModal(true);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending':
        return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Chờ xác nhận</span>;
      case 'confirmed':
        return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Đã xác nhận</span>;
      case 'checked-in':
        return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Đang sử dụng</span>;
      case 'completed':
        return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Đã sử dụng</span>;
      case 'cancelled':
        return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Đã hủy</span>;
      default:
        return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setDateRangeFilter({
      startDate: "",
      endDate: ""
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <DashNavbar />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Quản lý đặt phòng</h1>
            
            <button 
              onClick={fetchReservations} 
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang tải...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                  Làm mới
                </>
              )}
            </button>
          </div>
          
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{success}</span>
              <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setSuccess("")}>
                <svg className="fill-current h-6 w-6 text-green-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <title>Đóng</title>
                  <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
                </svg>
              </span>
            </div>
          )}
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
              <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError("")}>
                <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <title>Đóng</title>
                  <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
                </svg>
              </span>
            </div>
          )}
          
          {/* Filters */}
          <div className="bg-white shadow rounded-lg mb-6 p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700">Tìm kiếm</label>
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tên phòng hoặc người dùng..."
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 text-sm"
                />
              </div>
              
              {/* Status filter */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">Trạng thái</label>
                <select
                  id="status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 text-sm"
                >
                  <option value="all">Tất cả</option>
                  <option value="pending">Chờ xác nhận</option>
                  <option value="confirmed">Đã xác nhận</option>
                  <option value="checked-in">Đang sử dụng</option>
                  <option value="completed">Đã sử dụng</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </div>
              
              {/* Start date filter */}
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Từ ngày</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={dateRangeFilter.startDate}
                  onChange={handleDateFilterChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 text-sm"
                />
              </div>
              
              {/* End date filter */}
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">Đến ngày</label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={dateRangeFilter.endDate}
                  onChange={handleDateFilterChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 text-sm"
                />
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors text-sm"
              >
                Xóa bộ lọc
              </button>
            </div>
          </div>
          
          {/* Reservations Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Danh sách đặt phòng
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {filteredReservations.length} đặt phòng được tìm thấy
              </p>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredReservations.length === 0 ? (
              <div className="text-center py-12 px-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Không tìm thấy đặt phòng nào</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Thay đổi các bộ lọc để xem nhiều kết quả hơn.
                </p>
              </div>
            ) : (
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
                    {filteredReservations.map((reservation) => (
                      <tr key={reservation.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {reservation.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {reservation.user?.fullName || `Người dùng #${reservation.userId}`}
                          </div>
                          <div className="text-sm text-gray-500">
                            {reservation.user?.email || ''}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {reservation.room?.name || `Phòng #${reservation.roomId}`}
                          </div>
                          <div className="text-sm text-gray-500">
                            {reservation.room?.location || ''}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(reservation.startTime)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatTime(reservation.startTime)} - {formatTime(reservation.endTime)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(reservation.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => openDetailsModal(reservation)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Chi tiết
                            </button>
                            
                            {reservation.status === 'pending' && (
                              <>
                                <button 
                                  onClick={() => handleApproveReservation(reservation.id)}
                                  disabled={actionLoading === reservation.id}
                                  className={`text-green-600 hover:text-green-900 ${actionLoading === reservation.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                  {actionLoading === reservation.id ? 'Đang xử lý...' : 'Xác nhận'}
                                </button>
                                <button 
                                  onClick={() => handleRejectReservation(reservation.id)}
                                  disabled={actionLoading === reservation.id}
                                  className={`text-red-600 hover:text-red-900 ${actionLoading === reservation.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                  {actionLoading === reservation.id ? 'Đang xử lý...' : 'Từ chối'}
                                </button>
                              </>
                            )}
                            
                            {reservation.status === 'confirmed' && (
                              <button 
                                onClick={() => handleCheckIn(reservation.id)}
                                disabled={actionLoading === reservation.id}
                                className={`text-blue-600 hover:text-blue-900 ${actionLoading === reservation.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                {actionLoading === reservation.id ? 'Đang xử lý...' : 'Check-in'}
                              </button>
                            )}
                            
                            {reservation.status === 'checked-in' && (
                              <button 
                                onClick={() => handleCheckOut(reservation.id)}
                                disabled={actionLoading === reservation.id}
                                className={`text-blue-600 hover:text-blue-900 ${actionLoading === reservation.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                {actionLoading === reservation.id ? 'Đang xử lý...' : 'Check-out'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Reservation details modal */}
      {showDetailsModal && currentReservation && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Chi tiết đặt phòng #{currentReservation.id}
                    </h3>
                    
                    <div className="mt-4 border-t border-gray-200 pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Phòng</p>
                          <p className="mt-1 text-sm text-gray-900">
                            {currentReservation.room?.name || `Phòng #${currentReservation.roomId}`}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-gray-500">Vị trí</p>
                          <p className="mt-1 text-sm text-gray-900">
                            {currentReservation.room?.location || 'Không có thông tin'}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-gray-500">Sức chứa</p>
                          <p className="mt-1 text-sm text-gray-900">
                            {currentReservation.room?.capacity || 'Không có thông tin'} người
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-gray-500">Trang thiết bị</p>
                          
                        </div>
                      </div>
                      
                      <div className="mt-4 border-t border-gray-200 pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Người đặt</p>
                            <p className="mt-1 text-sm text-gray-900">
                              {currentReservation.user?.fullName || `Người dùng #${currentReservation.userId}`}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium text-gray-500">Email</p>
                            <p className="mt-1 text-sm text-gray-900">
                              {currentReservation.user?.email || 'Không có thông tin'}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium text-gray-500">Ngày đặt</p>
                            <p className="mt-1 text-sm text-gray-900">
                              {formatDate(currentReservation.startTime)}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium text-gray-500">Thời gian</p>
                            <p className="mt-1 text-sm text-gray-900">
                              {formatTime(currentReservation.startTime)} - {formatTime(currentReservation.endTime)}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium text-gray-500">Trạng thái</p>
                            <div className="mt-1">
                              {getStatusBadge(currentReservation.status)}
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium text-gray-500">Ngày tạo</p>
                            <p className="mt-1 text-sm text-gray-900">
                              {formatDate(currentReservation.createdAt)} {formatTime(currentReservation.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                {currentReservation.status === 'pending' && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        handleApproveReservation(currentReservation.id);
                        setShowDetailsModal(false);
                      }}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Xác nhận
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleRejectReservation(currentReservation.id);
                        setShowDetailsModal(false);
                      }}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Từ chối
                    </button>
                  </>
                )}
                
                {currentReservation.status === 'confirmed' && (
                  <button
                    type="button"
                    onClick={() => {
                      handleCheckIn(currentReservation.id);
                      setShowDetailsModal(false);
                    }}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Check-in
                  </button>
                )}
                
                {currentReservation.status === 'checked-in' && (
                  <button
                    type="button"
                    onClick={() => {
                      handleCheckOut(currentReservation.id);
                      setShowDetailsModal(false);
                    }}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Check-out
                  </button>
                )}
                
                <button
                  type="button"
                  onClick={() => setShowDetailsModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManagement;