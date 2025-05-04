import React, { useState, useEffect } from 'react';
import { TechNavbar } from '../components/TechNavbar';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { technicianService } from '../services/technician.service';

interface Room {
  id: number;
  name: string;
  location: string;
  capacity: number;
  status: string;
}

interface Equipment {
  Mic: number;
  Projector: number;
  AirCon: number;
}

const Equipment: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [selectedRoomEquipment, setSelectedRoomEquipment] = useState<Equipment | null>(null);
  const [editEquipment, setEditEquipment] = useState<Equipment>({
    Mic: 0,
    Projector: 0,
    AirCon: 0
  });
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [loadingEquipment, setLoadingEquipment] = useState<boolean>(false);

  // Fetch rooms data
  useEffect(() => {
    fetchRooms();
  }, []);

  // Fetch equipment when a room is selected
  useEffect(() => {
    if (selectedRoomId) {
      fetchRoomEquipment(selectedRoomId);
    }
  }, [selectedRoomId]);

  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      const response = await technicianService.getAllRooms();

      if (response.success) {
        setRooms(response.data);
      } else {
        toast.error('Không thể tải danh sách phòng');
      }
    } catch (error: any) {
      console.error('Error fetching rooms:', error);
      toast.error(error.message || 'Không thể tải danh sách phòng');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoomEquipment = async (roomId: number) => {
    setLoadingEquipment(true);
    try {
      const response = await technicianService.getDevicesByRoomId(roomId);

      if (response.success) {
        setSelectedRoomEquipment(response.data);
        setEditEquipment(response.data); // Initialize edit form with current values
      } else {
        toast.error('Không thể tải thông tin thiết bị phòng');
        setSelectedRoomEquipment(null);
      }
    } catch (error: any) {
      console.error('Error fetching room equipment:', error);
      toast.error(error.message || 'Không thể tải thông tin thiết bị phòng');
      setSelectedRoomEquipment(null);
    } finally {
      setLoadingEquipment(false);
    }
  };

  // Select a room to view equipment
  const handleRoomSelect = (roomId: number) => {
    setSelectedRoomId(roomId);
    setIsEditing(false);
  };

  // Start editing equipment
  const handleEditClick = () => {
    if (selectedRoomEquipment) {
      setEditEquipment({...selectedRoomEquipment});
      setIsEditing(true);
    }
  };

  // Handle equipment quantity change
  const handleEquipmentChange = (equipment: keyof Equipment, value: number) => {
    setEditEquipment(prev => ({
      ...prev,
      [equipment]: Math.max(0, value) // Ensure value is not negative
    }));
  };

  // Save edited equipment
  const handleSaveClick = async () => {
    if (!selectedRoomId) return;
    
    try {
      setLoadingEquipment(true);
      const response = await technicianService.updateDeviceByRoomId(
        selectedRoomId, 
        editEquipment
      );

      if (response.success) {
        toast.success('Cập nhật thiết bị phòng thành công');
        setSelectedRoomEquipment(editEquipment);
        setIsEditing(false);
      } else {
        toast.error(response.message || 'Cập nhật thiết bị thất bại');
      }
    } catch (error: any) {
      console.error('Error updating room equipment:', error);
      toast.error(error.message || 'Cập nhật thiết bị thất bại');
    } finally {
      setLoadingEquipment(false);
    }
  };

  // Cancel editing
  const handleCancelClick = () => {
    setIsEditing(false);
  };

  // Filter rooms by search term
  const filteredRooms = rooms.filter(room => 
    room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get selected room data
  const selectedRoom = rooms.find(room => room.id === selectedRoomId);

  return (
    <div className="min-h-screen bg-gray-100">
      <TechNavbar />
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Room List Panel */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Danh sách Phòng</h2>
            
            {/* Search bar */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Tìm kiếm phòng..."
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Loading spinner for rooms */}
            {isLoading ? (
              <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <>
                {filteredRooms.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Không tìm thấy phòng nào
                  </div>
                ) : (
                  <div className="overflow-y-auto max-h-[500px] pr-2">
                    <ul className="divide-y divide-gray-200">
                      {filteredRooms.map((room) => (
                        <li key={room.id} className="py-3">
                          <button
                            onClick={() => handleRoomSelect(room.id)}
                            className={`w-full text-left px-3 py-2 rounded-md transition-colors duration-200 ${
                              selectedRoomId === room.id 
                                ? 'bg-blue-100 text-blue-800'
                                : 'hover:bg-gray-100'
                            }`}
                          >
                            <div className="font-medium">{room.name}</div>
                            <div className="text-sm text-gray-500">{room.location}</div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Equipment Detail Panel */}
          <div className="bg-white rounded-lg shadow-md p-6 md:col-span-2">
            {selectedRoomId && selectedRoom ? (
              <>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">{selectedRoom.name}</h2>
                    <p className="text-gray-500">{selectedRoom.location}</p>
                  </div>
                  {!isEditing && selectedRoomEquipment && (
                    <button
                      onClick={handleEditClick}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
                    >
                      Chỉnh sửa thiết bị
                    </button>
                  )}
                </div>

                {loadingEquipment ? (
                  <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <>
                    {selectedRoomEquipment ? (
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="text-lg font-semibold mb-4">Thiết bị trong phòng</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Mic */}
                          <div className="bg-white p-4 rounded-lg shadow-sm">
                            <div className="flex items-center mb-2">
                              <span className="text-2xl mr-2">🎤</span>
                              <h4 className="font-medium">Micro</h4>
                            </div>
                            {isEditing ? (
                              <input
                                type="number"
                                min="0"
                                className="w-full px-3 py-2 border rounded-md"
                                value={editEquipment.Mic}
                                onChange={(e) => handleEquipmentChange('Mic', parseInt(e.target.value) || 0)}
                              />
                            ) : (
                              <div className="text-2xl font-bold">{selectedRoomEquipment.Mic}</div>
                            )}
                          </div>
                          
                          {/* Projector */}
                          <div className="bg-white p-4 rounded-lg shadow-sm">
                            <div className="flex items-center mb-2">
                              <span className="text-2xl mr-2">📽️</span>
                              <h4 className="font-medium">Máy chiếu</h4>
                            </div>
                            {isEditing ? (
                              <input
                                type="number"
                                min="0"
                                className="w-full px-3 py-2 border rounded-md"
                                value={editEquipment.Projector}
                                onChange={(e) => handleEquipmentChange('Projector', parseInt(e.target.value) || 0)}
                              />
                            ) : (
                              <div className="text-2xl font-bold">{selectedRoomEquipment.Projector}</div>
                            )}
                          </div>
                          
                          {/* Air Conditioner */}
                          <div className="bg-white p-4 rounded-lg shadow-sm">
                            <div className="flex items-center mb-2">
                              <span className="text-2xl mr-2">❄️</span>
                              <h4 className="font-medium">Điều hòa</h4>
                            </div>
                            {isEditing ? (
                              <input
                                type="number"
                                min="0"
                                className="w-full px-3 py-2 border rounded-md"
                                value={editEquipment.AirCon}
                                onChange={(e) => handleEquipmentChange('AirCon', parseInt(e.target.value) || 0)}
                              />
                            ) : (
                              <div className="text-2xl font-bold">{selectedRoomEquipment.AirCon}</div>
                            )}
                          </div>
                        </div>
                        
                        {/* Save/Cancel buttons */}
                        {isEditing && (
                          <div className="flex justify-end mt-6 space-x-4">
                            <button
                              onClick={handleCancelClick}
                              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
                              disabled={loadingEquipment}
                            >
                              Hủy
                            </button>
                            <button
                              onClick={handleSaveClick}
                              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors"
                              disabled={loadingEquipment}
                            >
                              {loadingEquipment ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-10 text-gray-500">
                        Không thể tải thông tin thiết bị phòng
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-64">
                <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
                <p className="mt-2 text-gray-500">Chọn một phòng để xem thiết bị</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Equipment;