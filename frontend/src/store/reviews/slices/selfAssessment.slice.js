// src/store/reviews/slices/selfAssessment.slice.js
import { createCrudSlice } from './baseSlice';
import { selfAssessmentService } from '../../../services/reviews';

const selfAssessmentSlice = createCrudSlice('selfAssessments', selfAssessmentService);

// Custom thunks
export const submitSelfAssessment = (id) => async (dispatch) => {
  try {
    const response = await selfAssessmentService.submit(id);
    dispatch(selfAssessmentSlice.actions.updateItem(response));
    return response;
  } catch (error) {
    throw error;
  }
};

export const saveSelfAssessmentDraft = (id, data) => async (dispatch) => {
  try {
    const response = await selfAssessmentService.saveDraft(id, data);
    dispatch(selfAssessmentSlice.actions.updateItem(response));
    return response;
  } catch (error) {
    throw error;
  }
};

export const fetchMySelfAssessment = () => async (dispatch) => {
  try {
    const response = await selfAssessmentService.getMy();
    dispatch(selfAssessmentSlice.actions.selectItem(response));
    return response;
  } catch (error) {
    throw error;
  }
};

export const selfAssessmentReducer = selfAssessmentSlice.slice.reducer;
export const selfAssessmentActions = selfAssessmentSlice.actions;
export const selfAssessmentThunks = selfAssessmentSlice.thunks;
export const {
  fetchAll: fetchSelfAssessments,
  fetchOne: fetchSelfAssessment,
  create: createSelfAssessment,
  update: updateSelfAssessment,
  patch: patchSelfAssessment,
  remove: deleteSelfAssessment,
} = selfAssessmentSlice.thunks;