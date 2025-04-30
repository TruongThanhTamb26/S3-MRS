import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

import { DashNavbar } from "../components/DashNavbar";
import { BookingTable } from "../components/BookingTable";
import { BookingPagination } from "../components/BookingPagination";

const BookingManage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentPage, setCurrentPage] = useState<number>(1);

  return (
    <div className="min-h-screen bg-blue-100">
      <DashNavbar />

      <div className="px-6 py-4">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-blue-700">
            Quản lý đặt chỗ
          </h2>
          <button className="bg-green-500 text-white px-4 py-1 rounded">
            Tạo đặt chỗ
          </button>
        </div>

        {/* Button + Calendar */}
        <div className="flex gap-6 justify-between items-start">
          {/* Booking List Section */}
          <div className="w-full max-w-[720px] space-y-4">
            <button className="bg-blue-600 text-white px-4 py-1 rounded">
              Danh sách Booking
            </button>
          </div>

          {/* Calendar Right-Aligned */}
          <div className="w-60 hidden md:block">
            <div className="bg-white p-2 rounded shadow text-xs">
              <Calendar
                onChange={(value) => setSelectedDate(value as Date)}
                value={selectedDate}
              />
              <p className="text-[10px] text-gray-500 mt-2 text-center">
                Ngày đã chọn: {selectedDate.toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Booking Table */}
        <BookingTable />

        {/* Pagination */}
        <BookingPagination
          currentPage={currentPage}
          totalPages={3}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>
    </div>
  );
};

export default BookingManage;
