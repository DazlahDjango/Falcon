// src/store/reviews/slices/cycle.slice.js
import { createCrudSlice } from './baseSlice';
import { reviewCycleService } from '../../../services/reviews';

const initialState = {
  activeCycle: null,
  currentCycle: null,
  progress: null,
  participants: [],
  summary: null,
};

const cycleSlice = createCrudSlice('cycles', reviewCycleService, {
  initialState,
  extraReducers: {
    // Custom thunks will be added here
  },
});

// Custom thunks for cycle-specific actions
export const fetchActiveCycle = () => async (dispatch) => {
  try {
    const response = await reviewCycleService.getActive();
    dispatch(cycleSlice.actions.setActiveCycle(response));
    return response;
  } catch (error) {
    throw error;
  }
};

export const fetchCycleProgress = (id) => async (dispatch) => {
  try {
    const response = await reviewCycleService.getProgress(id);
    dispatch(cycleSlice.actions.setProgress(response));
    return response;
  } catch (error) {
    throw error;
  }
};

export const activateCycle = (id) => async (dispatch) => {
  try {
    const response = await reviewCycleService.activate(id);
    dispatch(cycleSlice.actions.updateItem(response));
    return response;
  } catch (error) {
    throw error;
  }
};

export const completeCycle = (id) => async (dispatch) => {
  try {
    const response = await reviewCycleService.complete(id);
    dispatch(cycleSlice.actions.updateItem(response));
    return response;
  } catch (error) {
    throw error;
  }
};

export const archiveCycle = (id) => async (dispatch) => {
  try {
    const response = await reviewCycleService.archive(id);
    dispatch(cycleSlice.actions.updateItem(response));
    return response;
  } catch (error) {
    throw error;
  }
};

export const cycleReducer = cycleSlice.slice.reducer;
export const cycleActions = cycleSlice.actions;
export const cycleThunks = cycleSlice.thunks;
export const {
  fetchAll: fetchCycles,
  fetchOne: fetchCycle,
  create: createCycle,
  update: updateCycle,
  patch: patchCycle,
  remove: deleteCycle,
} = cycleSlice.thunks;