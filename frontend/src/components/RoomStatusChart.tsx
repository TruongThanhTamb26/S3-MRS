import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

const data = [
  { name: "Phòng trống", value: 60 },
  { name: "Phòng được sử dụng", value: 40 },
];

const COLORS = ["#EC4899", "#3B82F6"];

export const RoomStatusChart: React.FC = () => (
  <div className="bg-white rounded-lg shadow p-4 w-full">
    <div className="flex justify-between items-center text-sm font-medium mb-2">
      <span>Tình trạng phòng</span>
      <span className="text-gray-500">Now ▾</span>
    </div>
    <div className="h-40">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={40}
            outerRadius={60}
            fill="#8884d8"
            paddingAngle={4}
            label
          >
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
    <div className="text-xs text-gray-600 mt-4 space-y-1">
      <div>
        Phòng trống — <span className="text-pink-500">60%</span>
      </div>
      <div>
        Phòng được sử dụng — <span className="text-blue-600">40%</span>
      </div>
    </div>
  </div>
);
