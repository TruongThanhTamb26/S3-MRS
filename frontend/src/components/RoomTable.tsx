import React from "react";

const data = [
  {
    name: "101",
    building: "BK.B1",
    capacity: 10,
    status: "Mở",
    device: "Projector",
    admin: "Admin1",
  },
  {
    name: "102",
    building: "BK.B1",
    capacity: 10,
    status: "Mở",
    device: "",
    admin: "Admin1",
  },
  {
    name: "103",
    building: "BK.B1",
    capacity: 10,
    status: "Bận",
    device: "Projector, điều hoà",
    admin: "Admin1",
  },
  {
    name: "104",
    building: "BK.B2",
    capacity: 20,
    status: "Bận",
    device: "",
    admin: "Admin2",
  },
  {
    name: "102",
    building: "BK.B2",
    capacity: 20,
    status: "Bảo trì",
    device: "Điều hoà",
    admin: "Admin2",
  },
];

export const RoomTable: React.FC = () => (
  <div className="overflow-auto">
    <table className="min-w-full table-auto border rounded shadow bg-white">
      <thead className="bg-blue-600 text-white text-sm">
        <tr>
          {[
            "Tên phòng",
            "Toà nhà",
            "Sức chứa",
            "Trạng thái",
            "Thiết bị",
            "Người quản lý",
          ].map((header) => (
            <th key={header} className="px-4 py-2 text-left">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="text-sm text-gray-700">
        {data.map((row, idx) => (
          <tr key={idx} className="border-t">
            <td className="px-4 py-2">{row.name}</td>
            <td className="px-4 py-2">{row.building}</td>
            <td className="px-4 py-2">{row.capacity}</td>
            <td className="px-4 py-2">{row.status}</td>
            <td className="px-4 py-2">{row.device}</td>
            <td className="px-4 py-2">{row.admin}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
