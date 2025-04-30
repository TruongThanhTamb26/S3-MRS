import React from "react";
import { DashNavbar } from "../components/DashNavbar";
import { DashboardHeader } from "../components/DashboardHeader";
import { StatusCard } from "../components/StatusCard";
import { AccessChart } from "../components/AccessChart";
import { RoomStatusChart } from "../components/RoomStatusChart";

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-blue-100">
      <DashNavbar />
      <DashboardHeader />
      <div className="px-6">
        <div className="flex justify-end mb-4">
          <StatusCard />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AccessChart />
          <RoomStatusChart />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
