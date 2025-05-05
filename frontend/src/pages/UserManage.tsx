import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import UserNavbar from "../components/UserNavbar";
import { userService } from "../services/user.service";

// Define reservation interface
interface Reservation {
  id: number;
  roomId: number;
  userId: number;
  startTime: string;
  endTime: string;
  status: string;
  room?: {
    id: number;
    name: string;
    location: string;
    capacity: number;
    equipment: {
      Mic: number;
      Projector: number;
      AirCon: number;
    }
  };
  createdAt: string;
  updatedAt: string;
}

const RoomManagement: React.FC = () => {
  // State variables
  const [viewHistory, setViewHistory] = useState<boolean>(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roomCache, setRoomCache] = useState<Record<number, any>>({});
  
  const navigate = useNavigate();
  const location = useLocation();

  // Check for success message from navigation state
  useEffect(() => {
    if (location.state && location.state.success && location.state.message) {
      setSuccessMessage(location.state.message);
      // Clear the message after 5 seconds
      setTimeout(() => setSuccessMessage(""), 5000);
      // Clear the navigation state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Format date and time for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const formatTime = (timeString: string) => {
    const time = new Date(timeString);
    return time.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Filter reservations whenever status filter changes
  useEffect(() => {
    if (statusFilter === "all") {
      setFilteredReservations(reservations);
    } else {
      setFilteredReservations(reservations.filter(res => res.status === statusFilter));
    }
  }, [statusFilter, reservations]);

  // Fetch user reservations on component mount and when view changes
  useEffect(() => {
    fetchReservations();
  }, [viewHistory]);

  const fetchReservations = async () => {
    setIsLoading(true);
    setError("");
  
    try {
      // Use userService to get reservations based on current view
      const status = viewHistory ? 'all' : 'all'; // Tạm thời dùng 'all' cho cả hai view
      console.log(`Đang tải dữ liệu đặt phòng với status: ${status}`);
      
      const response = await userService.getUserReservations();
  
      if (response.success && response.data.length > 0) {
        console.log(`Tìm thấy ${response.data.length} đặt phòng`);
        
        // Lấy thông tin phòng cho mỗi reservation
        const reservationsWithRoomDetails = await Promise.all(
          response.data.map(async (reservation) => {
            try {
              // Lấy thông tin phòng nếu chưa có hoặc không đầy đủ
              if (!reservation.room || Object.keys(reservation.room).length === 0) {
                // Kiểm tra cache trước
                if (roomCache[reservation.roomId]) {
                  return {
                    ...reservation,
                    room: roomCache[reservation.roomId]
                  };
                } else {
                  console.log(`Lấy thông tin chi tiết cho phòng ID: ${reservation.roomId}`);
                  const roomResponse = await userService.getRoomDetails(reservation.roomId);
                  
                  if (roomResponse.success) {
                    // Lưu vào cache
                    setRoomCache(prev => ({
                      ...prev,
                      [reservation.roomId]: roomResponse.data
                    }));
                    return {
                      ...reservation,
                      room: roomResponse.data
                    };
                  }
                }
              }
              return reservation;
            } catch (err) {
              console.error(`Lỗi khi lấy thông tin phòng ${reservation.roomId}:`, err);
              return reservation;
            }
          })
        );
        
        console.log("Dữ liệu đặt phòng với thông tin phòng đầy đủ:", reservationsWithRoomDetails);
        
        // Lọc theo lịch sử nếu cần
        const filteredByHistory = viewHistory 
          ? reservationsWithRoomDetails.filter(res => 
              ['completed', 'cancelled'].includes(res.status)
            )
          : reservationsWithRoomDetails.filter(res => 
              ['confirmed', 'checked-in'].includes(res.status)
            );
        
        setReservations(filteredByHistory);
        setFilteredReservations(filteredByHistory);
      } else {
        console.log("Không có đặt phòng nào hoặc lỗi API");
        setReservations([]);
        setFilteredReservations([]);
        if (!response.success) {
          setError(response.message || "Không thể tải thông tin đặt phòng");
        }
      }
    } catch (err: any) {
      console.error("Error fetching reservations:", err);
      setError(err.message || "Đã xảy ra lỗi khi tải thông tin đặt phòng");
      setReservations([]);
      setFilteredReservations([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle cancellation of a reservation
  const handleCancelReservation = async (reservationId: number) => {
    if (!window.confirm("Bạn có chắc muốn hủy đặt phòng này không?")) {
      return;
    }

    setActionLoading(reservationId);
    setError("");

    try {
      const response = await userService.cancelReservation(reservationId);

      if (response.success) {
        // Refresh the reservation list instead of filtering locally
        await fetchReservations();
        setSuccessMessage("Hủy đặt phòng thành công");
      } else {
        setError(response.message || "Không thể hủy đặt phòng");
      }
    } catch (err: any) {
      console.error("Error cancelling reservation:", err);
      setError(err.message || "Đã xảy ra lỗi khi hủy đặt phòng");
    } finally {
      setActionLoading(null);
    }
  };

  // Handle check-in
  const handleCheckIn = async (reservationId: number) => {
    setActionLoading(reservationId);
    setError("");

    try {
      const response = await userService.checkInReservation(reservationId);

      if (response.success) {
        await fetchReservations();
        setSuccessMessage("Check-in thành công");
      } else {
        setError(response.message || "Không thể check-in");
      }
    } catch (err: any) {
      console.error("Error during check-in:", err);
      setError(err.message || "Đã xảy ra lỗi khi check-in");
    } finally {
      setActionLoading(null);
    }
  };

  // Handle check-out
  const handleCheckOut = async (reservationId: number) => {
    setActionLoading(reservationId);
    setError("");

    try {
      const response = await userService.checkOutReservation(reservationId);

      if (response.success) {
        await fetchReservations();
        setSuccessMessage("Check-out thành công");
      } else {
        setError(response.message || "Không thể check-out");
      }
    } catch (err: any) {
      console.error("Error during check-out:", err);
      setError(err.message || "Đã xảy ra lỗi khi check-out");
    } finally {
      setActionLoading(null);
    }
  };

  // Get reservation status badge
  const getStatusBadge = (status: string) => {
    if (status === 'completed') {
      return <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded-full">Đã sử dụng</span>;
    }
    
    if (status === 'confirmed') {
      return <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">Đã xác nhận</span>;
    }

    if (status === 'cancelled') {
      return <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">Đã hủy</span>;
    }

    if (status === 'checked-in') {
      return <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">Đang sử dụng</span>;
    }
    
    return <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">{status}</span>;
  };

  // Check if a reservation can be checked in (based on time and status)
  const canCheckIn = (reservation: Reservation) => {
    if (reservation.status !== 'confirmed') return false;
    
    const now = new Date();
    const startTime = new Date(reservation.startTime);
    const endTime = new Date(reservation.endTime);
    
    // Can check in 15 minutes before start time and until end time
    const fifteenMinutesBefore = new Date(startTime);
    fifteenMinutesBefore.setMinutes(fifteenMinutesBefore.getMinutes() - 15);
    
    return now >= fifteenMinutesBefore && now <= endTime;
  };

  // Check if a reservation can be checked out (based on status)
  const canCheckOut = (reservation: Reservation) => {
    return reservation.status === 'checked-in';
  };

  // Render equipment icons
  const renderEquipment = (equipment: any) => {
    if (!equipment) return null;
    
    return (
      <div className="flex flex-wrap mt-2 gap-2">
        {equipment.Mic > 0 && (
          <div className="flex items-center bg-blue-50 px-2 py-1 rounded-md">
            <span className="text-sm mr-1">🎤</span>
            <span className="text-xs text-blue-800">{equipment.Mic}</span>
          </div>
        )}
        {equipment.Projector > 0 && (
          <div className="flex items-center bg-blue-50 px-2 py-1 rounded-md">
            <span className="text-sm mr-1">📽️</span>
            <span className="text-xs text-blue-800">{equipment.Projector}</span>
          </div>
        )}
        {equipment.AirCon > 0 && (
          <div className="flex items-center bg-blue-50 px-2 py-1 rounded-md">
            <span className="text-sm mr-1">❄️</span>
            <span className="text-xs text-blue-800">{equipment.AirCon}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white">
      {/* Navbar */}
      <UserNavbar />

      {/* Content */}
      <div className="flex-grow px-4 py-8 max-w-6xl mx-auto w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-800">Quản lý đặt phòng</h1>
          <button
            onClick={() => navigate('/qr-scanner')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Quét mã QR
          </button>
        </div>

        <h2 className="text-2xl font-bold text-blue-800 mb-6 text-center">
          QUẢN LÝ ĐẶT CHỖ
        </h2>

        {/* Success message */}
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            <p>{successMessage}</p>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p>{error}</p>
          </div>
        )}

        {/* Tab navigation */}
        <div className="mb-8 flex justify-center">
          <button
            onClick={() => {
              setViewHistory(!viewHistory);
              setStatusFilter("all");
            }}
            className="bg-white border-2 border-blue-700 text-blue-700 hover:bg-blue-50 px-6 py-2 rounded-md shadow-sm transition-colors font-medium"
          >
            {viewHistory ? "XEM ĐẶT CHỖ SẮP TỚI" : "XEM LỊCH SỬ ĐẶT CHỖ"}
          </button>
          
          {/* Refresh button */}
          <button
            onClick={fetchReservations}
            disabled={isLoading}
            className="ml-2 p-2 border-2 border-blue-700 text-blue-700 hover:bg-blue-50 rounded-md"
            title="Làm mới"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* Status filters */}
        {!isLoading && reservations.length > 0 && (
          <div className="mb-6 flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1 rounded-md text-sm ${
                statusFilter === "all" 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Tất cả
            </button>
            
            {!viewHistory && (
              <>
                <button
                  onClick={() => setStatusFilter("pending")}
                  className={`px-3 py-1 rounded-md text-sm ${
                    statusFilter === "pending" 
                      ? 'bg-yellow-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Chờ xác nhận
                </button>
                <button
                  onClick={() => setStatusFilter("confirmed")}
                  className={`px-3 py-1 rounded-md text-sm ${
                    statusFilter === "confirmed" 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Đã xác nhận
                </button>
                <button
                  onClick={() => setStatusFilter("checked-in")}
                  className={`px-3 py-1 rounded-md text-sm ${
                    statusFilter === "checked-in" 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Đang sử dụng
                </button>
              </>
            )}
            
            {viewHistory && (
              <>
                <button
                  onClick={() => setStatusFilter("completed")}
                  className={`px-3 py-1 rounded-md text-sm ${
                    statusFilter === "completed" 
                      ? 'bg-gray-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Đã sử dụng
                </button>
                <button
                  onClick={() => setStatusFilter("cancelled")}
                  className={`px-3 py-1 rounded-md text-sm ${
                    statusFilter === "cancelled" 
                      ? 'bg-red-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Đã hủy
                </button>
              </>
            )}
          </div>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-center my-12">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* No reservations message */}
        {!isLoading && (filteredReservations.length === 0) && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-5xl mb-4">📅</div>
            <h3 className="text-xl font-semibold mb-2">Không có đặt phòng nào</h3>
            <p>
              {viewHistory 
                ? "Bạn chưa có lịch sử đặt phòng nào." 
                : "Bạn chưa đặt phòng nào sắp tới."}
            </p>
            {!viewHistory && (
              <button
                onClick={() => navigate("/booking")}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
              >
                Đặt phòng ngay
              </button>
            )}
          </div>
        )}

        {/* Reservations list */}
        {!isLoading && filteredReservations.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReservations.map((reservation) => (
              <div key={reservation.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="bg-blue-700 text-white p-3 flex justify-between items-center">
                  <h3 className="font-bold">{reservation.room?.name || `Phòng #${reservation.roomId}`}</h3>
                  {getStatusBadge(reservation.status)}
                </div>
                <div className="p-4">
                  <div className="mb-4">
                    <div className="flex items-center mb-2">
                      <span className="w-6 text-blue-800">📍</span>
                      <span className="font-medium">{reservation.room?.location || 'Chưa có thông tin'}</span>
                    </div>
                    
                    {reservation.room?.capacity && (
                      <div className="flex items-center mb-2">
                        <span className="w-6 text-blue-800">👥</span>
                        <span className="font-medium">{reservation.room.capacity} chỗ ngồi</span>
                      </div>
                    )}
                    
                    <div className="flex items-center mb-2">
                      <span className="w-6 text-blue-800">📅</span>
                      <span className="font-medium">{formatDate(reservation.startTime)}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <span className="w-6 text-blue-800">🕒</span>
                      <span className="font-medium">
                        {formatTime(reservation.startTime)} - {formatTime(reservation.endTime)}
                      </span>
                    </div>
                    
                    {reservation.room?.equipment && (
                      <div className="mt-3 pt-2 border-t border-gray-100">
                        <div className="text-sm text-gray-500 mb-1">Trang thiết bị:</div>
                        {renderEquipment(reservation.room.equipment)}
                      </div>
                    )}
                  </div>
                  {/* Action buttons */}
                  <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end gap-2">
                    {/* Cancel button */}
                    {!viewHistory && (reservation.status === 'confirmed') && (
                      <button
                        onClick={() => handleCancelReservation(reservation.id)}
                        disabled={actionLoading === reservation.id}
                        className={`bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm ${
                          actionLoading === reservation.id ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        {actionLoading === reservation.id ? (
                          <div className="flex items-center">
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                            <span>Đang hủy...</span>
                          </div>
                        ) : (
                          "Hủy đặt phòng"
                        )}
                      </button>
                    )}
                    
                    {/* Check-in button */}
                    {canCheckIn(reservation) && (
                      <button
                      onClick={() => navigate('/qr-scanner', { state: { action: 'check-in', reservationId: reservation.id } })}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                      >
                      Check-in
                      </button>
                    )}
                    
                    {/* Check-out button */}
                    {canCheckOut(reservation) && (
                      <button
                      onClick={() => navigate('/qr-scanner', { state: { action: 'check-out', reservationId: reservation.id } })}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                      >
                      Check-out
                      </button>
                    )}
                  </div>
                  {/* Check-in/Check-out buttons */}
                  {canCheckIn(reservation) && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <p className="text-sm text-gray-600 mb-2">
                        Khi bạn đến phòng, hãy nhờ nhân viên quét mã QR để check-in.
                      </p>
                    </div>
                  )}

                  {canCheckOut(reservation) && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <p className="text-sm text-gray-600 mb-2">
                        Khi bạn hoàn tất sử dụng phòng, hãy nhờ nhân viên quét mã QR để check-out.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white text-xs p-4 text-center mt-auto">
        <p>Email: btstgroup@hcmut.edu.vn</p>
        <p>ĐT (Tel.): +84 363459876</p>
        <p>Trường ĐH Bách Khoa – 268 Lý Thường Kiệt, Q.10, TP.HCM</p>
        <p>Copyright 2025-20XX CO3001</p>
      </footer>
    </div>
  );
};

export default RoomManagement;