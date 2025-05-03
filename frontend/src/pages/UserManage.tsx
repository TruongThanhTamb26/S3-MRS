import React, { useState } from "react";

const RoomManagement = () => {
  const [viewUsed, setViewUsed] = useState(false);
  const currentDate = "12/03/2025";

  const data = [
    { id: 1, room: "PHÒNG 1", start: "8H00", end: "9H00" },
    { id: 2, room: "PHÒNG 2", start: "12H00", end: "13H00" },
  ];

  const usedData = [
    { id: 1, room: "PHÒNG 1", start: "11H00", end: "12H00" },
    { id: 2, room: "PHÒNG 2", start: "16H00", end: "17H00" },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="bg-[#0088E0] text-white px-4 py-3 flex justify-between items-center">
        <div className="flex gap-4 items-center">
          <button className="flex items-center gap-1">
            <span>📅</span> Đặt chỗ
          </button>
          <button className="flex items-center gap-1 font-semibold underline">
            <span>📋</span> Quản lý đặt chỗ
          </button>
        </div>
        <div className="text-xl">👤</div>
      </div>

      {/* Content */}
      <div className="text-center mt-8">
        <h2 className="text-2xl font-semibold text-[#003087] mb-4">
          QUẢN LÝ ĐẶT CHỖ
        </h2>
        <button
          className="bg-white border border-black px-6 py-2 rounded shadow-sm mb-4"
          onClick={() => setViewUsed(!viewUsed)}
        >
          {viewUsed ? "CÁC PHÒNG BẠN ĐÃ ĐẶT" : "CÁC PHÒNG BẠN ĐÃ SỬ DỤNG"}
        </button>
        {viewUsed && (
          <p className="text-sm text-gray-600 mb-2 font-semibold">NGÀY {currentDate}</p>
        )}
        <div className="mx-auto w-[90%] max-w-md space-y-3 mt-2">
          {(viewUsed ? usedData : data).map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-4 gap-1 bg-white border border-gray-300 rounded-full py-1 px-2 shadow-sm text-sm text-center font-medium"
            >
              <span>{item.id}</span>
              <span>{item.room}</span>
              <span>{item.start}</span>
              <span>{item.end}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto bg-gray-700 text-white text-xs text-center px-4 py-3">
        <p>Email: bstgroup@hcmut.edu.vn</p>
        <p>ĐT (Tel.): +84 364359876</p>
        <p>
          Trường ĐH Bách Khoa – 268 Lý Thường Kiệt, Q.10, TP.HCM
        </p>
        <p>Copyright 2025–20XX CO3001</p>
      </footer>
    </div>
  );
};

export default RoomManagement;
