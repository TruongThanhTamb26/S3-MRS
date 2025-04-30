import React from "react";

type BookingPaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export const BookingPagination: React.FC<BookingPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex justify-center items-center mt-6 space-x-2 text-sm">
      {pages.map((page) => (
        <button
          key={page}
          className={`w-7 h-7 rounded-full border ${
            page === currentPage
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 hover:bg-blue-100"
          }`}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}
    </div>
  );
};
