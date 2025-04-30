import React from "react";
import { DashNavbar } from "../components/DashNavbar";
import { ReportFilter } from "../components/ReportFilter";

const Report: React.FC = () => {
  return (
    <div className="min-h-screen bg-blue-100">
      <DashNavbar />
      <div className="px-6 py-4">
        <h2 className="text-lg font-semibold text-blue-700 mb-4">
          Báo cáo - thống kê
        </h2>

        <ReportFilter />

        <div className="flex space-x-4">
          <button className="bg-green-500 text-white px-4 py-2 rounded text-sm">
            Export Excel
          </button>
          <button className="bg-orange-500 text-white px-4 py-2 rounded text-sm">
            Export PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default Report;
