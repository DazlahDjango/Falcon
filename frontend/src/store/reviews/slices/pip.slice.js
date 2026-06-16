// src/store/reviews/slices/pip.slice.js
import { createCrudSlice } from './baseSlice';
import { pipService } from '../../../services/reviews';

const pipSlice = createCrudSlice('pips', pipService);

// Custom thunks
export const approvePIP = (id) => async (dispatch) => {
  try {
    const response = await pipService.approve(id);
    dispatch(pipSlice.actions.updateItem(response));
    return response;
  } catch (error) {
    throw error;
  }
};

export const startPIP = (id) => async (dispatch) => {
  try {
    const response = await pipService.start(id);
    dispatch(pipSlice.actions.updateItem(response));
    return response;
  } catch (error) {
    throw error;
  }
};

export const completePIP = (id, outcome, notes) => async (dispatch) => {
  try {
    const response = await pipService.complete(id, outcome, notes);
    dispatch(pipSlice.actions.updateItem(response));
    return response;
  } catch (error) {
    throw error;
  }
};

export const extendPIP = (id, newEndDate, reason) => async (dispatch) => {
  try {
    const response = await pipService.extend(id, newEndDate, reason);
    dispatch(pipSlice.actions.updateItem(response));
    return response;
  } catch (error) {
    throw error;
  }
};

export const fetchPIPProgress = (id) => async (dispatch) => {
  try {
    const response = await pipService.getProgress(id);
    dispatch(pipSlice.actions.setProgress(response));
    return response;
  } catch (error) {
    throw error;
  }
};

export const pipReducer = pipSlice.slice.reducer;
export const pipActions = pipSlice.actions;
export const pipThunks = pipSlice.thunks;