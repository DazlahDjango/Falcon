import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userApi } from '../../../services/organisations/userService';

export const fetchOrgUsers = createAsyncThunk(
  'orgUser/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await userApi.getAll(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch users');
    }
  }
);

// Alias for backward compatibility
export const fetchOrganisationUsers = fetchOrgUsers;

const orgUserSlice = createSlice({
  name: 'orgUser',
  initialState: {
    users: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearUserError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrgUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOrgUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
        state.error = null;
      })
      .addCase(fetchOrgUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearUserError } = orgUserSlice.actions;
export default orgUserSlice.reducer;
