import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, AuthResponseData } from './types';

interface AuthState {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;
}

const storedUser = localStorage.getItem('user');
const initialState: AuthState = {
    user: (storedUser && storedUser !== 'undefined') ? JSON.parse(storedUser) : null,
    accessToken: localStorage.getItem('accessToken'),
    isAuthenticated: !!localStorage.getItem('accessToken'),
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (
            state: AuthState,
            { payload: { user, accessToken } }: PayloadAction<AuthResponseData>
        ) => {
            state.user = user;
            state.accessToken = accessToken;
            state.isAuthenticated = true;
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('user', JSON.stringify(user));
        },
        tokenReceived: (
            state: AuthState,
            { payload: { accessToken } }: PayloadAction<{ accessToken: string }>
        ) => {
            state.accessToken = accessToken;
            state.isAuthenticated = true;
            localStorage.setItem('accessToken', accessToken);
        },
        logout: (state: AuthState) => {
            state.user = null;
            state.accessToken = null;
            state.isAuthenticated = false;
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
        },
    },
});

export const { setCredentials, tokenReceived, logout } = authSlice.actions;
export default authSlice.reducer;

export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectIsAdmin = (state: { auth: AuthState }) => state.auth.user?.role === 'admin';
