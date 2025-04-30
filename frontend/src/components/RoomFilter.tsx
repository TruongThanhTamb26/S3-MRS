import React from "react";

export const RoomFilter: React.FC = () => {
  return (
    <div className="bg-white shadow rounded p-4 w-full max-w-xs space-y-3">
      <h3 className="font-semibold text-blue-700">Tìm kiếm</h3>
      <div className="space-y-2 text-sm">
        {["Tên phòng", "Sức chứa", "Toà nhà", "Trạng thái"].map((label) => (
          <div key={label}>
            <label className="block mb-1">{label}</label>
            <input
              className="w-full px-2 py-1 border rounded"
              placeholder="Input"
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center mt-2">
        <button className="text-blue-700 text-sm">Clean</button>
        <button className="bg-blue-600 text-white text-sm px-3 py-1 rounded">
          Search
        </button>
      </div>
    </div>
  );
};
