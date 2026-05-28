import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Artifact } from '../types';
import apiService from '../services/api';

interface ArtifactState {
  items: Artifact[];
  loading: boolean;
  error: string | null;
}

const initialState: ArtifactState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchArtifacts = createAsyncThunk(
  'artifacts/fetchAll',
  async (_, { rejectWithValue }) => {
    const response = await apiService.getAllArtifacts();
    if (response.status === 'success' && response.data) {
      return response.data;
    }
    return rejectWithValue(response.message || 'Failed to fetch artifacts');
  }
);

export const createArtifact = createAsyncThunk(
  'artifacts/create',
  async (artifact: Partial<Artifact>, { rejectWithValue }) => {
    const response = await apiService.createArtifact(artifact);
    if (response.status === 'success' && response.data) {
      return response.data;
    }
    return rejectWithValue(response.message || 'Failed to create artifact');
  }
);

export const updateArtifact = createAsyncThunk(
  'artifacts/update',
  async ({ name, updates }: { name: string; updates: Partial<Artifact> }, { rejectWithValue }) => {
    const response = await apiService.updateArtifact(name, updates);
    if (response.status === 'success' && response.data) {
      return response.data;
    }
    return rejectWithValue(response.message || 'Failed to update artifact');
  }
);

export const deleteArtifact = createAsyncThunk(
  'artifacts/delete',
  async (name: string, { rejectWithValue }) => {
    const response = await apiService.deleteArtifact(name);
    if (response.status === 'success') {
      return name;
    }
    return rejectWithValue(response.message || 'Failed to delete artifact');
  }
);

export const syncArtifact = createAsyncThunk(
  'artifacts/sync',
  async (name: string, { rejectWithValue }) => {
    const response = await apiService.syncArtifact(name);
    if (response.status === 'success') {
      return name;
    }
    return rejectWithValue(response.message || 'Failed to sync artifact');
  }
);

export const syncAllArtifacts = createAsyncThunk(
  'artifacts/syncAll',
  async (_, { rejectWithValue }) => {
    const response = await apiService.syncAllArtifacts();
    if (response.status === 'success') {
      return true;
    }
    return rejectWithValue(response.message || 'Failed to sync artifacts');
  }
);

const artifactSlice = createSlice({
  name: 'artifacts',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchArtifacts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchArtifacts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchArtifacts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createArtifact.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(createArtifact.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(updateArtifact.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.name === action.payload.name);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateArtifact.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(deleteArtifact.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.name !== action.payload);
      })
      .addCase(deleteArtifact.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = artifactSlice.actions;
export default artifactSlice.reducer;
