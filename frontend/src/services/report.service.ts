import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

// Interface definitions
interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

interface UsageReportData {
    totalBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    roomUtilization: RoomUtilization[];
    timeDistribution: TimeDistribution[];
    bookingsByStatus: StatusDistribution[];
    bookingStats: BookingStats[];
}

interface RoomUtilization {
    id: number;
    name: string;
    bookings: number;
    hours: number;
    utilization: number;
}

interface TimeDistribution {
    hour: string;
    bookings: number;
}

interface StatusDistribution {
    status: string;
    count: number;
}

interface BookingStats {
    date: string;
    bookings: number;
}

interface UserActivityData {
    userId: number;
    username: string;
    fullName: string;
    totalBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    averageDuration: number;
}

interface UsageReportResponse extends ApiResponse<UsageReportData> {}
interface RoomReportResponse extends ApiResponse<RoomUtilization> {}
interface UserActivityResponse extends ApiResponse<UserActivityData[]> {}
interface GeneralReportResponse extends ApiResponse<any> {}

// Add token to requests
const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const reportService = {
    // Get general usage report
    async getUsageReport(startDate?: string, endDate?: string): Promise<UsageReportResponse> {
        try {
            const response = await axios.get(`${API_URL}/reports/usage`, {
                params: { startDate, endDate },
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
            });
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Không thể tải báo cáo sử dụng';
            throw new Error(errorMessage);
        }
    },

    // Get room utilization report
    async getRoomUtilizationReport(startDate?: string, endDate?: string): Promise<GeneralReportResponse> {
        try {
            const response = await axios.get(`${API_URL}/reports/rooms/utilization`, {
                params: { startDate, endDate },
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
            });
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Không thể tải báo cáo sử dụng phòng';
            throw new Error(errorMessage);
        }
    },

    // Get specific room report
    async getRoomReport(roomId: number, startDate?: string, endDate?: string): Promise<RoomReportResponse> {
        try {
            const response = await axios.get(`${API_URL}/reports/rooms/${roomId}`, {
                params: { startDate, endDate },
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
            });
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Không thể tải báo cáo phòng';
            throw new Error(errorMessage);
        }
    },

    // Get time distribution report
    async getTimeDistributionReport(startDate?: string, endDate?: string): Promise<GeneralReportResponse> {
        try {
            const response = await axios.get(`${API_URL}/reports/time-distribution`, {
                params: { startDate, endDate },
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
            });
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Không thể tải báo cáo phân bố thời gian';
            throw new Error(errorMessage);
        }
    },

    // Get user activity report
    async getUserActivityReport(startDate?: string, endDate?: string, userId?: number): Promise<UserActivityResponse> {
        try {
            const response = await axios.get(`${API_URL}/reports/user-activity`, {
                params: { startDate, endDate, userId },
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
            });
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Không thể tải báo cáo hoạt động người dùng';
            throw new Error(errorMessage);
        }
    },

    // Get dashboard summary
    async getDashboardSummary(): Promise<GeneralReportResponse> {
        try {
            const response = await axios.get(`${API_URL}/reports/dashboard`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
            });
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Không thể tải dữ liệu tổng quan';
            throw new Error(errorMessage);
        }
    },

    // Get monthly stats
    async getMonthlyStats(year: number): Promise<GeneralReportResponse> {
        try {
            const response = await axios.get(`${API_URL}/reports/monthly-stats`, {
                params: { year },
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
            });
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Không thể tải thống kê theo tháng';
            throw new Error(errorMessage);
        }
    },

    // Export reports to CSV
    async exportReport(reportType: string, startDate?: string, endDate?: string): Promise<Blob> {
        try {
            const response = await axios.get(`${API_URL}/reports/export/${reportType}`, {
                params: { startDate, endDate },
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
                responseType: 'blob'
            });
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Không thể xuất báo cáo';
            throw new Error(errorMessage);
        }
    }
};