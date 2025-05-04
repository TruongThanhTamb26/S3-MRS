import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

interface AuthResponse {
    success: boolean;
    data: {
        token: string;
        user: {
            id: number;
            username: string;
            fullName: string;
            email: string;
            role: string;
        }
    };
    message?: string;
}

interface RegisterResponse {
    success: boolean;
    data: {
        id: number;
        username: string;
        fullName: string;
        email: string;
        role: string;
    };
    message?: string;
}

//implement getAuthHeader function to add token to requests
const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const authService = {
    // Đăng nhập
    async login(username: string, password: string): Promise<AuthResponse> {
        try {
            const response = await axios.post(`${API_URL}/users/login`, {
                username,
                password
            });
            
            // Lưu token và thông tin người dùng vào localStorage
            if (response.data.success) {
                localStorage.setItem('token', response.data.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.data.user));
            }
            
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Đăng nhập thất bại';
            throw new Error(errorMessage);
        }
    },

    // Đăng ký
    async register(userData: { username: string, password: string, fullName: string, email: string }): Promise<RegisterResponse> {
        try {
            const response = await axios.post(`${API_URL}/users/register`, userData);
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Đăng ký thất bại';
            throw new Error(errorMessage);
        }
    },

    // Đăng xuất
    async logout(): Promise<void> {
        try {
            // Gọi API đăng xuất nếu cần
            await axios.post(`${API_URL}/auth/logout`, {}, {
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                }
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Xóa token khỏi localStorage
            localStorage.removeItem('token');
        }
    },

    // Kiểm tra đã đăng nhập chưa
    isAuthenticated(): boolean {
        return !!localStorage.getItem('token');
    },

    // Lấy thông tin người dùng từ localStorage
    getCurrentUser(): any {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    // Kiểm tra có phải là admin không
    isAdmin(): boolean {
        const user = this.getCurrentUser();
        return user ? user.role === 'admin' : false;
    },

    // Kiểm tra có phải là technician không
    isTechnician(): boolean {
        const user = this.getCurrentUser();
        return user ? user.role === 'technician' : false;
    }
};