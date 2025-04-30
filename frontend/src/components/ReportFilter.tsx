import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export const ReportFilter: React.FC = () => {
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [reportType, setReportType] = useState<string>("Báo cáo đặt phòng");

  return (
    <div className="flex flex-col md:flex-row gap-6 mb-6">
      {/* Start Date */}
      <div className="bg-white p-4 rounded shadow text-sm w-full md:w-64">
        <label className="block font-medium mb-2">Ngày Bắt Đầu</label>
        <Calendar
          onChange={(date) => setStartDate(date as Date)}
          value={startDate}
        />
      </div>

      {/* End Date */}
      <div className="bg-white p-4 rounded shadow text-sm w-full md:w-64">
        <label className="block font-medium mb-2">Ngày Kết Thúc</label>
        <Calendar
          onChange={(date) => setEndDate(date as Date)}
          value={endDate}
        />
      </div>

      {/* Report Type + Button */}
      <div className="flex flex-col justify-between space-y-4 w-full md:w-auto">
        <select
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
          className="px-3 py-2 rounded border text-sm"
        >
          <option>Báo cáo đặt phòng</option>
          <option>Báo cáo thiết bị</option>
          <option>Báo cáo người dùng</option>
        </select>
        <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm">
          Tạo báo cáo
        </button>
      </div>
    </div>
  );
};
