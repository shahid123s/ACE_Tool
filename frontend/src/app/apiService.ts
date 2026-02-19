import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { User, AuthResponseData, LoginCredentials, ApiResponse } from './types';

export interface CreateStudentRequest {
    aceId: string;
    name: string;
    email: string;
    phone: string;
    batch: string;
    domain: string;
    tier: 'Tier-1' | 'Tier-2' | 'Tier-3';
}

export interface CreateStudentResponse {
    user: User;
    tempPassword: string;
}
import { logout, tokenReceived } from './authSlice';
import { Mutex } from 'async-mutex';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const mutex = new Mutex();

const baseQuery = fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: 'include', // Required for HttpOnly cookies (refreshToken)
    prepareHeaders: (headers) => {
        const token = localStorage.getItem('accessToken');
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
    // Wait until any in-progress refresh is done
    await mutex.waitForUnlock();
    let result = await baseQuery(args, api, extraOptions);

    if (result.error && result.error.status === 401) {
        // Don't try to refresh if this IS the refresh/login request
        const url = typeof args === 'string' ? args : args.url;
        if (url?.includes('/auth/login') || url?.includes('/auth/refresh')) {
            return result;
        }

        if (!mutex.isLocked()) {
            const release = await mutex.acquire();
            try {
                // Try to get a new accessToken using the refreshToken cookie
                const refreshResult = await baseQuery(
                    { url: '/auth/refresh', method: 'POST' },
                    api,
                    extraOptions
                );

                if (refreshResult.data) {
                    const data = refreshResult.data as ApiResponse<{ accessToken: string }>;
                    api.dispatch(tokenReceived({ accessToken: data.data.accessToken }));

                    // Retry the original request with the new token
                    result = await baseQuery(args, api, extraOptions);
                } else {
                    // Refresh failed — session is truly expired
                    api.dispatch(logout());
                    window.location.href = '/login';
                }
            } finally {
                release();
            }
        } else {
            // Another request is already refreshing — wait, then retry
            await mutex.waitForUnlock();
            result = await baseQuery(args, api, extraOptions);
        }
    }
    return result;
};

export const apiService = createApi({
    reducerPath: 'api',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['User', 'Worklog', 'Meeting', 'Concern', 'Request'],
    endpoints: (builder) => ({
        login: builder.mutation<AuthResponseData, LoginCredentials>({
            query: (credentials) => ({
                url: '/auth/login',
                method: 'POST',
                body: credentials,
            }),
            // Backend returns { success, data: { user, accessToken } }
            // Unwrap so the hook returns { user, accessToken } directly
            transformResponse: (response: ApiResponse<AuthResponseData>) => response.data,
        }),
        getMe: builder.query<{ user: User }, void>({
            query: () => '/auth/me',
            // Backend returns { success, data: { id, name, ... } }
            // Wrap into { user } so ProtectedRoute can read data.user
            transformResponse: (response: ApiResponse<User>) => ({ user: response.data }),
            providesTags: ['User'],
        }),
        // Admin Endpoints
        getAdminStats: builder.query<any, void>({
            query: () => '/admin/stats',
            transformResponse: (response: ApiResponse<any>) => response.data,
        }),
        getAdminStudents: builder.query<{ students: User[] }, Record<string, any>>({
            query: (params) => ({
                url: '/admin/students',
                params,
            }),
            transformResponse: (response: ApiResponse<{ students: User[] }>) => response.data,
        }),
        getAdminWorklogs: builder.query<any, void>({
            query: () => '/admin/worklogs',
            transformResponse: (response: ApiResponse<any>) => response.data,
        }),
        getAdminConcerns: builder.query<any, void>({
            query: () => '/admin/concerns',
            transformResponse: (response: ApiResponse<any>) => response.data,
        }),
        getAdminRequests: builder.query<any, void>({
            query: () => '/admin/requests',
            transformResponse: (response: ApiResponse<any>) => response.data,
        }),
        // User Endpoints
        getUserDashboard: builder.query<any, void>({
            query: () => '/user/dashboard',
        }),
        createStudent: builder.mutation<CreateStudentResponse, CreateStudentRequest>({
            query: (data: CreateStudentRequest) => ({
                url: '/admin/students',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['User'], // Refresh student lists
        }),
        updateStudent: builder.mutation<User, { id: string; data: Partial<CreateStudentRequest> & { status?: string; stage?: string } }>({
            query: ({ id, data }) => ({
                url: `/admin/students/${id}`,
                method: 'PUT',
                body: data,
            }),
            transformResponse: (response: ApiResponse<User>) => response.data,
            invalidatesTags: ['User'], // Refresh student lists
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
    useCreateStudentMutation,
    useUpdateStudentMutation,
} = apiService;
