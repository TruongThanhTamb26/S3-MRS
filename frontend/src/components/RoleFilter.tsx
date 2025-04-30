import React from "react";

export const RoleFilter: React.FC = () => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-4 text-sm">
      <div className="flex flex-col">
        <label className="font-medium mb-1">MSSV</label>
        <input className="border px-2 py-1 rounded" placeholder="Input" />
      </div>
      <div className="flex flex-col">
        <label className="font-medium mb-1">Quyền</label>
        <input className="border px-2 py-1 rounded" placeholder="Input" />
      </div>
    </div>
  );
};
