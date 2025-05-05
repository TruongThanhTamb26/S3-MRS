import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashNavbar } from "../components/DashNavbar";
import { adminService } from "../services/admin.service";
import { userService } from "../services/user.service";
import QRCodeGenerator from '../components/QRCodeGenerator';

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
  const [detailsLoading, setDetailsLoading] = useState(false);
  
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

  // Fetch reservations data with enhanced details
  const fetchReservations = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      const response = await adminService.getAllReservations();
      
      if (response.success) {
        const reservationsData = response.data;
        
        // Get complete details for each reservation
        const enhancedReservations = await Promise.all(
          reservationsData.map(async (reservation: Reservation) => {
            let enhancedReservation = { ...reservation };
            
            // If room details are missing or incomplete
            if (!reservation.room || !reservation.room.equipment) {
              try {
                const roomResponse = await userService.getRoomDetails(reservation.roomId);
                if (roomResponse.success) {
                  enhancedReservation.room = roomResponse.data;
                }
              } catch (error) {
                console.error(`Error fetching details for room ${reservation.roomId}:`, error);
              }
            }
            
            // If user details are missing or incomplete
            if (!reservation.user) {
              try {
                const userResponse = await adminService.getUserById(reservation.userId);
                if (userResponse.success) {
                  enhancedReservation.user = userResponse.data;
                }
              } catch (error) {
                console.error(`Error fetching details for user ${reservation.userId}:`, error);
              }
            }
            
            return enhancedReservation;
          })
        );
        
        setReservations(enhancedReservations);
        setFilteredReservations(enhancedReservations);
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

  // Load detailed reservation info
  const loadDetailedReservation = async (reservation: Reservation) => {
    setDetailsLoading(true);
    let detailedReservation = { ...reservation };
    
    try {
      // Fetch complete room details
      if (reservation.roomId) {
        const roomResponse = await userService.getRoomDetails(reservation.roomId);
        if (roomResponse.success) {
          detailedReservation.room = roomResponse.data;
        }
      }
      
      // Fetch complete user details
      if (reservation.userId) {
        const userResponse = await adminService.getUserById(reservation.userId);
        if (userResponse.success) {
          detailedReservation.user = userResponse.data;
        }
      }
      
      setCurrentReservation(detailedReservation);
    } catch (err: any) {
      console.error("Error loading detailed reservation:", err);
      // Still set the reservation, even with partial data
      setCurrentReservation(detailedReservation);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Show reservation details
  const openDetailsModal = async (reservation: Reservation) => {
    await loadDetailedReservation(reservation);
    setShowDetailsModal(true);
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
        
        // Update current reservation if it's the one being approved
        if (currentReservation && currentReservation.id === id) {
          setCurrentReservation({
            ...currentReservation,
            status: 'confirmed'
          });
        }
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
        
        // Update current reservation if it's the one being rejected
        if (currentReservation && currentReservation.id === id) {
          setCurrentReservation({
            ...currentReservation,
            status: 'cancelled'
          });
        }
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
        
        // Update current reservation if it's the one being checked in
        if (currentReservation && currentReservation.id === id) {
          setCurrentReservation({
            ...currentReservation,
            status: 'checked-in'
          });
        }
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
        
        // Update current reservation if it's the one being checked out
        if (currentReservation && currentReservation.id === id) {
          setCurrentReservation({
            ...currentReservation,
            status: 'completed'
          });
        }
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

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch(status) {
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

  // Render equipment list
  const renderEquipment = (equipment?: Equipment) => {
    if (!equipment) return 'Không có thông tin';
    
    return (
      <ul className="mt-1 text-sm text-gray-900">
        {Object.entries(equipment).map(([key, value]) => (
          value > 0 && (
            <li key={key} className="flex items-center">
              <span>{key}: {value}</span>
            </li>
          )
        ))}
      </ul>
    );
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
                            
                            {reservation.status === 'confirmed' && (
                              <button 
                                onClick={() => openDetailsModal(reservation)}
                                className="text-blue-600 hover:text-blue-900 flex items-center"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v-4m6 0H4" />
                                </svg>
                                Mã QR Check-in
                              </button>
                            )}
                            
                            {reservation.status === 'checked-in' && (
                              <button 
                                onClick={() => openDetailsModal(reservation)}
                                className="text-blue-600 hover:text-blue-900 flex items-center"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v-4m6 0H4" />
                                </svg>
                                Mã QR Check-out
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  Chi tiết đặt phòng #{currentReservation.id}
                </h2>
                <button 
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {detailsLoading ? (
                <div className="flex justify-center my-12">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Booking Info */}
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h3 className="font-medium text-gray-700 mb-2">Thông tin đặt phòng</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">ID:</span>
                          <span className="font-medium">{currentReservation.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Ngày tạo:</span>
                          <span className="font-medium">
                            {new Date(currentReservation.createdAt).toLocaleString('vi-VN')}
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
                            }[currentReservation.status] || 'bg-gray-100 text-gray-800'
                          }`}>
                            {
                              {
                                'confirmed': 'Đã xác nhận',
                                'cancelled': 'Đã hủy',
                                'rejected': 'Bị từ chối',
                                'checked-in': 'Đang sử dụng',
                                'completed': 'Hoàn thành'
                              }[currentReservation.status] || currentReservation.status
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
                            {currentReservation.room?.name || `Phòng #${currentReservation.roomId}`}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Cơ sở:</span>
                          <span className="font-medium">
                            {currentReservation.room?.location || 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Sức chứa:</span>
                          <span className="font-medium">
                            {currentReservation.room?.capacity || 'N/A'} người
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
                            {currentReservation.user?.fullName || `User #${currentReservation.userId}`}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Email:</span>
                          <span className="font-medium">
                            {currentReservation.user?.email || 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Vai trò:</span>
                          <span className="font-medium">
                            {currentReservation.user?.role === 'student' ? 'Sinh viên' : 
                            currentReservation.user?.role === 'admin' ? 'Quản trị viên' : 
                            currentReservation.user?.role === 'technician' ? 'Kỹ thuật viên' : 
                            currentReservation.user?.role || 'N/A'}
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
                            {formatDate(currentReservation.startTime)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Bắt đầu:</span>
                          <span className="font-medium">
                            {formatTime(currentReservation.startTime)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Kết thúc:</span>
                          <span className="font-medium">
                            {formatTime(currentReservation.endTime)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Equipment section */}
                  <div className="bg-gray-50 p-4 rounded-md mb-6">
                    <h3 className="font-medium text-gray-700 mb-2">Trang thiết bị</h3>
                    <div className="text-sm text-gray-800">
                      {renderEquipment(currentReservation.room?.equipment)}
                    </div>
                  </div>
                  
                  {/* QR Code section */}
                  {(currentReservation.status === 'confirmed' || currentReservation.status === 'checked-in') && (
                    <div className="bg-gray-50 p-4 rounded-md mb-6">
                      <h3 className="font-medium text-gray-700 mb-2">
                        {currentReservation.status === 'confirmed' ? 'Mã QR Check-in' : 'Mã QR Check-out'}
                      </h3>
                      <div className="flex justify-center py-2">
                        <QRCodeGenerator 
                          reservationId={currentReservation.id} 
                          action={currentReservation.status === 'confirmed' ? 'check-in' : 'check-out'} 
                        />
                      </div>
                      <p className="text-sm text-gray-500 text-center mt-2">
                        Quét mã QR này để {currentReservation.status === 'confirmed' ? 'checked-in' : 'check-out'} đặt phòng
                      </p>
                    </div>
                  )}
                  
                  {/* Actions */}
                  <div className="flex flex-wrap justify-end space-x-2 gap-y-2">
                    
                    {currentReservation.status === 'confirmed' && (
                      <div className="flex flex-col w-full mb-4">
                        <div className="border-t border-gray-200 pt-4 mb-2">
                          <p className="text-sm text-gray-600 mb-2">
                            <span className="font-medium">Hướng dẫn:</span> Người dùng cần quét mã QR check-in ở trên để bắt đầu sử dụng phòng.
                          </p>
                          <p className="text-sm text-red-500">
                            <span className="font-medium">Chính sách:</span> Hệ thống sẽ tự động hủy đặt phòng nếu người dùng không check-in trong vòng 30 phút sau giờ bắt đầu.
                          </p>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <button
                            type="button"
                            onClick={() => {
                              // Admin vẫn có thể check-in thủ công nếu cần
                              handleCheckIn(currentReservation.id);
                              setShowDetailsModal(false);
                            }}
                            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                            disabled={actionLoading === currentReservation.id}
                          >
                            {actionLoading === currentReservation.id ? 'Đang xử lý...' : 'Check-in thủ công'}
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {currentReservation.status === 'checked-in' && (
                      <div className="flex flex-col w-full mb-4">
                        <div className="border-t border-gray-200 pt-4 mb-2">
                          <p className="text-sm text-gray-600 mb-2">
                            <span className="font-medium">Hướng dẫn:</span> Người dùng cần quét mã QR check-out ở trên khi kết thúc sử dụng phòng.
                          </p>
                          <p className="text-sm text-yellow-500">
                            <span className="font-medium">Chính sách:</span> Hệ thống sẽ tự động check-out khi hết thời gian đặt phòng.
                          </p>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <button
                            type="button"
                            onClick={() => {
                              // Admin vẫn có thể check-out thủ công nếu cần
                              handleCheckOut(currentReservation.id);
                              setShowDetailsModal(false);
                            }}
                            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                            disabled={actionLoading === currentReservation.id}
                          >
                            {actionLoading === currentReservation.id ? 'Đang xử lý...' : 'Check-out thủ công'}
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* Nút đóng modal luôn hiển thị */}
                    <button
                      onClick={() => setShowDetailsModal(false)}
                      className="px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
                    >
                      Đóng
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManagement;