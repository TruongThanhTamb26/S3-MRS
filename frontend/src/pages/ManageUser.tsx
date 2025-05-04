import React, { useState, useEffect } from "react";
import { DashNavbar } from "../components/DashNavbar";
import { adminService } from "../services/admin.service";
import { format } from "date-fns";

interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

const UserManagement: React.FC = () => {
  // State variables
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  
  // Edit/Add user state
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    email: "",
    role: "user",
    password: ""
  });
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  
  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);
  
  // Apply filters when filters or users change
  useEffect(() => {
    applyFilters();
  }, [users, searchTerm, roleFilter]);
  
  // Fetch all users
  const fetchUsers = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      const response = await adminService.getAllUsers();
      
      if (response.success) {
        setUsers(response.data);
        setFilteredUsers(response.data);
      } else {
        setError("Không thể tải danh sách người dùng");
      }
    } catch (err: any) {
      console.error("Error fetching users:", err);
      setError(err.message || "Đã xảy ra lỗi khi tải danh sách người dùng");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Apply search and role filters
  const applyFilters = () => {
    let result = [...users];
    
    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(user => 
        user.username.toLowerCase().includes(search) ||
        user.fullName.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search)
      );
    }
    
    // Apply role filter
    if (roleFilter !== "all") {
      result = result.filter(user => user.role === roleFilter);
    }
    
    setFilteredUsers(result);
  };
  
  // Open modal to add new user
  const handleAddUser = () => {
    setFormData({
      username: "",
      fullName: "",
      email: "",
      role: "user",
      password: ""
    });
    setModalMode('add');
    setShowModal(true);
  };
  
  // Open modal to edit existing user
  const handleEditUser = (user: User) => {
    setCurrentUser(user);
    setFormData({
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      password: "" // Leave blank for editing
    });
    setModalMode('edit');
    setShowModal(true);
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Save user (create or update)
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    try {
      
      if (modalMode === 'add') {
        // Add new user
        const response = await adminService.createUser(formData);
        
        if (response.success) {
          setUsers(prev => [...prev, response.data]);
          setSuccessMessage("Tạo người dùng mới thành công");
          setShowModal(false);
        } else {
          setError(response.message || "Không thể tạo người dùng mới");
        }
      } else if (modalMode === 'edit' && currentUser) {
        // Update existing user
        const updateData = {...formData};
				
        const response = await adminService.updateUser(currentUser.id, updateData);
        
        if (response.success) {
          setUsers(prev => 
            prev.map(user => user.id === currentUser.id ? response.data : user)
          );
          setSuccessMessage("Cập nhật người dùng thành công");
          setShowModal(false);
        } else {
          setError(response.message || "Không thể cập nhật người dùng");
        }
      }
    } catch (err: any) {
      console.error("Error saving user:", err);
      setError(err.message || "Đã xảy ra lỗi khi lưu thông tin người dùng");
    }
  };
  
  // Delete user
  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm("Bạn có chắc muốn xóa người dùng này không?")) {
      return;
    }
    
    try {
      const response = await adminService.deleteUser(userId);
      
      if (response.success) {
        setUsers(prev => prev.filter(user => user.id !== userId));
        setSuccessMessage("Xóa người dùng thành công");
      } else {
        setError(response.message || "Không thể xóa người dùng");
      }
    } catch (err: any) {
      console.error("Error deleting user:", err);
      setError(err.message || "Đã xảy ra lỗi khi xóa người dùng");
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch (error) {
      return dateString;
    }
  };
  
  // Role badge display
  const getRoleBadge = (role: string) => {
    switch(role) {
      case 'admin':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Admin</span>;
      case 'technician':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Kỹ thuật viên</span>;
      case 'user':
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Người dùng</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <DashNavbar />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Quản lý người dùng</h1>
            
            <button 
              onClick={handleAddUser}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Thêm người dùng
            </button>
          </div>
          
          {/* Success message */}
          {successMessage && (
            <div className="mb-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded">
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
            <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
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
          
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-end space-y-4 md:space-y-0 md:space-x-4">
              <div className="w-full md:w-1/3">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm theo tên, email..."
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div className="w-full md:w-1/3">
                <label htmlFor="roleFilter" className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
                <select
                  id="roleFilter"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="all">Tất cả vai trò</option>
                  <option value="admin">Admin</option>
                  <option value="technician">Kỹ thuật viên</option>
                  <option value="user">Người dùng</option>
                </select>
              </div>
              
              <div>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setRoleFilter("all");
                  }}
                  className="px-4 py-2 text-sm text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200"
                >
                  Xóa bộ lọc
                </button>
              </div>
            </div>
          </div>
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-center my-12">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          
          {/* User table */}
          {!isLoading && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Người dùng
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vai trò
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ngày tạo
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-lg text-gray-500">{user.fullName.charAt(0).toUpperCase()}</span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                              <div className="text-sm text-gray-500">@{user.username}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getRoleBadge(user.role)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditUser(user)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Sửa
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {filteredUsers.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <p>Không tìm thấy người dùng nào</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Add/Edit User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {modalMode === 'add' ? 'Thêm người dùng mới' : 'Chỉnh sửa người dùng'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSaveUser}>
              <div className="mb-4">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  disabled={modalMode === 'edit'} // Can't change username in edit mode
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="user">Người dùng</option>
                  <option value="technician">Kỹ thuật viên</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <div className="mb-6">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  {modalMode === 'add' ? 'Mật khẩu' : 'Mật khẩu mới (để trống nếu không đổi)'}
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required={modalMode === 'add'} // Required only for new users
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  {modalMode === 'add' ? 'Thêm người dùng' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;