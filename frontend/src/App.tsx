import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import RoomManage from "./pages/RoomManage";
import BookingManage from "./pages/BookingManage";
import Report from "./pages/Report";
import Roles from "./pages/Roles";
import Equipment from "./pages/Equipment";
import "./styles/tailwind.css";

const App = () => (
  <Router>
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/rooms" element={<RoomManage />} />
      <Route path="/bookings" element={<BookingManage />} />
      <Route path="/report" element={<Report />} />
      <Route path="/roles" element={<Roles />} />
      <Route path="/equipment" element={<Equipment />} />
    </Routes>
  </Router>
);

export default App;
