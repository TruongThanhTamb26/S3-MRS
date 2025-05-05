import React, { useState, useEffect } from "react";
import { DashNavbar } from "../components/DashNavbar";
import { adminService } from "../services/admin.service";

interface Room {
  id: number;
  name: string;
  capacity: number;
  location: string;
  status: string;
  equipment: {
    Mic: number;
    Projector: number;
    AirCon: number;
  };
  createdAt: string;
  updatedAt: string;
}

const RoomManagement: React.FC = () => {
  // State
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [capacityFilter, setCapacityFilter] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  
  // Form data for adding new room
  const [newRoom, setNewRoom] = useState({
    name: "",
    capacity: 0,
    location: "",
    equipment: {
      Mic: 0,
      Projector: 0,
      AirCon: 0
    }
  });

  // Fetch rooms on component mount
  useEffect(() => {
    fetchRooms();
  }, []);

  // Filter rooms when filters or search change
  useEffect(() => {
    let result = [...rooms];

    // Filter by search term
    if (searchTerm) {
      result = result.filter(room => 
        room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      result = result.filter(room => room.status === statusFilter);
    }

    // Filter by capacity
    if (capacityFilter > 0) {
      result = result.filter(room => room.capacity >= capacityFilter);
    }

    setFilteredRooms(result);
  }, [rooms, searchTerm, statusFilter, capacityFilter]);

  // Fetch rooms data
  const fetchRooms = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      const response = await adminService.getAllRooms();
      
      if (response.success) {
        setRooms(response.data);
        setFilteredRooms(response.data);
      } else {
        setError("Không thể tải danh sách phòng");
      }
    } catch (err: any) {
      console.error("Error fetching rooms:", err);
      setError(err.message || "Đã xảy ra lỗi khi tải danh sách phòng");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form input change for new room
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('equipment.')) {
      const equipmentField = name.split('.')[1];
      setNewRoom({
        ...newRoom,
        equipment: {
          ...newRoom.equipment,
          [equipmentField]: parseInt(value) || 0
        }
      });
    } else {
      setNewRoom({
        ...newRoom,
        [name]: name === 'capacity' ? parseInt(value) || 0 : value
      });
    }
  };

  // Add new room
  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      const response = await adminService.createRoom(newRoom);
      
      if (response.success) {
        setRooms([...rooms, response.data]);
        setShowAddModal(false);
        setSuccess("Thêm phòng mới thành công");
        
        // Reset form
        setNewRoom({
          name: "",
          capacity: 0,
          location: "",
          equipment: {
            Mic: 0,
            Projector: 0,
            AirCon: 0
          }
        });
      } else {
        setError("Không thể thêm phòng mới");
      }
    } catch (err: any) {
      console.error("Error adding room:", err);
      setError(err.message || "Đã xảy ra lỗi khi thêm phòng mới");
    } finally {
      setIsLoading(false);
    }
  };

  // Update room status
  const handleStatusChange = async (roomId: number, newStatus: string) => {
    setIsLoading(true);
    setError("");
    
    try {
      const response = await adminService.updateRoomStatus(roomId, newStatus);
      
      if (response.success) {
        // Update rooms list with new status
        const updatedRooms = rooms.map(room => 
          room.id === roomId ? { ...room, status: newStatus } : room
        );
        setRooms(updatedRooms);
        setSuccess(`Cập nhật trạng thái phòng thành công`);
      } else {
        setError("Không thể cập nhật trạng thái phòng");
      }
    } catch (err: any) {
      console.error("Error updating room status:", err);
      setError(err.message || "Đã xảy ra lỗi khi cập nhật trạng thái phòng");
    } finally {
      setIsLoading(false);
    }
  };

  // Edit room
  const handleEditRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentRoom) return;
    
    setIsLoading(true);
    setError("");
    
    try {
      const response = await adminService.updateRoom(currentRoom.id, {
        name: currentRoom.name,
        location: currentRoom.location,
        capacity: currentRoom.capacity,
        status: currentRoom.status
      });
      
      if (response.success) {
        // Update rooms list
        const updatedRooms = rooms.map(room => 
          room.id === currentRoom.id ? { ...response.data } : room
        );
        setRooms(updatedRooms);
        setShowEditModal(false);
        setSuccess("Cập nhật thông tin phòng thành công");
      } else {
        setError("Không thể cập nhật thông tin phòng");
      }
    } catch (err: any) {
      console.error("Error updating room:", err);
      setError(err.message || "Đã xảy ra lỗi khi cập nhật thông tin phòng");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete room
  const handleDeleteRoom = async (roomId: number) => {
    if (!window.confirm("Bạn có chắc muốn xóa phòng này không?")) {
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      const response = await adminService.deleteRoom(roomId);
      
      if (response.success) {
        // Remove from rooms list
        const updatedRooms = rooms.filter(room => room.id !== roomId);
        setRooms(updatedRooms);
        setSuccess("Xóa phòng thành công");
      } else {
        setError("Không thể xóa phòng");
      }
    } catch (err: any) {
      console.error("Error deleting room:", err);
      setError(err.message || "Đã xảy ra lỗi khi xóa phòng");
    } finally {
      setIsLoading(false);
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'occupied':
        return 'bg-red-100 text-red-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Render equipment badge
  const renderEquipment = (equipment: any) => {
    const items = [];
    
    if (equipment) {
      if (equipment.Mic > 0) {
        items.push(
          <div key="mic" className="flex items-center mr-2">
            <span className="text-sm mr-1">🎤</span>
            <span className="text-xs">{equipment.Mic}</span>
          </div>
        );
      }
      
      if (equipment.Projector > 0) {
        items.push(
          <div key="projector" className="flex items-center mr-2">
            <span className="text-sm mr-1">📽️</span>
            <span className="text-xs">{equipment.Projector}</span>
          </div>
        );
      }
      
      if (equipment.AirCon > 0) {
        items.push(
          <div key="aircon" className="flex items-center">
            <span className="text-sm mr-1">❄️</span>
            <span className="text-xs">{equipment.AirCon}</span>
          </div>
        );
      }
    }
    
    return (
      <div className="flex items-center">
        {items.length > 0 ? items : <span className="text-xs text-gray-500">Không có</span>}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <DashNavbar />
      
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Quản Lý Phòng Học</h1>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Thêm phòng mới
          </button>
        </div>
        
        {/* Success message */}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <div className="flex">
              <div>
                <p className="font-bold">Thành công!</p>
                <p>{success}</p>
              </div>
              <button 
                className="ml-auto" 
                onClick={() => setSuccess("")}
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 5.293a1 1 0 011.414 0L10 8.586l3.293-3.293a1 1 0 111.414 1.414L11.414 10l3.293 3.293a1 1 0 01-1.414 1.414L10 11.414l-3.293 3.293a1 1 0 01-1.414-1.414L8.586 10 5.293 6.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}
        
        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <div className="flex">
              <div>
                <p className="font-bold">Lỗi!</p>
                <p>{error}</p>
              </div>
              <button 
                className="ml-auto" 
                onClick={() => setError("")}
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 5.293a1 1 0 011.414 0L10 8.586l3.293-3.293a1 1 0 111.414 1.414L11.414 10l3.293 3.293a1 1 0 01-1.414 1.414L10 11.414l-3.293 3.293a1 1 0 01-1.414-1.414L8.586 10 5.293 6.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}
        
        {/* Search and Filters */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
              <input
                type="text"
                id="search"
                placeholder="Tên phòng, vị trí..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">Tất cả</option>
                <option value="available">Khả dụng</option>
                <option value="occupied">Không khả dụng</option>
                <option value="maintenance">Đang bảo trì</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">Sức chứa</label>
              <select
                id="capacity"
                value={capacityFilter}
                onChange={(e) => setCapacityFilter(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="0">Tất cả</option>
                <option value="10">≥ 10 chỗ</option>
                <option value="20">≥ 20 chỗ</option>
                <option value="30">≥ 30 chỗ</option>
                <option value="50">≥ 50 chỗ</option>
                <option value="100">≥ 100 chỗ</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={fetchRooms}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md w-full flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-1 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Làm mới
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
        
        {/* Rooms Table */}
        {!isLoading && (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            {filteredRooms.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phòng
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sức chứa
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thiết bị
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRooms.map((room) => (
                    <tr key={room.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{room.name}</div>
                        <div className="text-sm text-gray-500">{room.location}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{room.capacity} chỗ</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderEquipment(room.equipment)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(room.status)}`}>
                          {room.status === 'available' ? 'Khả dụng' : 
                           room.status === 'occupied' ? 'Không khả dụng' : 
                           room.status === 'maintenance' ? 'Đang bảo trì' : room.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            setCurrentRoom(room);
                            setShowEditModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDeleteRoom(room.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>Không tìm thấy phòng học nào</p>
              </div>
            )}
          </div>
        )}
        
        {/* Add Room Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-lg w-full">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-medium text-gray-900">Thêm phòng mới</h3>
              </div>
              
              <form onSubmit={handleAddRoom}>
                <div className="px-6 py-4">
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Tên phòng</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={newRoom.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Vị trí</label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={newRoom.location}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">Sức chứa</label>
                    <input
                      type="number"
                      id="capacity"
                      name="capacity"
                      min="1"
                      value={newRoom.capacity}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Thiết bị</label>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label htmlFor="mic" className="block text-xs text-gray-500 mb-1">Mic</label>
                        <input
                          type="number"
                          id="mic"
                          name="equipment.Mic"
                          min="0"
                          value={newRoom.equipment.Mic}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="projector" className="block text-xs text-gray-500 mb-1">Máy chiếu</label>
                        <input
                          type="number"
                          id="projector"
                          name="equipment.Projector"
                          min="0"
                          value={newRoom.equipment.Projector}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="aircon" className="block text-xs text-gray-500 mb-1">Điều hòa</label>
                        <input
                          type="number"
                          id="aircon"
                          name="equipment.AirCon"
                          min="0"
                          value={newRoom.equipment.AirCon}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="px-6 py-4 bg-gray-50 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="bg-white text-gray-700 px-4 py-2 rounded-md border border-gray-300 mr-2"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Đang xử lý...
                      </>
                    ) : (
                      'Thêm phòng'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Edit Room Modal */}
        {showEditModal && currentRoom && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-lg w-full">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-medium text-gray-900">Chỉnh sửa phòng</h3>
              </div>
              
              <form onSubmit={handleEditRoom}>
                <div className="px-6 py-4">
                  <div className="mb-4">
                    <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">Tên phòng</label>
                    <input
                      type="text"
                      id="edit-name"
                      value={currentRoom.name}
                      onChange={(e) => setCurrentRoom({ ...currentRoom, name: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="edit-location" className="block text-sm font-medium text-gray-700 mb-1">Vị trí</label>
                    <input
                      type="text"
                      id="edit-location"
                      value={currentRoom.location}
                      onChange={(e) => setCurrentRoom({ ...currentRoom, location: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="edit-capacity" className="block text-sm font-medium text-gray-700 mb-1">Sức chứa</label>
                    <input
                      type="number"
                      id="edit-capacity"
                      min="1"
                      value={currentRoom.capacity}
                      onChange={(e) => setCurrentRoom({ ...currentRoom, capacity: parseInt(e.target.value) || 0 })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                    <select
                      id="edit-status"
                      value={currentRoom.status}
                      onChange={(e) => setCurrentRoom({ ...currentRoom, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="available">Khả dụng</option>
                      <option value="occupied">Không khả dụng</option>
                      <option value="maintenance">Đang bảo trì</option>
                    </select>
                  </div>
                </div>
                
                <div className="px-6 py-4 bg-gray-50 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="bg-white text-gray-700 px-4 py-2 rounded-md border border-gray-300 mr-2"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Đang xử lý...
                      </>
                    ) : (
                      'Lưu thay đổi'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Equipment Modal */}
        {showEquipmentModal && currentRoom && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-lg w-full">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-medium text-gray-900">Quản lý thiết bị phòng {currentRoom.name}</h3>
              </div>  
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomManagement;