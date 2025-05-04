import React from "react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();
  return (
    <div className="font-sans text-gray-800">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto flex justify-between items-center py-4 px-6">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-lg">
            <img src="/BACHKHOA.png" alt="logo" className="w-8 h-8" />
            BK SmartSpace
          </div>
          <nav className="hidden md:flex gap-6 text-sm text-gray-700">
            <a href="#" className="hover:text-blue-600">Home</a>
            <a href="#" className="hover:text-blue-600">About</a>
            <a href="#" className="hover:text-blue-600">Booking Classroom</a>
            <a href="#" className="hover:text-blue-600">News</a>
            <a href="#" className="hover:text-blue-600">Blog</a>
          </nav>
          <button
            onClick={() => navigate("/login")} 
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
          >
            Login
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative">
        <img
          src="/hcmut-campus.png"
          alt="campus"
          className="w-full h-[400px] object-cover"
        />
        <div className="absolute top-0 left-0 w-full h-full bg-black/40 flex flex-col justify-center items-center text-white text-center">
          <h2 className="text-lg font-light">WELCOME TO</h2>
          <h1 className="text-3xl md:text-4xl font-bold mt-2">
            Hệ thống Quản lý & Đặt chỗ Không gian Học tập Thông minh HCMUT
          </h1>
          <button className="mt-6 px-5 py-2 bg-blue-500 hover:bg-blue-600 rounded text-white">
            Contact us
          </button>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="bg-white py-12 px-4 md:px-0">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
          {/* Intro */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-2xl font-bold">HCMUT Smart Study Space</h3>
            <p className="text-gray-600">
              Hệ thống hiện đại tối ưu hóa việc sử dụng các không gian học tập,
              hỗ trợ sinh viên và giảng viên đặt phòng, check-in nhanh chóng
              qua mã QR hoặc trực tiếp trên web ...
            </p>
            <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
              Book Now
            </button>
          </div>

          {/* Features */}
          <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FeatureCard title="Facilities" desc="Cung cấp đầy đủ máy chiếu, bảng tương tác, Wi-Fi,... Đặt trước dễ dàng để hỗ trợ học tập hiệu quả." />
            <FeatureCard title="Location" desc="Phòng học nằm tại nhiều tòa nhà trong khuôn viên HCMUT, thuận tiện di chuyển và kết nối học tập." />
            <FeatureCard title="University Rules" desc="Tuân thủ nội quy sử dụng, giữ gìn vệ sinh, an toàn và trật tự trong môi trường học tập chung." />
            <FeatureCard title="Highlights" desc="Không gian hiện đại, linh hoạt, phục vụ nhu cầu đa dạng tại HCMUT." />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 text-center text-sm text-gray-600 py-6 px-4 border-t">
        <div className="mb-4">
          <img src="/BACHKHOA.png" alt="logo" className="mx-auto w-10 h-10" />
          <p>Trường Đại Học Bách Khoa – 268 Lý Thường Kiệt, Quận 10, TP.HCM</p>
        </div>
        <div className="flex flex-col md:flex-row justify-center gap-8 mb-4">
          <div>
            <h4 className="font-semibold mb-1">About Us</h4>
            <ul>
              <li>Feedback</li>
              <li>News & Blog</li>
              <li>Terms of Service</li>
              <li>Privacy Policy</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Contact Info</h4>
            <p>Email: bstgroup@hcmut.edu.vn</p>
            <p>Contact: (+84) 364359876</p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Media Social</h4>
            <p className="flex gap-3 justify-center">📘 📸 🐦 💼</p>
          </div>
        </div>
        <p>© Copyright 2025–20XX CO3001</p>
      </footer>
    </div>
  );
};

const FeatureCard = ({ title, desc }: { title: string; desc: string }) => (
  <div className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition">
    <h4 className="font-semibold mb-1">{title}</h4>
    <p className="text-sm text-gray-600">{desc}</p>
  </div>
);

export default LandingPage;
