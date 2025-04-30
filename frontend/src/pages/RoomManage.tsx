import React from "react";
import { DashNavbar } from "../components/DashNavbar";
import { RoomFilter } from "../components/RoomFilter";
import { RoomTable } from "../components/RoomTable";
import { RoomPagination } from "../components/RoomPagination";

const RoomManage: React.FC = () => {
  return (
    <div className="min-h-screen bg-blue-100">
      <DashNavbar />
      <div className="px-6 py-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-blue-700">Quản lý phòng</h2>
          <button className="bg-green-500 text-white px-4 py-1 rounded">
            Điều chỉnh
          </button>
        </div>
        <div className="flex gap-6 mb-6">
          <RoomFilter />
          <div className="flex-1 space-y-4">
            <button className="bg-blue-600 text-white px-4 py-1 rounded">
              Danh sách phòng
            </button>
            <RoomTable />
            <RoomPagination />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomManage;
