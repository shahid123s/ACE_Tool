import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { User, AuthResponse, LoginCredentials } from '../services/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const apiService = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: API_BASE_URL,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem('token');
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['User', 'Worklog', 'Meeting', 'Concern', 'Request'],
    endpoints: (builder) => ({
        login: builder.mutation<AuthResponse, LoginCredentials>({
            query: (credentials) => ({
                url: '/auth/login',
                method: 'POST',
                body: credentials,
            }),
        }),
        getMe: builder.query<{ user: User }, void>({
            query: () => '/auth/me',
            providesTags: ['User'],
        }),
        // Admin Endpoints
        getAdminStats: builder.query<any, void>({
            query: () => '/admin/stats',
        }),
        getAdminStudents: builder.query<any, any>({
            query: (params) => ({
                url: '/admin/students',
                params,
            }),
        }),
        getAdminWorklogs: builder.query<any, void>({
            query: () => '/admin/worklogs',
        }),
        getAdminConcerns: builder.query<any, void>({
            query: () => '/admin/concerns',
        }),
        getAdminRequests: builder.query<any, void>({
            query: () => '/admin/requests',
        }),
        // User Endpoints
        getUserDashboard: builder.query<any, void>({
            query: () => '/user/dashboard',
        }),
        // We will add more endpoints here as we migrate from services/api.ts
    }),
});

export const {
    useLoginMutation,
    useGetMeQuery,
    useGetAdminStatsQuery,
    useGetAdminStudentsQuery,
    useGetAdminWorklogsQuery,
    useGetAdminConcernsQuery,
    useGetAdminRequestsQuery,
    useGetUserDashboardQuery,
} = apiService;
