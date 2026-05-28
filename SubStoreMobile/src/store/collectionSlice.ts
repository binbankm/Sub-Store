import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Collection } from '../types';
import apiService from '../services/api';

interface CollectionState {
  items: Collection[];
  loading: boolean;
  error: string | null;
}

const initialState: CollectionState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchCollections = createAsyncThunk(
  'collections/fetchAll',
  async (_, { rejectWithValue }) => {
    const response = await apiService.getAllCollections();
    if (response.status === 'success' && response.data) {
      return response.data;
    }
    return rejectWithValue(response.message || 'Failed to fetch collections');
  }
);

export const createCollection = createAsyncThunk(
  'collections/create',
  async (collection: Partial<Collection>, { rejectWithValue }) => {
    const response = await apiService.createCollection(collection);
    if (response.status === 'success' && response.data) {
      return response.data;
    }
    return rejectWithValue(response.message || 'Failed to create collection');
  }
);

export const updateCollection = createAsyncThunk(
  'collections/update',
  async ({ name, updates }: { name: string; updates: Partial<Collection> }, { rejectWithValue }) => {
    const response = await apiService.updateCollection(name, updates);
    if (response.status === 'success' && response.data) {
      return response.data;
    }
    return rejectWithValue(response.message || 'Failed to update collection');
  }
);

export const deleteCollection = createAsyncThunk(
  'collections/delete',
  async (name: string, { rejectWithValue }) => {
    const response = await apiService.deleteCollection(name);
    if (response.status === 'success') {
      return name;
    }
    return rejectWithValue(response.message || 'Failed to delete collection');
  }
);

const collectionSlice = createSlice({
  name: 'collections',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    reorderCollections: (state, action: PayloadAction<string[]>) => {
      const order = action.payload;
      state.items.sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCollections.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCollections.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCollections.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createCollection.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(createCollection.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(updateCollection.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.name === action.payload.name);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateCollection.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(deleteCollection.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.name !== action.payload);
      })
      .addCase(deleteCollection.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearError, reorderCollections } = collectionSlice.actions;
export default collectionSlice.reducer;
