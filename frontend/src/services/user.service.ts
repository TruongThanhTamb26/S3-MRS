import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

// Response and request interfaces
interface Room {
    id: number;
    name: string;
    capacity: number;
    location: string;
    status: string;
    equipment:{
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
    createdAt: string;
    updatedAt: string;
}

interface SearchRoomResponse {
    success: boolean;
    data: Room[];
}

interface ReservationResponse {
    success: boolean;
    data: Reservation;
    message?: string;
}

interface ReservationsResponse {
    success: boolean;
    data: Reservation[];
    message?: string;
}

interface BookingRequest {
    roomId: number;
    startTime: string;
    endTime: string;
}

// Add token to requests
const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const userService = {
    // Tìm kiếm phòng theo thời gian bắt đầu và kết thúc
    async searchRoom(startTime: string, endTime: string, capacity?: number): Promise<SearchRoomResponse> {
			try {
					const response = await axios.get(`${API_URL}/rooms/available`, {
							params: { 
									startTime, 
									endTime,
									capacity
							},
							headers: {
									'Content-Type': 'application/json',
							},
					});
					return response.data;
			} catch (error: any) {
					const errorMessage = error.response?.data?.message || 'Tìm kiếm phòng thất bại';
					throw new Error(errorMessage);
			}
	},

    // Đặt phòng mới
    async bookRoom(bookingData: BookingRequest): Promise<ReservationResponse> {
        try {
            const response = await axios.post(`${API_URL}/reservations`, bookingData, {
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
            });
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Đặt phòng thất bại';
            throw new Error(errorMessage);
        }
    },

    // Lấy danh sách đặt phòng của người dùng
    async getUserReservations(): Promise<ReservationsResponse> {
        try {
            const response = await axios.get(`${API_URL}/reservations/my-reservations`, {
                params: { status },
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

    // Hủy đặt phòng
    async cancelReservation(reservationId: number): Promise<ReservationResponse> {
        try {
            const response = await axios.delete(`${API_URL}/reservations/${reservationId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
            });
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Hủy đặt phòng thất bại';
            throw new Error(errorMessage);
        }
    },

    // Lấy chi tiết đặt phòng
    async getReservationDetails(reservationId: number): Promise<ReservationResponse> {
        try {
            const response = await axios.get(`${API_URL}/reservations/${reservationId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
            });
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Không thể tải chi tiết đặt phòng';
            throw new Error(errorMessage);
        }
    },

    // Check-in đặt phòng
    async checkInReservation(reservationId: number): Promise<ReservationResponse> {
        try {
            const response = await axios.post(`${API_URL}/reservations/${reservationId}/check-in`, {}, {
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
            });
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Check-in thất bại';
            throw new Error(errorMessage);
        }
    },

    // Check-out đặt phòng
    async checkOutReservation(reservationId: number): Promise<ReservationResponse> {
        try {
            const response = await axios.post(`${API_URL}/reservations/${reservationId}/check-out`, {}, {
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
            });
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Check-out thất bại';
            throw new Error(errorMessage);
        }
    },

    // Cập nhật thông tin đặt phòng
    async updateReservation(reservationId: number, reservationData: Partial<Reservation>): Promise<ReservationResponse> {
        try {
            const response = await axios.put(`${API_URL}/reservations/${reservationId}`, reservationData, {
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
            });
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Cập nhật đặt phòng thất bại';
            throw new Error(errorMessage);
        }
    },

    // Cập nhật thông tin người dùng
    async updateUserProfile(userData: any): Promise<any> {
        try {
            const response = await axios.put(`${API_URL}/users/profile`, userData, {
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
            });
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Cập nhật thông tin người dùng thất bại';
            throw new Error(errorMessage);
        }
    },

    // Thay đổi mật khẩu
    async changePassword(passwordData: { currentPassword: string, newPassword: string }): Promise<any> {
        try {
            const response = await axios.post(`${API_URL}/users/change-password`, passwordData, {
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
            });
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Thay đổi mật khẩu thất bại';
            throw new Error(errorMessage);
        }
    },

    // Lấy thông tin người dùng hiện tại
    async getUserProfile(): Promise<any> {
        try {
            const response = await axios.get(`${API_URL}/users/profile`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
            });
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Không thể tải thông tin người dùng';
            throw new Error(errorMessage); // Thêm throw Error ở đây
        }
    },

    // Lấy thông tin chi tiết của một phòng
    async getRoomDetails(roomId: number): Promise<any> {
        try {
            const response = await axios.get(`${API_URL}/rooms/${roomId}`, {
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
    }
};