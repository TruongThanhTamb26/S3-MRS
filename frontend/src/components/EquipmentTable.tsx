import React from "react";

const equipmentData = [
  { id: 1, room: "101-BK.B1", projector: 2, aircon: 1, mic: 2 },
  { id: 2, room: "101-BK.B1", projector: 1, aircon: 2, mic: 3 },
  { id: 3, room: "102-BK.B1", projector: 1, aircon: 1, mic: 2 },
  { id: 4, room: "102-BK.B2", projector: 2, aircon: 2, mic: 2 },
];

export const EquipmentTable: React.FC = () => (
  <div className="overflow-auto rounded shadow">
    <table className="min-w-full table-auto border text-sm bg-white">
      <thead className="bg-blue-600 text-white">
        <tr>
          <th className="px-4 py-2 text-left">STT</th>
          <th className="px-4 py-2 text-left">Phòng</th>
          <th className="px-4 py-2 text-left">Máy chiếu</th>
          <th className="px-4 py-2 text-left">Điều hoà</th>
          <th className="px-4 py-2 text-left">Mic</th>
          <th className="px-4 py-2 text-left"> </th>
        </tr>
      </thead>
      <tbody>
        {equipmentData.map((item) => (
          <tr key={item.id} className="border-t">
            <td className="px-4 py-2">{item.id}</td>
            <td className="px-4 py-2">{item.room}</td>
            <td className="px-4 py-2">{item.projector}</td>
            <td className="px-4 py-2">{item.aircon}</td>
            <td className="px-4 py-2">{item.mic}</td>
            <td className="px-4 py-2">
              <button className="bg-blue-600 text-white px-3 py-1 text-xs rounded">
                Chỉnh sửa
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
