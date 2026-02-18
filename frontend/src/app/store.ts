import { configureStore } from '@reduxjs/toolkit';

import authReducer from './authSlice';
import { apiService } from './apiService';

export const store = configureStore({
    reducer: {
        [apiService.reducerPath]: apiService.reducer,
        auth: authReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(apiService.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
