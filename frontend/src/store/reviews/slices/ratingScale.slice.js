// src/store/reviews/slices/ratingScale.slice.js
import { createCrudSlice } from './baseSlice';
import { ratingScaleService } from '../../../services/reviews';

const ratingScaleSlice = createCrudSlice('ratingScales', ratingScaleService, {
  transformResponse: (data) => data.results || data,
});

export const ratingScaleReducer = ratingScaleSlice.slice.reducer;
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