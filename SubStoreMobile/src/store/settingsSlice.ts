import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AppSettings } from '../types';
import apiService from '../services/api';

interface SettingsState {
  data: AppSettings | null;
  loading: boolean;
  error: string | null;
  serverConnected: boolean;
}

const initialState: SettingsState = {
  data: null,
  loading: false,
  error: null,
  serverConnected: false,
};

export const fetchSettings = createAsyncThunk(
  'settings/fetch',
  async (_, { rejectWithValue }) => {
    const response = await apiService.getSettings();
    if (response.status === 'success' && response.data) {
      return response.data;
    }
    return rejectWithValue(response.message || 'Failed to fetch settings');
  }
);

export const updateSettings = createAsyncThunk(
  'settings/update',
  async (updates: Partial<AppSettings>, { rejectWithValue }) => {
    const response = await apiService.updateSettings(updates);
    if (response.status === 'success' && response.data) {
      return response.data;
    }
    return rejectWithValue(response.message || 'Failed to update settings');
  }
);

export const checkServerConnection = createAsyncThunk(
  'settings/checkConnection',
  async (_, { rejectWithValue }) => {
    const isHealthy = await apiService.checkHealth();
    return isHealthy;
  }
);

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setServerConnected: (state, action: PayloadAction<boolean>) => {
      state.serverConnected = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.data = action.payload;
      })
      .addCase(updateSettings.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(checkServerConnection.fulfilled, (state, action) => {
        state.serverConnected = action.payload;
      });
  },
});

export const { setServerConnected, clearError } = settingsSlice.actions;
export default settingsSlice.reducer;
