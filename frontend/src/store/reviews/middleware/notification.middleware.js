// src/store/reviews/middleware/notification.middleware.js
import { notificationActions } from '../slices';

const NOTIFICATION_ACTIONS = {
  'cycles/activate/fulfilled': 'Review cycle has been activated',
  'cycles/complete/fulfilled': 'Review cycle has been completed',
  'selfAssessments/submit/fulfilled': 'Self assessment submitted successfully',
  'supervisorReviews/approve/fulfilled': 'Review approved successfully',
  'finalRatings/lock/fulfilled': 'Final rating locked successfully',
  'pips/approve/fulfilled': 'PIP approved successfully',
  'pips/complete/fulfilled': 'PIP completed successfully',
  'promotions/approve/fulfilled': 'Promotion approved successfully',
  'feedbackSummaries/share/fulfilled': 'Feedback summary shared successfully',
};

export const notificationMiddleware = (store) => (next) => (action) => {
  const result = next(action);
  
  const message = NOTIFICATION_ACTIONS[action.type];
  if (message && action.payload) {
    store.dispatch(notificationActions.addNotification({
      message,
      type: 'success',
      timestamp: new Date().toISOString(),
      data: action.payload,
    }));
  }
  
  return result;
};