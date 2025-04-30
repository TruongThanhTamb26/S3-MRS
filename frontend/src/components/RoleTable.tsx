import React from "react";

const users = [
  { id: "2212345", name: "Nguyễn Văn A", cancel: 0, allowed: true },
  { id: "2315432", name: "Trần Văn B", cancel: 3, allowed: false },
  { id: "2215791", name: "Trương Thành C", cancel: 0, allowed: true },
  { id: "2414321", name: "Nguyễn Thanh L", cancel: 0, allowed: true },
];

export const RoleTable: React.FC = () => (
  <div className="overflow-auto">
    <table className="min-w-full border bg-white rounded shadow text-sm">
      <thead className="bg-blue-600 text-white">
        <tr>
          <th className="px-4 py-2 text-left">MSSV</th>
          <th className="px-4 py-2 text-left">Họ và Tên</th>
          <th className="px-4 py-2 text-left">Số lượt huỷ/tháng</th>
          <th className="px-4 py-2 text-left">Đặt chỗ</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user, idx) => (
          <tr key={idx} className="border-t">
            <td className="px-4 py-2">{user.id}</td>
            <td className="px-4 py-2">{user.name}</td>
            <td className="px-4 py-2">{user.cancel}</td>
            <td className="px-4 py-2">
              <div className="flex gap-2">
                <button
                  className={`px-3 py-1 rounded text-white text-xs ${
                    user.allowed ? "bg-green-500" : "bg-gray-400"
                  }`}
                >
                  Cho phép
                </button>
                <button
                  className={`px-3 py-1 rounded text-white text-xs ${
                    !user.allowed ? "bg-red-500" : "bg-gray-400"
                  }`}
                >
                  Cấm
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
