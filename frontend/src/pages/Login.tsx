import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/auth.service"; // Assuming you have an auth service for handling authentication

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      const response = await authService.login( username, password );

      if (response.success) {
        // Store token and user info
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Redirect based on user role
        const { role } = response.data.user;
        if (role === 'student') {
          navigate('/booking');
        } else if (role === 'admin') {
          navigate('/admin/dashboard');
        } else if (role === 'technician') {
          navigate('/technician/dashboard');
        }
      } else {
        setError(response.message || "Đăng nhập thất bại");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.response?.message || "Đăng nhập thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-center flex flex-col" 
         style={{ backgroundImage: 'url("/hcmut-campus.png")' }}>
      <div className="bg-blue-600 text-white px-6 py-4 flex items-center">
        <img src="/BACHKHOA.png" alt="BK Logo" className="w-10 h-10 mr-2" />
        <h1 className="font-bold">
          Hệ thống Đặt phòng HCMUT
        </h1>
      </div>

      <div className="flex-grow flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl px-8 py-6 w-full max-w-md mx-4">
          <h2 className="text-2xl font-bold text-center text-blue-700 mb-6">Đăng nhập</h2>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                Tên đăng nhập
              </label>
              <input
                id="username"
                type="text"
                placeholder="Nhập tên đăng nhập"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                Mật khẩu
              </label>
              <input
                id="password"
                type="password"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full focus:outline-none focus:shadow-outline ${
                  isLoading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ©2025 Ho Chi Minh City University of Technology
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;