import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import UserNavbar from "../components/UserNavbar";
import { userService } from "../services/user.service";

interface BookingState {
  roomId: number;
  roomName: string;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
}

const BookingConfirm: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  
  const navigate = useNavigate();
  const location = useLocation();
  const bookingDetails = location.state as BookingState;

  // Redirect if no booking details in state
  if (!bookingDetails) {
    navigate('/booking');
    return null;
  }

  const { roomId, roomName, location: roomLocation, date, startTime, endTime } = bookingDetails;

  // Format date for display
  const formatDisplayDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  // Handle confirm booking
  const handleConfirmBooking = async () => {
    setIsLoading(true);
    setError("");

    try {
      // Format date and time for API
      const startDateTime = `${date}T${startTime}:00`;
      const endDateTime = `${date}T${endTime}:00`;

      // API request to book the room
      const bookingData = {
        roomId: roomId,
        startTime: startDateTime,
        endTime: endDateTime
      };

      const response = await userService.bookRoom(bookingData);
      console.log("Booking response:", response);
      if (response.success) {
        // Navigate to manage page with success message
        navigate('/manage', { 
          state: { 
            success: true, 
            message: 'Đặt phòng thành công!' 
          } 
        });
      } else {
        setError(response.message || "Không thể đặt phòng");
      }
    } catch (err: any) {
      console.error("Error booking room:", err);
      setError(err.message || "Đã xảy ra lỗi khi đặt phòng");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <UserNavbar title="XÁC NHẬN ĐẶT PHÒNG" />
      
      <div className="flex-grow px-4 py-8 max-w-3xl mx-auto w-full">
        <h2 className="text-2xl font-bold text-blue-800 mb-6 text-center">
          XÁC NHẬN THÔNG TIN ĐẶT PHÒNG
        </h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p>{error}</p>
          </div>
        )}
        
        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
          <div className="bg-blue-700 text-white p-4">
            <h3 className="font-bold text-lg">{roomName}</h3>
            <p className="text-sm mt-1">{roomLocation}</p>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="flex items-center">
              <span className="w-8 text-blue-600 text-xl">📅</span>
              <div>
                <p className="text-sm text-gray-500">Ngày</p>
                <p className="font-medium">{formatDisplayDate(date)}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <span className="w-8 text-blue-600 text-xl">🕒</span>
              <div>
                <p className="text-sm text-gray-500">Thời gian</p>
                <p className="font-medium">{startTime} - {endTime}</p>
              </div>
            </div>
            
            <hr className="my-4" />
            
            <div className="bg-blue-50 p-4 rounded">
              <p className="text-sm text-blue-800">
                <span className="font-bold">Lưu ý:</span> Vui lòng đến đúng giờ và giữ gìn không gian học tập. 
                Nếu không đến, vui lòng hủy đặt phòng trước ít nhất 1 giờ.
              </p>
            </div>
            
            <div className="flex justify-between mt-6">
              <button
                onClick={() => navigate('/booking')}
                className="px-5 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-800 transition-colors"
              >
                Quay lại
              </button>
              
              <button
                onClick={handleConfirmBooking}
                disabled={isLoading}
                className={`px-5 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white transition-colors ${
                  isLoading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span>Đang xử lý...</span>
                  </div>
                ) : (
                  "Xác nhận đặt phòng"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <footer className="bg-gray-800 text-white text-xs p-4 text-center">
        <p>Email: btstgroup@hcmut.edu.vn</p>
        <p>ĐT (Tel.): +84 363459876</p>
        <p>Trường ĐH Bách Khoa – 268 Lý Thường Kiệt, Q.10, TP.HCM</p>
        <p>Copyright 2025-20XX CO3001</p>
      </footer>
    </div>
  );
};

export default BookingConfirm;