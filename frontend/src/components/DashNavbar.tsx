import React from "react";
import { Link } from "react-router-dom";

export const DashNavbar: React.FC = () => (
  <nav className="bg-blue-800 text-white flex items-center justify-between px-6 py-4 shadow-md">
    <div className="flex items-center space-x-8">
      <img src="/k_icon.jpg" alt="Logo" className="w-10 h-10" />
      <div className="flex space-x-4 text-sm">
        <Link to="/dashboard" className="hover:underline">
          Bảng điều khiển
        </Link>
        <Link to="/rooms" className="hover:underline">
          Phòng
        </Link>
        <Link to="/bookings" className="hover:underline">
          Đặt chỗ
        </Link>
        <Link to="/report" className="hover:underline">
          Thống kê
        </Link>
        <Link to="/roles" className="hover:underline">
          Phân quyền
        </Link>
      </div>
    </div>
    <div className="flex items-center space-x-3 text-sm">
      <img src="/k_icon.jpg" alt="User" className="w-8 h-8 rounded-full" />
      <div>
        <div className="font-medium">Quản trị viên</div>
        <div className="text-xs text-gray-300">Ban quản lý</div>
      </div>
    </div>
  </nav>
);
