import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { User, AuthResponseData, LoginCredentials, ApiResponse } from './types';
import { logout, tokenReceived } from './authSlice';
import { Mutex } from 'async-mutex';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const mutex = new Mutex();

const baseQuery = fetchBaseQuery({
    baseUrl: API_BASE_URL,
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
    // wait until the mutex is available without locking it
    await mutex.waitForUnlock();
    let result = await baseQuery(args, api, extraOptions);

    if (result.error && result.error.status === 401) {
        // checking whether the mutex is locked
        if (!mutex.isLocked()) {
            const release = await mutex.acquire();
            try {
                // Try to refresh the token
                const refreshResult = await baseQuery(
                    { url: '/auth/refresh', method: 'POST' },
                    api,
                    extraOptions
                );

                if (refreshResult.data) {
                    // Type assertion for the refresh response
                    const data = (refreshResult.data as ApiResponse<{ accessToken: string }>).data;
                    api.dispatch(tokenReceived({ accessToken: data.accessToken }));

                    // Retry the initial query
                    result = await baseQuery(args, api, extraOptions);
                } else {
                    api.dispatch(logout());
                    window.location.href = '/login';
                }
            } finally {
                // release must be called once the mutex should be released again.
                release();
            }
        } else {
            // wait until the mutex is available without locking it
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
            transformResponse: (response: ApiResponse<AuthResponseData>) => response.data,
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
