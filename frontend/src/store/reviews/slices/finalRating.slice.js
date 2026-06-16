// src/store/reviews/slices/finalRating.slice.js
import { createCrudSlice } from './baseSlice';
import { finalRatingService } from '../../../services/reviews';

const finalRatingSlice = createCrudSlice('finalRatings', finalRatingService);

// Custom thunks
export const approveFinalRating = (id, notes) => async (dispatch) => {
  try {
    const response = await finalRatingService.approve(id, notes);
    dispatch(finalRatingSlice.actions.updateItem(response));
    return response;
  } catch (error) {
    throw error;
  }
};

export const lockFinalRating = (id) => async (dispatch) => {
  try {
    const response = await finalRatingService.lock(id);
    dispatch(finalRatingSlice.actions.updateItem(response));
    return response;
  } catch (error) {
    throw error;
  }
};

export const calibrateFinalRating = (id, adjustedScore, reason) => async (dispatch) => {
  try {
    const response = await finalRatingService.calibrate(id, adjustedScore, reason);
    dispatch(finalRatingSlice.actions.updateItem(response));
    return response;
  } catch (error) {
    throw error;
  }
};

export const fetchRatingDistribution = (cycleId) => async (dispatch) => {
  try {
    const response = await finalRatingService.getDistribution(cycleId);
    dispatch(finalRatingSlice.actions.setDistribution(response));
    return response;
  } catch (error) {
    throw error;
  }
};

export const finalRatingReducer = finalRatingSlice.slice.reducer;
export const finalRatingActions = finalRatingSlice.actions;
export const finalRatingThunks = finalRatingSlice.thunks;