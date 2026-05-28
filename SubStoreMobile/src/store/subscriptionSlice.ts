import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Subscription, FlowInfo } from '../types';
import apiService from '../services/api';

interface SubscriptionState {
  items: Subscription[];
  loading: boolean;
  error: string | null;
  flowInfo: Record<string, FlowInfo>;
}

const initialState: SubscriptionState = {
  items: [],
  loading: false,
  error: null,
  flowInfo: {},
};

export const fetchSubscriptions = createAsyncThunk(
  'subscriptions/fetchAll',
  async (_, { rejectWithValue }) => {
    const response = await apiService.getAllSubscriptions();
    if (response.status === 'success' && response.data) {
      return response.data;
    }
    return rejectWithValue(response.message || 'Failed to fetch subscriptions');
  }
);

export const createSubscription = createAsyncThunk(
  'subscriptions/create',
  async (sub: Partial<Subscription>, { rejectWithValue }) => {
    const response = await apiService.createSubscription(sub);
    if (response.status === 'success' && response.data) {
      return response.data;
    }
    return rejectWithValue(response.message || 'Failed to create subscription');
  }
);

export const updateSubscription = createAsyncThunk(
  'subscriptions/update',
  async ({ name, updates }: { name: string; updates: Partial<Subscription> }, { rejectWithValue }) => {
    const response = await apiService.updateSubscription(name, updates);
    if (response.status === 'success' && response.data) {
      return response.data;
    }
    return rejectWithValue(response.message || 'Failed to update subscription');
  }
);

export const deleteSubscription = createAsyncThunk(
  'subscriptions/delete',
  async (name: string, { rejectWithValue }) => {
    const response = await apiService.deleteSubscription(name);
    if (response.status === 'success') {
      return name;
    }
    return rejectWithValue(response.message || 'Failed to delete subscription');
  }
);

export const fetchFlowInfo = createAsyncThunk(
  'subscriptions/fetchFlow',
  async (name: string, { rejectWithValue }) => {
    const response = await apiService.getFlowInfo(name);
    if (response.status === 'success' && response.data) {
      return { name, flowInfo: response.data };
    }
    return rejectWithValue(response.message || 'Failed to fetch flow info');
  }
);

const subscriptionSlice = createSlice({
  name: 'subscriptions',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    reorderSubscriptions: (state, action: PayloadAction<string[]>) => {
      const order = action.payload;
      state.items.sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscriptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubscriptions.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchSubscriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createSubscription.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(createSubscription.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(updateSubscription.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.name === action.payload.name);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateSubscription.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(deleteSubscription.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.name !== action.payload);
      })
      .addCase(deleteSubscription.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(fetchFlowInfo.fulfilled, (state, action) => {
        state.flowInfo[action.payload.name] = action.payload.flowInfo;
      });
  },
});

export const { clearError, reorderSubscriptions } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
