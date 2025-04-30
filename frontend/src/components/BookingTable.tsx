import React from "react";

const bookings = [
  {
    id: "10181-250309-2345",
    user: "2212345",
    room: "101-BK.B1",
    time: "7:00-9:00",
    status: "Hoàn thành",
  },
  {
    id: "10182-250309-5432",
    user: "2315432",
    room: "102-BK.B1",
    time: "8:00-11:00",
    status: "Đang sử dụng",
  },
  {
    id: "10182-250309-5791",
    user: "2215791",
    room: "102-BK.B2",
    time: "13:00-16:00",
    status: "Chưa đến giờ",
  },
  {
    id: "10181-250309-4321",
    user: "2414321",
    room: "102-BK.B2",
    time: "13:00-15:00",
    status: "Đã bị huỷ",
  },
];

export const BookingTable: React.FC = () => (
  <div className="overflow-auto">
    <table className="min-w-full table-auto border rounded shadow bg-white">
      <thead className="bg-blue-600 text-white text-sm">
        <tr>
          {[
            "Mã đặt chỗ",
            "Người dùng",
            "Phòng",
            "Thời gian",
            "Trạng thái",
            "Action",
          ].map((header) => (
            <th key={header} className="px-4 py-2 text-left">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="text-sm text-gray-700">
        {bookings.map((b, idx) => (
          <tr key={idx} className="border-t">
            <td className="px-4 py-2">{b.id}</td>
            <td className="px-4 py-2">{b.user}</td>
            <td className="px-4 py-2">{b.room}</td>
            <td className="px-4 py-2">{b.time}</td>
            <td className="px-4 py-2">{b.status}</td>
            <td className="px-4 py-2">
              <button className="bg-blue-500 text-white px-3 py-1 rounded text-xs">
                Chi tiết
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
