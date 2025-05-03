import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import RoomManage from "./pages/RoomManage";
import BookingManage from "./pages/BookingManage";
import Report from "./pages/Report";
import Roles from "./pages/Roles";
import Equipment from "./pages/Equipment";
import Homepage from "./pages/Homepage";
import Booking from "./pages/UserBooking";
import Login from "./pages/Login";
import Manage from "./pages/UserManage";
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
      <Route path="/" element={<Homepage />} />
      <Route path="/booking" element={<Booking />} />
      <Route path="/login" element={<Login />} />
      <Route path="/manage" element={<Manage />} />
    </Routes>
  </Router>
);

export default App;
