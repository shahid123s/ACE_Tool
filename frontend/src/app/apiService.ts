import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { User, AuthResponse, LoginCredentials } from './types';
import { logout } from './authSlice';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const baseQuery = fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
        const token = localStorage.getItem('token');
        if (token) {
            headers.set('authorization', `Bearer ${token}`);
        }
        return headers;
    },
});

const baseQueryWithReauth: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
> = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions);

    // If you get a 401, logout the user
    if (result.error && result.error.status === 401) {
        // Prevent redirect loop if already on login page
        if (!window.location.pathname.includes('/login')) {
            api.dispatch(logout()); // Clear Redux state
            // Optionally clear local storage if the reducer doesn't fully handle it (it does in our case)
            // localStorage.removeItem('token');
            // localStorage.removeItem('user');
            window.location.href = '/login';
        }
    }
    return result;
};

export const apiService = createApi({
    reducerPath: 'api',
    baseQuery: baseQueryWithReauth,
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
