import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import RoomManage from "./pages/RoomManage";
import BookingManage from "./pages/BookingManage";
import Report from "./pages/Report";
import Equipment from "./pages/Equipment";
import Homepage from "./pages/Homepage";
import Booking from "./pages/UserBooking";
import Login from "./pages/Login";
import Manage from "./pages/UserManage";
import Profile from "./pages/UserProfile";
import BookingConfirm from "./pages/BookingConfirm";
import ManageUser from "./pages/ManageUser";
import AdminProfile from "./pages/AdminProfile";
import "./styles/tailwind.css";


const App = () => (
  <Router>
    <Routes>
      <Route path="/admin/dashboard" element={<Dashboard />} />
      <Route path="/admin/rooms" element={<RoomManage />} />
      <Route path="/admin/bookings" element={<BookingManage />} />
      <Route path="/admin/report" element={<Report />} />
      <Route path="/technician/equipment" element={<Equipment />} />
      <Route path="/" element={<Homepage />} />
      <Route path="/booking/confirm" element={<BookingConfirm />} />
      <Route path="/booking" element={<Booking />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/login" element={<Login />} />
      <Route path="/manage" element={<Manage />} />
      <Route path="/admin/users" element={<ManageUser />} />
      <Route path="/admin/profile" element={<AdminProfile />} />
    </Routes>
  </Router>
);

export default App;
