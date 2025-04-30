import React from "react";
import { DashNavbar } from "../components/DashNavbar";
import { RoleFilter } from "../components/RoleFilter";
import { RoleTable } from "../components/RoleTable";
import { BookingPagination } from "../components/BookingPagination"; // reuse from bookings

const Roles: React.FC = () => {
  const [currentPage, setCurrentPage] = React.useState(1);

  return (
    <div className="min-h-screen bg-blue-100">
      <DashNavbar />
      <div className="px-6 py-4 max-w-5xl mx-auto">
        <h2 className="text-lg font-semibold text-blue-700 mb-4">Phân quyền</h2>
        <button className="bg-blue-600 text-white px-4 py-1 rounded mb-4">
          Danh sách quyền user
        </button>
        <RoleFilter />
        <RoleTable />
        <BookingPagination
          currentPage={currentPage}
          totalPages={3}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>
    </div>
  );
};

export default Roles;
