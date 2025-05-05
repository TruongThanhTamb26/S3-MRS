import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserNavbar from "../components/UserNavbar";
import { userService } from "../services/user.service";


// Define Room interface based on backend model
interface Room {
  id: number;
  name: string;
  capacity: number;
  location: string;
  status: string;
  equipment:{
    Mic: number;
    Projector: number;
    AirCon: number;
  }
  createdAt: string;
  updatedAt: string;
}

const RoomBookingPage: React.FC = () => {
  // State variables
  const [date, setDate] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("07:00");
  const [endTime, setEndTime] = useState<string>("08:00");
  const [capacity, setCapacity] = useState<number>(0); // Thêm state cho capacity
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [searchPerformed, setSearchPerformed] = useState<boolean>(false);
  
  const navigate = useNavigate();

  // Các tùy chọn số chỗ ngồi
  const capacityOptions = [
    { value: 1, label: "Tất cả" },
    { value: 10, label: "≥ 10 chỗ" },
    { value: 20, label: "≥ 20 chỗ" },
    { value: 30, label: "≥ 30 chỗ" },
    { value: 50, label: "≥ 50 chỗ" },
    { value: 100, label: "≥ 100 chỗ" }
  ];

  // Get available time slots (7:00 to 18:00, only full hours)
  const getAvailableStartTimes = () => {
    const times = [];
    for (let hour = 7; hour <= 17; hour++) {
      const formattedHour = hour.toString().padStart(2, '0');
      times.push(`${formattedHour}:00`);
    }
    return times;
  };

  // Get available end times based on selected start time
  const getAvailableEndTimes = () => {
    const times = [];
    // If no start time is selected, return empty array
    if (!startTime) return [];
    
    // Parse start time
    const [startHour] = startTime.split(':').map(Number);
    
    // End times should be after start time and up to 18:00
    for (let hour = startHour + 1; hour <= 18; hour++) {
      const formattedHour = hour.toString().padStart(2, '0');
      times.push(`${formattedHour}:00`);
    }
    
    return times;
  };

  // Set date limits (today to 7 days from now)
  const today = new Date();
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + 7);

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const minDateStr = formatDate(today);
  const maxDateStr = formatDate(maxDate);

  // Set default date to today on component mount
  useEffect(() => {
    setDate(minDateStr);
  }, [minDateStr]);

  // Update end time when start time changes
  useEffect(() => {
    // Get the next hour after start time
    if (startTime) {
      const [hour] = startTime.split(':').map(Number);
      if (hour < 18) {
        const nextHour = (hour + 1).toString().padStart(2, '0');
        setEndTime(`${nextHour}:00`);
      }
    }
  }, [startTime]);

  // Form validation
  const validateForm = (): boolean => {
    if (!date) {
      setError("Vui lòng chọn ngày");
      return false;
    }

    if (!startTime) {
      setError("Vui lòng chọn giờ bắt đầu");
      return false;
    }

    if (!endTime) {
      setError("Vui lòng chọn giờ kết thúc");
      return false;
    }

    // Validate date range
    const selectedDate = new Date(date);
    const todayDate = new Date(formatDate(today)); // Only compare the date part, not time
    const maxDateWithoutTime = new Date(formatDate(maxDate)); // Only compare the date part, not time
    
    if (selectedDate < todayDate || selectedDate > maxDateWithoutTime) {
      setError("Chỉ có thể đặt phòng trong vòng 7 ngày tới");
      return false;
    }

    // Validate time range
    const start = new Date(`${date}T${startTime}:00`);
    const end = new Date(`${date}T${endTime}:00`);

    if (start >= end) {
      setError("Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc");
      return false;
    }

    // Check if start time is in the past for today's bookings
    if (formatDate(selectedDate) === formatDate(today)) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const [startHour, startMinute] = startTime.split(':').map(Number);
      
      // Create comparable time values (hours * 60 + minutes)
      const currentTimeValue = currentHour * 60 + currentMinute;
      const startTimeValue = startHour * 60 + startMinute;
      
      if (startTimeValue < currentTimeValue) {
        setError("Không thể đặt phòng với thời gian bắt đầu trong quá khứ");
        return false;
      }
    }
    
    // Check if duration is reasonable (e.g., not more than 6 hours)
    const durationMs = end.getTime() - start.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);
    if (durationHours > 6) {
      setError("Thời gian đặt phòng tối đa là 6 giờ");
      return false;
    }

    setError("");
    return true;
  };

  // API call to fetch available rooms
  const fetchAvailableRooms = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setSearchPerformed(true);

    try {
      // Format date and time for API
      const startDateTime = `${date}T${startTime}:00`;
      const endDateTime = `${date}T${endTime}:00`;
      // API request to get available rooms
      const response = await userService.searchRoom(
        startDateTime, 
        endDateTime,
        capacity > 0 ? capacity : undefined // Chỉ gửi capacity khi có giá trị > 0
      );

      if (response.success) {
        // Không cần lọc lại theo capacity vì đã được lọc ở server
        const filteredRooms = response.data;
        setAvailableRooms(filteredRooms);
      } else {
        setError("Không tìm thấy phòng trống");
        setAvailableRooms([]);
      }
    } catch (err: any) {
      console.error("Error fetching available rooms:", err);
      setError("Lỗi khi tìm phòng trống. Vui lòng thử lại.");
      setAvailableRooms([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle room selection
  const handleRoomSelection = (room: Room) => {
    navigate(`/booking/confirm`, {
      state: {
        roomId: room.id,
        roomName: room.name,
        location: room.location,
        date,
        startTime,
        endTime
      }
    });
  };
  
  // Render equipment icons with counts
  const renderEquipmentIcons = (equipment: {
    Mic: number;
    Projector: number;
    AirCon: number;
  }) => {
    const items = [];
    
    if (equipment) {
      if (equipment.Mic > 0) {
        items.push(
          <div key="mic" className="flex items-center mr-3 bg-blue-50 px-2 py-1 rounded-lg">
            <span className="text-xl mr-1">🎤</span>
            <span className="text-sm font-medium text-blue-800">{equipment.Mic}</span>
          </div>
        );
      }
      
      if (equipment.Projector > 0) {
        items.push(
          <div key="projector" className="flex items-center mr-3 bg-blue-50 px-2 py-1 rounded-lg">
            <span className="text-xl mr-1">📽️</span>
            <span className="text-sm font-medium text-blue-800">{equipment.Projector}</span>
          </div>
        );
      }
      
      if (equipment.AirCon > 0) {
        items.push(
          <div key="aircon" className="flex items-center mr-3 bg-blue-50 px-2 py-1 rounded-lg">
            <span className="text-xl mr-1">❄️</span>
            <span className="text-sm font-medium text-blue-800">{equipment.AirCon}</span>
          </div>
        );
      }
    }
    
    return items;
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white">
      {/* Navbar */}
      <UserNavbar/>

      {/* Content */}
      <div className="flex-grow px-4 py-8 max-w-6xl mx-auto w-full">
        <h2 className="text-2xl font-bold text-blue-800 mb-6 text-center">
          TÌM PHÒNG TRỐNG
        </h2>

        {/* Search Form */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p>{error}</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngày
              </label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                min={minDateStr}
                max={maxDateStr}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giờ bắt đầu
              </label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              >
                {getAvailableStartTimes().map(time => (
                  <option key={`start-${time}`} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giờ kết thúc
              </label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              >
                {getAvailableEndTimes().map(time => (
                  <option key={`end-${time}`} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Thêm lọc số chỗ ngồi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số chỗ ngồi
              </label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
              >
                {capacityOptions.map(option => (
                  <option key={`capacity-${option.value}`} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={fetchAvailableRooms}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span>Đang tìm...</span>
                  </div>
                ) : (
                  "TÌM KIẾM"
                )}
              </button>
            </div>
          </div>
          
          {/* Time selection info */}
          <div className="mt-4 text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
            <p className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Thời gian đặt phòng: 7:00 - 18:00, không thể đặt phòng liên tiếp vào các khung giờ kế nhau.
            </p>
          </div>

          {/* Thêm vào phần thông tin chính sách */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Lưu ý quan trọng:</strong> Đặt phòng sẽ tự động bị hủy nếu bạn không check-in trong vòng 30 phút sau giờ bắt đầu. Hệ thống sẽ tự động check-out khi hết giờ đặt phòng.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading indicator */}
        {isLoading && !error && (
          <div className="flex justify-center my-12">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* No rooms message */}
        {searchPerformed && !isLoading && availableRooms.length === 0 && !error && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">Không tìm thấy phòng trống</h3>
            <p>Không có phòng nào còn trống trong khoảng thời gian bạn đã chọn.</p>
            <p className="mt-2">Vui lòng thử chọn thời gian khác.</p>
          </div>
        )}

        {/* Available Rooms Display */}
        {!isLoading && availableRooms.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 text-blue-800">
              Có {availableRooms.length} phòng trống
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableRooms.map((room) => (
                <div key={room.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="h-40 bg-gray-200 relative">
                    <div className="flex items-center justify-center h-full bg-blue-50">
                      <span className="text-blue-800 text-4xl">🏫</span>
                    </div>
                    <div className="absolute top-2 right-2 bg-blue-600 text-white text-sm px-2 py-1 rounded-full">
                      {room.capacity} chỗ ngồi
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-bold text-lg">{room.name}</h3>
                    <p className="text-gray-600 mb-2">
                      <span className="font-semibold">Vị trí:</span> {room.location}
                    </p>
                    
                    {room.equipment && (
                      <div className="mb-3">
                        <span className="font-semibold text-sm text-gray-700 block mb-1">
                          Trang thiết bị:
                        </span>
                        <div className="flex flex-wrap mt-1">
                          {renderEquipmentIcons(room.equipment)}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                      <div className="text-sm text-gray-500">
                        {date.split('-').reverse().join('/')} • {startTime}-{endTime}
                      </div>
                      <button
                        onClick={() => handleRoomSelection(room)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded-md text-sm transition-colors"
                      >
                        Đặt phòng
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white text-xs mt-auto p-4 text-center">
        <p>Email: btstgroup@hcmut.edu.vn</p>
        <p>ĐT (Tel.): +84 363459876</p>
        <p>Trường ĐH Bách Khoa – 268 Lý Thường Kiệt, Q.10, TP.HCM</p>
        <p>Copyright 2025-20XX CO3001</p>
      </footer>
    </div>
  );
};

export default RoomBookingPage;