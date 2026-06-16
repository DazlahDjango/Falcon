// src/store/reviews/middleware/audit.middleware.js
import { reviewsApiClient } from '../../../services/reviews';

const AUDIT_ACTIONS = [
  'create',
  'update',
  'patch',
  'delete',
  'approve',
  'reject',
  'submit',
  'lock',
  'calibrate',
  'activate',
  'deactivate',
];

export const auditMiddleware = (store) => (next) => (action) => {
  const result = next(action);
  
  // Check if action should be audited
  const actionType = action.type;
  const shouldAudit = AUDIT_ACTIONS.some((actionName) => 
    actionType.toLowerCase().includes(actionName)
  );
  
  if (shouldAudit && action.payload) {
    try {
      // Log to audit trail
      const auditData = {
        action: actionType,
        payload: action.payload,
        timestamp: new Date().toISOString(),
        userId: store.getState().auth?.user?.id,
        tenantId: store.getState().tenant?.id,
      };
      
      // Send to backend audit endpoint
      reviewsApiClient.post('/audit-logs/', auditData).catch(() => {
        // Silently fail - don't break the app
      });
    } catch (error) {
      // Silently fail
    }
  }
  
  return result;
};