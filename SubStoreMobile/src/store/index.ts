import { configureStore } from '@reduxjs/toolkit';
import subscriptionReducer from './subscriptionSlice';
import collectionReducer from './collectionSlice';
import artifactReducer from './artifactSlice';
import settingsReducer from './settingsSlice';
import uiReducer from './uiSlice';

export const store = configureStore({
  reducer: {
    subscriptions: subscriptionReducer,
    collections: collectionReducer,
    artifacts: artifactReducer,
    settings: settingsReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
