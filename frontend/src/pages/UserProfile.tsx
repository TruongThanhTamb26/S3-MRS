import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserNavbar from '../components/UserNavbar';
import axios from "axios";
import api from '../services/api.service';

// Define User interface
interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  studentId?: string;
  faculty?: string;
  phoneNumber?: string;
  role: string;
}

const UserProfile: React.FC = () => {
  // State variables
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isChangingPassword, setIsChangingPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  
  // Edit profile state
  const [editedUser, setEditedUser] = useState<Partial<User>>({});
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  
  const navigate = useNavigate();

  // Fetch user profile on component mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await api.get('/users/profile');

      if (response.data.success) {
        setUser(response.data.data);
        setEditedUser(response.data.data);
      } else {
        setError(response.data.message || "Không thể tải thông tin người dùng");
      }
    } catch (err: any) {
      console.error("Error fetching user profile:", err);
      setError(err.response?.data?.message || "Đã xảy ra lỗi khi tải thông tin người dùng");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedUser({
      ...editedUser,
      [name]: value
    });
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.put('/users/profile', editedUser);

      if (response.data.success) {
        setUser(response.data.data);
        setSuccess("Cập nhật thông tin thành công");
        setIsEditing(false);
      } else {
        setError(response.data.message || "Không thể cập nhật thông tin người dùng");
      }
    } catch (err: any) {
      console.error("Error updating user profile:", err);
      setError(err.response?.data?.message || "Đã xảy ra lỗi khi cập nhật thông tin người dùng");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password fields
    if (newPassword !== confirmPassword) {
      setError("Xác nhận mật khẩu không khớp với mật khẩu mới");
      return;
    }
    
    if (newPassword.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.post('/users/change-password', {
        currentPassword,
        newPassword
      });

      if (response.data.success) {
        setSuccess("Đổi mật khẩu thành công");
        setIsChangingPassword(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setError(response.data.message || "Không thể đổi mật khẩu");
      }
    } catch (err: any) {
      console.error("Error changing password:", err);
      setError(err.response?.data?.message || "Đã xảy ra lỗi khi đổi mật khẩu");
    } finally {
      setIsLoading(false);
    }
  };
  
  const cancelEdit = () => {
    setIsEditing(false);
    setEditedUser(user || {});
    setError("");
  };
  
  const cancelPasswordChange = () => {
    setIsChangingPassword(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white">
      {/* Navbar - same as other pages */}
        <UserNavbar />
        {/* Hero Section - same as other pages */}
      {/* Content */}
      <div className="flex-grow px-4 py-8 max-w-6xl mx-auto w-full">
        <h2 className="text-2xl font-bold text-blue-800 mb-6 text-center">
          THÔNG TIN CÁ NHÂN
        </h2>

        {/* Error and Success messages */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p>{error}</p>
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            <p>{success}</p>
          </div>
        )}

        {/* Loading indicator */}
        {isLoading && !user && (
          <div className="flex justify-center my-12">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* User Profile View/Edit */}
        {user && (
          <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
            <div className="bg-blue-700 text-white p-4 flex justify-between items-center">
              <h3 className="font-bold text-lg">Thông tin cá nhân</h3>
              {!isEditing ? (
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setIsChangingPassword(false);
                  }}
                  className="bg-white text-blue-700 px-4 py-1 rounded text-sm hover:bg-blue-50"
                >
                  Chỉnh sửa
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={cancelEdit}
                    className="bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm hover:bg-gray-300"
                  >
                    Hủy
                  </button>
                  <button
                    form="profile-form"
                    type="submit"
                    className="bg-white text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-50"
                  >
                    Lưu
                  </button>
                </div>
              )}
            </div>
            
            <div className="p-6">
              {isEditing ? (
                <form id="profile-form" onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Họ và tên
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={editedUser.fullName || ''}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={editedUser.email || ''}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={editedUser.phoneNumber || ''}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        MSSV
                      </label>
                      <input
                        type="text"
                        name="studentId"
                        value={editedUser.studentId || ''}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        readOnly={user.role !== 'student'}
                        disabled={user.role !== 'student'}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Khoa
                      </label>
                      <input
                        type="text"
                        name="faculty"
                        value={editedUser.faculty || ''}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tên đăng nhập
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={editedUser.username || ''}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100"
                        disabled
                      />
                    </div>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Họ và tên</p>
                    <p className="font-medium">{user.fullName}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Số điện thoại</p>
                    <p className="font-medium">{user.phoneNumber || "Chưa cập nhật"}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 mb-1">MSSV</p>
                    <p className="font-medium">{user.studentId || "N/A"}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Khoa</p>
                    <p className="font-medium">{user.faculty || "Chưa cập nhật"}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Tên đăng nhập</p>
                    <p className="font-medium">{user.username}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Vai trò</p>
                    <p className="font-medium capitalize">
                      {user.role === 'student' ? 'Sinh viên' : 
                       user.role === 'admin' ? 'Quản trị viên' : 
                       user.role === 'technician' ? 'Kỹ thuật viên' : user.role}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Password Change Section */}
        {user && (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="bg-blue-700 text-white p-4 flex justify-between items-center">
              <h3 className="font-bold text-lg">Đổi mật khẩu</h3>
              {!isChangingPassword ? (
                <button
                  onClick={() => {
                    setIsChangingPassword(true);
                    setIsEditing(false);
                  }}
                  className="bg-white text-blue-700 px-4 py-1 rounded text-sm hover:bg-blue-50"
                >
                  Đổi mật khẩu
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={cancelPasswordChange}
                    className="bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm hover:bg-gray-300"
                  >
                    Hủy
                  </button>
                  <button
                    form="password-form"
                    type="submit"
                    className="bg-white text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-50"
                  >
                    Lưu
                  </button>
                </div>
              )}
            </div>
            
            <div className="p-6">
              {isChangingPassword ? (
                <form id="password-form" onSubmit={handlePasswordChange} className="space-y-4 max-w-md mx-auto">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mật khẩu hiện tại
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mật khẩu mới
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                      minLength={6}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Xác nhận mật khẩu mới
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>
                </form>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="mb-2">Bạn có thể thay đổi mật khẩu để tăng tính bảo mật cho tài khoản của mình.</p>
                  <p>Nhấn nút "Đổi mật khẩu" ở trên để bắt đầu.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer - same as other pages */}
      <footer className="bg-gray-800 text-white text-xs mt-auto p-4 text-center">
        <p>Email: btstgroup@hcmut.edu.vn</p>
        <p>ĐT (Tel.): +84 363459876</p>
        <p>Trường ĐH Bách Khoa – 268 Lý Thường Kiệt, Q.10, TP.HCM</p>
        <p>Copyright 2025-20XX CO3001</p>
      </footer>
    </div>
  );
};

export default UserProfile;