import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Check if it's a login request (don't redirect to login if we're failing to login)
        const isLoginRequest = error.config?.url?.includes('/auth/login');

        if (error.response?.status === 401 && !isLoginRequest) {
            // Clear local storage and redirect to login if unauthorized
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Only redirect if we're not already on the login page to avoid loops
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export const authService = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    me: () => api.get('/auth/me'),
};

export const adminService = {
    getStats: () => api.get('/admin/stats'),
    getStudents: (params) => api.get('/admin/students', { params }),
    getWorklogs: () => api.get('/admin/worklogs'),
    getLeetCodeLeaderboard: () => api.get('/admin/leetcode'),
    getMeetings: () => api.get('/admin/meetings'),
    createMeeting: (data) => api.post('/admin/meetings', data),
    getConcerns: () => api.get('/admin/concerns'),
    respondToConcern: (id, response) => api.post(`/admin/concerns/${id}/respond`, { response }),
    getRequests: () => api.get('/admin/requests'),
    approveRequest: (id) => api.post(`/admin/requests/${id}/approve`),
    rejectRequest: (id) => api.post(`/admin/requests/${id}/reject`),
};

export const userService = {
    getDashboard: () => api.get('/user/dashboard'),
    getWorklogs: () => api.get('/user/worklogs'),
    createWorklog: (data) => api.post('/user/worklogs', data),
    getAttendance: () => api.get('/user/attendance'),
    clockIn: () => api.post('/user/attendance/clock-in'),
    clockOut: () => api.post('/user/attendance/clock-out'),
};

export default api;
