import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

// Add token to requests
const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

interface EquipmentResponse {
    success: boolean;
    data: {
        Mic: number;
        Projector: number;
        AirCon: number;
    };
    message?: string;
}

export const technicianService = {
    // Lấy danh sách thiết bị theo phòng
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
            const errorMessage = error.response?.data?.message || 'Không thể tải thông tin thiết bị';
            throw new Error(errorMessage);
        }
    },

    // Cập nhật số lượng thiết bị trong phòng
    async updateDevicesByRoomId(roomId: number, deviceData: { Mic?: number, Projector?: number, AirCon?: number }): Promise<EquipmentResponse> {
        try {
            const response = await axios.put(`${API_URL}/devices/room/${roomId}`, deviceData, {
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
            });
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Không thể cập nhật thiết bị';
            throw new Error(errorMessage);
        }
    }
};