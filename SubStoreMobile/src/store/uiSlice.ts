import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  activeTab: string;
  showAddModal: boolean;
  showEditModal: boolean;
  showPreviewModal: boolean;
  selectedSubscription: string | null;
  selectedCollection: string | null;
  previewContent: string | null;
  refreshing: boolean;
  searchQuery: string;
  filterType: string | null;
}

const initialState: UIState = {
  activeTab: 'subscriptions',
  showAddModal: false,
  showEditModal: false,
  showPreviewModal: false,
  selectedSubscription: null,
  selectedCollection: null,
  previewContent: null,
  refreshing: false,
  searchQuery: '',
  filterType: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTab = action.payload;
    },
    setShowAddModal: (state, action: PayloadAction<boolean>) => {
      state.showAddModal = action.payload;
    },
    setShowEditModal: (state, action: PayloadAction<boolean>) => {
      state.showEditModal = action.payload;
    },
    setShowPreviewModal: (state, action: PayloadAction<boolean>) => {
      state.showPreviewModal = action.payload;
    },
    setSelectedSubscription: (state, action: PayloadAction<string | null>) => {
      state.selectedSubscription = action.payload;
    },
    setSelectedCollection: (state, action: PayloadAction<string | null>) => {
      state.selectedCollection = action.payload;
    },
    setPreviewContent: (state, action: PayloadAction<string | null>) => {
      state.previewContent = action.payload;
    },
    setRefreshing: (state, action: PayloadAction<boolean>) => {
      state.refreshing = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setFilterType: (state, action: PayloadAction<string | null>) => {
      state.filterType = action.payload;
    },
  },
});

export const {
  setActiveTab,
  setShowAddModal,
  setShowEditModal,
  setShowPreviewModal,
  setSelectedSubscription,
  setSelectedCollection,
  setPreviewContent,
  setRefreshing,
  setSearchQuery,
  setFilterType,
} = uiSlice.actions;

export default uiSlice.reducer;
