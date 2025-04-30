import React from "react";

export const RoomPagination: React.FC = () => (
  <div className="flex justify-center items-center mt-4 space-x-2 text-sm">
    {[1, 2, 3].map((n) => (
      <button
        key={n}
        className={`px-2 py-1 rounded-full border ${
          n === 2 ? "bg-blue-500 text-white" : "bg-white text-gray-700"
        }`}
      >
        {n}
      </button>
    ))}
  </div>
);
