import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

// Interface definitions
interface User {
    id: number;
    username: string;
    fullName: string;
    email: string;
    role: string;
    createdAt: string;
    updatedAt: string;
}

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
    }
    createdAt: string;
    updatedAt: string;
}

interface Reservation {
    id: number;
    roomId: number;
    userId: number;
    startTime: string;
    endTime: string;
    status: string;
    room?: Room;
    user?: User;
    createdAt: string;
    updatedAt: string;
}

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

interface UsersResponse extends ApiResponse<User[]> {}
interface UserResponse extends ApiResponse<User> {}
interface RoomsResponse extends ApiResponse<Room[]> {}
interface RoomResponse extends ApiResponse<Room> {}
interface ReservationsResponse extends ApiResponse<Reservation[]> {}
interface ReservationResponse extends ApiResponse<Reservation> {}
interface GeneralResponse extends ApiResponse<any> {}

// Add token to requests
const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const adminService = {
    // =================== User Management ===================
    // Get all users
    async getAllUsers(role?: string): Promise<UsersResponse> {
        try {
            const response = await axios.get(`${API_URL}/users`, {
                params: { role },
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
            });
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Không thể tải danh sách người dùng';
            throw new Error(errorMessage);
        }
    },

    // Get user by ID
    async getUserById(id: number): Promise<UserResponse> {
        try {
            const response = await axios.get(`${API_URL}/users/${id}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
            });
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Không thể tải thông tin người dùng';
            throw new Error(errorMessage);
        }
    },

    // Create new user
    async createUser(userData: Partial<User>): Promise<UserResponse> {
        try {
            const response = await axios.post(`${API_URL}/users`, userData, {
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
            });
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Không thể tạo người dùng mới';
            throw new Error(errorMessage);
        }
    },

    // Update user
    async updateUser(id: number, userData: Partial<User>): Promise<UserResponse> {
        try {
            const response = await axios.put(`${API_URL}/users/profile`, userData, {
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
            });
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Không thể cập nhật thông tin người dùng';
            throw new Error(errorMessage);
        }
    },

    // Delete user
    async deleteUser(id: number): Promise<GeneralResponse> {
        try {
            const response = await axios.delete(`${API_URL}/users/${id}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
            });
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Không thể xóa người dùng';
            throw new Error(errorMessage);
        }
    },

    // Change password
    async changePassword(passwordData: { currentPassword: string, newPassword: string }): Promise<GeneralResponse> {
        try {
            const response = await axios.post(`${API_URL}/users/change-password`, passwordData, {
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
            });
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Không thể đổi mật khẩu';
            throw new Error(errorMessage);
        }
    },

    // =================== Room Management ===================
    // Get all rooms with optional filters
    async getAllRooms(filters: any = {}): Promise<RoomsResponse> {
        try {
            const response = await axios.get(`${API_URL}/rooms`, {
                params: filters,
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

    // Get room by ID
    async getRoomById(id: number): Promise<RoomResponse> {
        try {
            const response = await axios.get(`${API_URL}/rooms/${id}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
            });
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Không thể tải thông tin phòng';
            throw new Error(errorMessage);
        }
    },

    // Create new room
    async createRoom(roomData: Partial<Room>): Promise<RoomResponse> {
        try {
            const response = await axios.post(`${API_URL}/rooms`, roomData, {
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
            });
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Không thể tạo phòng mới';
            throw new Error(errorMessage);
        }
    },

    // Update room
    async updateRoom(id: number, roomData: Partial<Room>): Promise<RoomResponse> {
        try {
            const response = await axios.put(`${API_URL}/rooms/${id}`, roomData, {
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
            });
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Không thể cập nhật thông tin phòng';
            throw new Error(errorMessage);
        }
    },

    // Update room status
    async updateRoomStatus(id: number, status: string): Promise<RoomResponse> {
        try {
            const response = await axios.patch(`${API_URL}/rooms/${id}/status`, { status }, {
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
            });
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Không thể cập nhật trạng thái phòng';
            throw new Error(errorMessage);
        }
    },

    // Delete room
    async deleteRoom(id: number): Promise<GeneralResponse> {
        try {
            const response = await axios.delete(`${API_URL}/rooms/${id}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
            });
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Không thể xóa phòng';
            throw new Error(errorMessage);
        }
    },

    // =================== Reservation Management ===================
    // Get all reservations with optional filters
    async getAllReservations(filters: any = {}): Promise<ReservationsResponse> {
        try {
            const response = await axios.get(`${API_URL}/reservations`, {
                params: filters,
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
            });
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Không thể tải danh sách đặt phòng';
            throw new Error(errorMessage);
        }
    },

    // Get reservation by ID
    async getReservationById(id: number): Promise<ReservationResponse> {
        try {
            const response = await axios.get(`${API_URL}/reservations/${id}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
            });
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Không thể tải thông tin đặt phòng';
            throw new Error(errorMessage);
        }
    },

    // Approve reservation
    async approveReservation(id: number): Promise<ReservationResponse> {
        try {
            const response = await axios.put(`${API_URL}/reservations/${id}/approve`, {}, {
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
            });
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Không thể xác nhận đặt phòng';
            throw new Error(errorMessage);
        }
    },

    // Reject reservation
    async rejectReservation(id: number): Promise<ReservationResponse> {
        try {
            const response = await axios.put(`${API_URL}/reservations/${id}/reject`, {}, {
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
            });
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Không thể từ chối đặt phòng';
            throw new Error(errorMessage);
        }
    },

    // Check-in reservation
    async checkInReservation(id: number): Promise<ReservationResponse> {
        try {
            const response = await axios.post(`${API_URL}/reservations/${id}/check-in`, {}, {
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
            });
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Không thể check-in';
            throw new Error(errorMessage);
        }
    },

    // Check-out reservation
    async checkOutReservation(id: number): Promise<ReservationResponse> {
        try {
            const response = await axios.post(`${API_URL}/reservations/${id}/check-out`, {}, {
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
            });
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Không thể check-out';
            throw new Error(errorMessage);
        }
    },

    // Update reservation
    async updateReservation(id: number, reservationData: Partial<Reservation>): Promise<ReservationResponse> {
        try {
            const response = await axios.put(`${API_URL}/reservations/${id}`, reservationData, {
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
            });
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Không thể cập nhật đặt phòng';
            throw new Error(errorMessage);
        }
    },

    // Cancel reservation
    async cancelReservation(id: number): Promise<ReservationResponse> {
        try {
            const response = await axios.put(`${API_URL}/reservations/${id}/cancel`, {}, {
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
            });
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Không thể hủy đặt phòng';
            throw new Error(errorMessage);
        }
    }
};