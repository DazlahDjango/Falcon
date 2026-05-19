// src/store/reviews/slices/index.js
// Export all slices
import { combineReducers } from '@reduxjs/toolkit';
import ratingScaleReducer from './ratingScaleSlice';
import competencyReducer from './competencySlice';
import cycleReducer from './cycleSlice';
import selfAssessmentReducer from './selfAssessmentSlice';
import supervisorReviewReducer from './supervisorReviewSlice';
import finalRatingReducer from './finalRatingSlice';
import pipReducer from './pipSlice';
import feedbackReducer from './feedbackSlice';
import calibrationReducer from './calibrationSlice';
import commentReducer from './commentSlice';
import notificationReducer from './notificationSlice';

const reviewsReducer = combineReducers({
    ratingScale: ratingScaleReducer,
    competency: competencyReducer,
    cycle: cycleReducer,
    selfAssessment: selfAssessmentReducer,
    supervisorReview: supervisorReviewReducer,
    finalRating: finalRatingReducer,
    pip: pipReducer,
    feedback: feedbackReducer,
    calibration: calibrationReducer,
    comments: commentReducer,
    notifications: notificationReducer
});

export { default } from './ratingScaleSlice';
export { default as supervisorReviewReducer } from './supervisorReviewSlice';
export { default as finalRatingReducer } from './finalRatingSlice';
export { default as pipReducer } from './pipSlice';
export { default as feedbackReducer } from './feedbackSlice';
export { default as calibrationReducer } from './calibrationSlice';
export { default as commentReducer } from './commentSlice';
export { default as notificationReducer } from './notificationSlice';