import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const data = [
  { name: "Jan", uv: 3000 },
  { name: "Feb", uv: 12000 },
  { name: "Mar", uv: 8000 },
  { name: "Apr", uv: 5000 },
  { name: "May", uv: 4000 },
  { name: "Jun", uv: 6000 },
];

export const AccessChart: React.FC = () => (
  <div className="bg-white rounded-lg shadow p-4 w-full">
    <div className="flex justify-between items-center text-sm font-medium mb-1">
      <span>Lượt truy cập</span>
      <span className="text-gray-500">This month</span>
    </div>
    <div className="text-2xl font-bold text-blue-800 mb-4">7.000</div>
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="uv" fill="#3B82F6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);
