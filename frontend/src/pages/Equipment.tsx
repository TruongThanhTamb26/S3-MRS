import React from "react";
import { EquipmentTable } from "../components/EquipmentTable";
import { BookingPagination } from "../components/BookingPagination"; // reuse
import { EquipmentFooter } from "../components/EquipmentFooter";

const Equipment: React.FC = () => {
  const [currentPage, setCurrentPage] = React.useState(2);

  return (
    <div className="min-h-screen bg-blue-100 flex flex-col justify-between">
      <main className="px-6 py-8 max-w-5xl mx-auto w-full">
        <h2 className="text-xl font-semibold text-center border border-gray-400 rounded py-3 mb-6">
          DANH SÁCH THIẾT BỊ PHÒNG
        </h2>

        <EquipmentTable />

        <div className="flex justify-between mt-6">
          <BookingPagination
            currentPage={currentPage}
            totalPages={3}
            onPageChange={(p) => setCurrentPage(p)}
          />
          <button className="bg-red-500 text-white px-4 py-1 rounded text-sm">
            Báo lỗi
          </button>
        </div>
      </main>

      <EquipmentFooter />
    </div>
  );
};

export default Equipment;
