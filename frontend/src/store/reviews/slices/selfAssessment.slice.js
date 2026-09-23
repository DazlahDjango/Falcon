// src/store/reviews/slices/selfAssessment.slice.js
import { createCrudSlice } from './baseSlice';
import { selfAssessmentService } from '../../../services/reviews';

// Create the slice with custom state
const selfAssessmentSlice = createCrudSlice('selfAssessments', selfAssessmentService, {
  initialState: {
    stats: null,
  },
  reducers: {
    setStats: (state, action) => {
      state.stats = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

// ===== Custom thunks =====
export const submitSelfAssessment = (idOrObj) => async (dispatch) => {
  try {
    dispatch(selfAssessmentSlice.actions.clearErrors());
    dispatch(selfAssessmentSlice.actions.setLoading(true));
    const id = typeof idOrObj === 'object' && idOrObj !== null ? idOrObj.id : idOrObj;
    const response = await selfAssessmentService.submit(id);
    dispatch(selfAssessmentSlice.actions.updateItem(response));
    dispatch(selfAssessmentSlice.actions.selectItem(response));
    dispatch(selfAssessmentSlice.actions.setLoading(false));
    return response;
  } catch (error) {
    const errorMsg = error.response?.data?.detail || error.response?.data?.error || error.message || 'Failed to submit self assessment';
    dispatch(selfAssessmentSlice.actions.setError(errorMsg));
    throw error;
  }
};

export const saveSelfAssessmentDraft = (idOrObj, maybeData) => async (dispatch) => {
  try {
    const id = typeof idOrObj === 'object' && idOrObj !== null ? idOrObj.id : idOrObj;
    const data = typeof idOrObj === 'object' && idOrObj !== null ? idOrObj.data : maybeData;
    const response = await selfAssessmentService.saveDraft(id, data);
    dispatch(selfAssessmentSlice.actions.updateItem(response));
    dispatch(selfAssessmentSlice.actions.selectItem(response));
    return response;
  } catch (error) {
    throw error;
  }
};

export const resetSelfAssessmentToDraft = (idOrObj) => async (dispatch) => {
  try {
    dispatch(selfAssessmentSlice.actions.clearErrors());
    const id = typeof idOrObj === 'object' && idOrObj !== null ? idOrObj.id : idOrObj;
    const response = await selfAssessmentService.resetToDraft(id);
    dispatch(selfAssessmentSlice.actions.updateItem(response));
    dispatch(selfAssessmentSlice.actions.selectItem(response));
    return response;
  } catch (error) {
    const errorMsg = error.response?.data?.detail || error.response?.data?.error || error.message || 'Failed to reset self assessment';
    dispatch(selfAssessmentSlice.actions.setError(errorMsg));
    throw error;
  }
};

export const softDeleteSelfAssessment = (id) => async (dispatch) => {
  try {
    const response = await selfAssessmentService.softDelete(id);
    dispatch(selfAssessmentSlice.actions.removeItem(id));
    return response;
  } catch (error) {
    throw error;
  }
};

export const restoreSelfAssessment = (id) => async (dispatch) => {
  try {
    const response = await selfAssessmentService.restore(id);
    dispatch(selfAssessmentSlice.actions.updateItem(response));
    return response;
  } catch (error) {
    throw error;
  }
};

export const fetchMySelfAssessment = () => async (dispatch) => {
  try {
    dispatch(selfAssessmentSlice.actions.clearErrors());
    dispatch(selfAssessmentSlice.actions.setLoading(true));
    const response = await selfAssessmentService.getMy();
    if (response && response.id) {
      dispatch(selfAssessmentSlice.actions.selectItem(response));
    } else if (response && response.message) {
      dispatch(selfAssessmentSlice.actions.clearSelected());
    } else if (response) {
      dispatch(selfAssessmentSlice.actions.selectItem(response));
    }
    dispatch(selfAssessmentSlice.actions.setLoading(false));
    return response;
  } catch (error) {
    const errorMsg = error.response?.data?.detail || error.response?.data?.error || error.message || 'Failed to fetch self assessment';
    dispatch(selfAssessmentSlice.actions.setError(errorMsg));
    throw error;
  }
};

export const fetchSelfAssessmentStats = (cycleId) => async (dispatch) => {
  try {
    const response = await selfAssessmentService.getStats(cycleId);
    dispatch(selfAssessmentSlice.actions.setStats(response));
    return response;
  } catch (error) {
    throw error;
  }
};

// ===== ADD THIS: Export reset action =====
export const resetSelfAssessmentState = selfAssessmentSlice.actions.resetState;
export const clearSelfAssessmentErrors = selfAssessmentSlice.actions.clearErrors;

// ===== Exports =====
export const selfAssessmentReducer = selfAssessmentSlice.slice.reducer;
export default selfAssessmentReducer;
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