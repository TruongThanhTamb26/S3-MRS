import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const RoomBookingPage: React.FC = () => {
  const [showRooms, setShowRooms] = useState(false);
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col justify-between bg-white">
      {/* Navbar */}
      <div className="bg-blue-700 text-white px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <img src="/logo.jpg" alt="BK Logo" className="w-8 h-8" />
          <h1 className="font-semibold text-sm md:text-lg">
            ĐẶT CHỖ KHÔNG GIAN HỌC TẬP
          </h1>
        </div>
        <div className="flex gap-4 text-sm md:text-base">
          <button className="hover:underline">Đặt chỗ</button>
          <button
  		onClick={() => navigate("/manage")}
  		className="hover:underline"
	  >
  		Quản lý đặt chỗ
	  </button>
          <button className="bg-white text-blue-700 px-3 py-1 rounded-full">👤</button>
        </div>
      </div>

      {/* Search Form */}
      <div className="flex justify-center mt-10">
        <div className="bg-white rounded-xl shadow p-6 flex flex-col md:flex-row gap-4 items-center">
          <input
            type="date"
            className="border rounded px-2 py-1 text-sm w-40"
            placeholder="Chọn ngày"
          />
          <input
            type="time"
            className="border rounded px-2 py-1 text-sm w-32"
            placeholder="Check in"
          />
          <input
            type="time"
            className="border rounded px-2 py-1 text-sm w-32"
            placeholder="Check out"
          />
          <button
            onClick={() => setShowRooms(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-2 mt-2 md:mt-0"
          >
            TÌM KIẾM
          </button>
        </div>
      </div>

      {/* Room Buttons */}
      {showRooms && (
        <div className="flex justify-center mt-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, index) => (
              <button
                key={index}
                className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded font-semibold"
              >
                PHÒNG {index + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-800 text-white text-xs mt-12 p-4 text-center">
        <p>Email: btstgroup@hcmut.edu.vn</p>
        <p>ĐT (Tel.): +84 363459876</p>
        <p>Trường ĐH Bách Khoa – 268 Lý Thường Kiệt, Q.10, TP.HCM</p>
        <p>Copyright 2025-20XX CO3001</p>
      </footer>
    </div>
  );
};

export default RoomBookingPage;
