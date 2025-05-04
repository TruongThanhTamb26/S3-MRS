import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

// Add token to requests
const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

interface Equipment {
    Mic: number;
    Projector: number;
    AirCon: number;
}

interface Room {
    id: number;
    name: string;
    location: string;
    capacity: number;
    status: string;
}

interface RoomResponse {
    success: boolean;
    data: Room[];
    message?: string;
}

interface EquipmentResponse {
    success: boolean;
    data: Equipment;
    message?: string;
}

export const technicianService = {
    // Lấy danh sách tất cả các phòng
    async getAllRooms(): Promise<RoomResponse> {
        try {
            const response = await axios.get(`${API_URL}/rooms`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
            });
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Không thể tải danh sách phòng';
            throw new Error(errorMessage);
        }
    },
    
    // Lấy thiết bị theo id phòng
    async getDevicesByRoomId(roomId: number): Promise<EquipmentResponse> {
        try {
            const response = await axios.get(`${API_URL}/devices/room/${roomId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
            });
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Không thể tải thông tin thiết bị phòng';
            throw new Error(errorMessage);
        }
    },

    // Cập nhật thiết bị theo id phòng
    async updateDeviceByRoomId(roomId: number, equipment: Equipment): Promise<EquipmentResponse> {
        try {
            const response = await axios.put(`${API_URL}/devices/room/${roomId}`, 
                equipment,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        ...getAuthHeader()
                    },
                }
            );
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Không thể cập nhật thiết bị phòng';
            throw new Error(errorMessage);
        }
    }
};