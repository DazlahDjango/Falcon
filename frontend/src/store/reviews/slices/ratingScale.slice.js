// src/store/reviews/slices/ratingScale.slice.js
import { createCrudSlice } from './baseSlice';
import { ratingScaleService } from '../../../services/reviews';

const ratingScaleSlice = createCrudSlice('ratingScales', ratingScaleService, {
  transformResponse: (data) => data.results || data,
});

// ===== Custom thunks for rating scale actions =====
export const activateRatingScale = (id) => async (dispatch) => {
  try {
    const response = await ratingScaleService.activate(id);
    dispatch(ratingScaleSlice.actions.updateItem(response));
    return response;
  } catch (error) {
    throw error;
  }
};

export const deactivateRatingScale = (id) => async (dispatch) => {
  try {
    const response = await ratingScaleService.deactivate(id);
    dispatch(ratingScaleSlice.actions.updateItem(response));
    return response;
  } catch (error) {
    throw error;
  }
};

export const setDefaultRatingScale = (id) => async (dispatch) => {
  try {
    const response = await ratingScaleService.setDefault(id);
    dispatch(ratingScaleSlice.actions.updateItem(response));
    return response;
  } catch (error) {
    throw error;
  }
};

export const convertScore = (ratingScaleId, score, fromType, toType) => async (dispatch) => {
  try {
    const response = await ratingScaleService.convertScore(ratingScaleId, score, fromType, toType);
    return response;
  } catch (error) {
    throw error;
  }
};

export const fetchActiveRatingScales = () => async (dispatch) => {
  try {
    const response = await ratingScaleService.getActiveScales();
    return response;
  } catch (error) {
    throw error;
  }
};

export const fetchDefaultRatingScale = () => async (dispatch) => {
  try {
    const response = await ratingScaleService.getDefault();
    return response;
  } catch (error) {
    throw error;
  }
};

// ===== ADD THIS: Export reset action =====
export const resetRatingScaleState = ratingScaleSlice.actions.resetState;
export const setRatingScaleFilters = ratingScaleSlice.actions.setFilters;
export const clearRatingScaleFilters = ratingScaleSlice.actions.clearFilters;
export const setRatingScalePagination = ratingScaleSlice.actions.setPagination;

// ===== Exports =====
export const ratingScaleReducer = ratingScaleSlice.slice.reducer;
export default ratingScaleReducer;
export const ratingScaleActions = ratingScaleSlice.actions;
export const ratingScaleThunks = ratingScaleSlice.thunks;
export const {
  fetchAll: fetchRatingScales,
  fetchOne: fetchRatingScale,
  create: createRatingScale,
  update: updateRatingScale,
  patch: patchRatingScale,
  remove: deleteRatingScale,
} = ratingScaleSlice.thunks;