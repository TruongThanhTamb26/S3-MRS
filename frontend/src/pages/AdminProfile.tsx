import React, { useState, useEffect } from "react";
import { DashNavbar } from "../components/DashNavbar";
import { authService } from "../services/auth.service";
import { adminService } from "../services/admin.service";
import { userService } from "../services/user.service";

interface ProfileData {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: string;
}

const AdminProfile: React.FC = () => {
  // State variables
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  
  // Edit states
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editFormData, setEditFormData] = useState({
    fullName: "",
    email: ""
  });
  
  // Password change states
  const [showPasswordForm, setShowPasswordForm] = useState<boolean>(false);
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  // Fetch profile data on component mount
  useEffect(() => {
    fetchProfileData();
  }, []);
  
  // Fetch user profile data
  const fetchProfileData = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      // Get current user data from auth service
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        // Get detailed user data if needed
        const response = await userService.getUserProfile();
        
        if (response.success) {
          setProfileData(response.data);
          setEditFormData({
            fullName: response.data.fullName,
            email: response.data.email
          });
        } else {
          setError("Không thể tải thông tin hồ sơ");
        }
      } else {
        setError("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
      }
    } catch (err: any) {
      console.error("Error fetching profile data:", err);
      setError(err.message || "Đã xảy ra lỗi khi tải thông tin hồ sơ");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle password form input changes
  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Save profile changes
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!profileData) {
      setError("Không có dữ liệu hồ sơ để cập nhật");
      return;
    }
    
    try {
      const response = await adminService.updateUser(profileData.id, editFormData);
      
      if (response.success) {
        setProfileData(response.data);
        setSuccessMessage("Cập nhật hồ sơ thành công");
        setIsEditing(false);
        
        // Update local storage user data
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          localStorage.setItem('user', JSON.stringify({
            ...currentUser,
            fullName: response.data.fullName,
            email: response.data.email
          }));
        }
      } else {
        setError(response.message || "Không thể cập nhật hồ sơ");
      }
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setError(err.message || "Đã xảy ra lỗi khi cập nhật hồ sơ");
    }
  };
  
  // Change password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Validate new password
    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      setError("Mật khẩu mới không khớp với mật khẩu xác nhận");
      return;
    }
    
    try {
      const response = await adminService.changePassword({
        currentPassword: passwordFormData.currentPassword,
        newPassword: passwordFormData.newPassword
      });
      
      if (response.success) {
        setSuccessMessage("Đổi mật khẩu thành công");
        setShowPasswordForm(false);
        setPasswordFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
      } else {
        setError(response.message || "Không thể đổi mật khẩu");
      }
    } catch (err: any) {
      console.error("Error changing password:", err);
      setError(err.message || "Đã xảy ra lỗi khi đổi mật khẩu");
    }
  };
  
  // Cancel editing
  const handleCancelEdit = () => {
    if (profileData) {
      setEditFormData({
        fullName: profileData.fullName,
        email: profileData.email
      });
    }
    setIsEditing(false);
  };

  // Toggle password form
  const togglePasswordForm = () => {
    setShowPasswordForm(!showPasswordForm);
    setPasswordFormData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
    setError("");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <DashNavbar />
      
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Hồ sơ cá nhân</h1>
          
          {/* Success message */}
          {successMessage && (
            <div className="mb-6 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm">{successMessage}</p>
                </div>
                <div className="ml-auto pl-3">
                  <div className="-mx-1.5 -my-1.5">
                    <button
                      onClick={() => setSuccessMessage("")}
                      className="inline-flex text-green-500 focus:outline-none focus:text-green-700"
                    >
                      <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Error message */}
          {error && (
            <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm">{error}</p>
                </div>
                <div className="ml-auto pl-3">
                  <div className="-mx-1.5 -my-1.5">
                    <button
                      onClick={() => setError("")}
                      className="inline-flex text-red-500 focus:outline-none focus:text-red-700"
                    >
                      <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-center my-12">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          
          {!isLoading && profileData && (
            <>
              {/* Profile Information Card */}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Thông tin người dùng</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">Thông tin cá nhân và tài khoản.</p>
                  </div>
                  
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Chỉnh sửa
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleCancelEdit}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Lưu thay đổi
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="border-t border-gray-200">
                  <dl>
                    {/* Username */}
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Tên đăng nhập</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{profileData.username}</dd>
                    </div>
                    
                    {/* Full name */}
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Họ và tên</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {isEditing ? (
                          <input
                            type="text"
                            name="fullName"
                            value={editFormData.fullName}
                            onChange={handleInputChange}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                        ) : (
                          profileData.fullName
                        )}
                      </dd>
                    </div>
                    
                    {/* Email */}
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Email</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {isEditing ? (
                          <input
                            type="email"
                            name="email"
                            value={editFormData.email}
                            onChange={handleInputChange}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                        ) : (
                          profileData.email
                        )}
                      </dd>
                    </div>
                    
                    {/* Role */}
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Vai trò</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {profileData.role === 'admin' ? 'Quản trị viên' : 
                        profileData.role === 'technician' ? 'Kỹ thuật viên' : 'Người dùng'}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
              
              {/* Password Change Section */}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Bảo mật</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">Thay đổi mật khẩu tài khoản.</p>
                  </div>
                  
                  {!showPasswordForm ? (
                    <button
                      onClick={togglePasswordForm}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                      Đổi mật khẩu
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={togglePasswordForm}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={handleChangePassword}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Lưu mật khẩu
                      </button>
                    </div>
                  )}
                </div>
                
                {showPasswordForm && (
                  <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                    <form className="space-y-4" onSubmit={handleChangePassword}>
                      <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                          Mật khẩu hiện tại
                        </label>
                        <input
                          type="password"
                          name="currentPassword"
                          id="currentPassword"
                          value={passwordFormData.currentPassword}
                          onChange={handlePasswordInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                          Mật khẩu mới
                        </label>
                        <input
                          type="password"
                          name="newPassword"
                          id="newPassword"
                          value={passwordFormData.newPassword}
                          onChange={handlePasswordInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                          Xác nhận mật khẩu mới
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          id="confirmPassword"
                          value={passwordFormData.confirmPassword}
                          onChange={handlePasswordInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          required
                        />
                      </div>
                    </form>
                  </div>
                )}
                
                {!showPasswordForm && (
                  <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                    <p className="text-sm text-gray-500">
                      Mật khẩu của bạn phải có ít nhất 8 ký tự và bao gồm ít nhất một chữ số và một ký tự đặc biệt.
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Thay đổi mật khẩu định kỳ giúp tăng cường bảo mật cho tài khoản của bạn.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;