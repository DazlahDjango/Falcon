import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { brandingApi } from '../../../services/organisation/brandingService';

// ============================================================
// Async Thunks
// ============================================================

/**
 * Fetch branding
 */
export const fetchBranding = createAsyncThunk(
  'branding/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await brandingApi.get();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch branding');
    }
  }
);

/**
 * Update branding
 */
export const updateBranding = createAsyncThunk(
  'branding/update',
  async (data, { rejectWithValue }) => {
    try {
      const response = await brandingApi.update(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update branding');
    }
  }
);

/**
 * Upload logo
 */
export const uploadLogo = createAsyncThunk(
  'branding/uploadLogo',
  async (file, { rejectWithValue }) => {
    try {
      const response = await brandingApi.uploadLogo(file);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload logo');
    }
  }
);

/**
 * Remove logo
 */
export const removeLogo = createAsyncThunk(
  'branding/removeLogo',
  async (_, { rejectWithValue }) => {
    try {
      await brandingApi.removeLogo();
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove logo');
    }
  }
);

/**
 * Upload favicon
 */
export const uploadFavicon = createAsyncThunk(
  'branding/uploadFavicon',
  async (file, { rejectWithValue }) => {
    try {
      const response = await brandingApi.uploadFavicon(file);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload favicon');
    }
  }
);

/**
 * Remove favicon
 */
export const removeFavicon = createAsyncThunk(
  'branding/removeFavicon',
  async (_, { rejectWithValue }) => {
    try {
      await brandingApi.removeFavicon();
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove favicon');
    }
  }
);

/**
 * Update theme colors
 */
export const updateThemeColors = createAsyncThunk(
  'branding/updateThemeColors',
  async (colors, { rejectWithValue }) => {
    try {
      const response = await brandingApi.updateThemeColors(colors);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update theme colors');
    }
  }
);

// ============================================================
// Initial State
// ============================================================

const initialState = {
  branding: {
    primary_color: '#3B82F6',
    secondary_color: '#10B981',
    accent_color: '#F59E0B',
    font_family: 'Inter',
    is_white_labeled: false,
    powered_by_falcon: true,
    logo_url: null,
    favicon_url: null,
    custom_css: null,
  },
  loading: false,
  error: null,
};

// ============================================================
// Slice
// ============================================================

const brandingSlice = createSlice({
  name: 'branding',
  initialState,
  reducers: {
    clearBrandingError: (state) => {
      state.error = null;
    },
    resetBranding: (state) => {
      state.branding = initialState.branding;
    },
    clearBranding: (state) => {
      state.branding = initialState.branding;
    },
  },
  extraReducers: (builder) => {
    builder
      // ============================================================
      // fetchBranding
      // ============================================================
      .addCase(fetchBranding.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBranding.fulfilled, (state, action) => {
        state.loading = false;
        state.branding = { ...state.branding, ...action.payload };
      })
      .addCase(fetchBranding.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // ============================================================
      // updateBranding
      // ============================================================
      .addCase(updateBranding.fulfilled, (state, action) => {
        state.branding = { ...state.branding, ...action.payload };
      })
      
      // ============================================================
      // uploadLogo
      // ============================================================
      .addCase(uploadLogo.fulfilled, (state, action) => {
        state.branding.logo_url = action.payload.logo_url;
      })
      
      // ============================================================
      // removeLogo
      // ============================================================
      .addCase(removeLogo.fulfilled, (state) => {
        state.branding.logo_url = null;
      })
      
      // ============================================================
      // uploadFavicon
      // ============================================================
      .addCase(uploadFavicon.fulfilled, (state, action) => {
        state.branding.favicon_url = action.payload.favicon_url;
      })
      
      // ============================================================
      // removeFavicon
      // ============================================================
      .addCase(removeFavicon.fulfilled, (state) => {
        state.branding.favicon_url = null;
      })
      
      // ============================================================
      // updateThemeColors
      // ============================================================
      .addCase(updateThemeColors.fulfilled, (state, action) => {
        state.branding = { ...state.branding, ...action.payload };
      });
  },
});

// ============================================================
// Actions & Reducer
// ============================================================

export const { clearBrandingError, resetBranding, clearBranding } = brandingSlice.actions;
export default brandingSlice.reducer;