import { addNotification } from '../slice/uiSlice';

// Actions to track for audit
const AUDIT_ACTIONS = {
  // Organisation actions
  'organisation/update/fulfilled': 'Organisation updated',
  'organisation/uploadLogo/fulfilled': 'Organisation logo updated',
  'organisation/delete/fulfilled': 'Organisation deleted',
  'organisation/approve/fulfilled': 'Organisation approved',
  'organisation/suspend/fulfilled': 'Organisation suspended',
  'organisation/activate/fulfilled': 'Organisation activated',
  
  // Subscription actions
  'subscription/upgrade/fulfilled': 'Subscription plan upgraded',
  'subscription/cancel/fulfilled': 'Subscription cancelled',
  'subscription/reactivate/fulfilled': 'Subscription reactivated',
  'subscription/addPaymentMethod/fulfilled': 'Payment method added',
  'subscription/removePaymentMethod/fulfilled': 'Payment method removed',
  'subscription/setDefaultPaymentMethod/fulfilled': 'Default payment method changed',
  
  // Department actions
  'department/create/fulfilled': 'Department created',
  'department/update/fulfilled': 'Department updated',
  'department/delete/fulfilled': 'Department deleted',
  'department/move/fulfilled': 'Department moved',
  'department/setManager/fulfilled': 'Department manager assigned',
  
  // Team actions
  'team/create/fulfilled': 'Team created',
  'team/update/fulfilled': 'Team updated',
  'team/delete/fulfilled': 'Team deleted',
  'team/addMember/fulfilled': 'Team member added',
  'team/removeMember/fulfilled': 'Team member removed',
  'team/setLead/fulfilled': 'Team lead assigned',
  
  // Position actions
  'position/create/fulfilled': 'Position created',
  'position/update/fulfilled': 'Position updated',
  'position/delete/fulfilled': 'Position deleted',
  'position/updateReportingTo/fulfilled': 'Reporting structure updated',
  
  // Domain actions
  'domain/create/fulfilled': 'Domain added',
  'domain/update/fulfilled': 'Domain updated',
  'domain/delete/fulfilled': 'Domain removed',
  'domain/verify/fulfilled': 'Domain verified',
  'domain/setPrimary/fulfilled': 'Primary domain changed',
  'domain/renewSSL/fulfilled': 'SSL certificate renewed',
  
  // Branding actions
  'branding/update/fulfilled': 'Branding updated',
  'branding/uploadLogo/fulfilled': 'Logo uploaded',
  'branding/removeLogo/fulfilled': 'Logo removed',
  'branding/updateThemeColors/fulfilled': 'Theme colors updated',
  
  // User actions
  'user/invite/fulfilled': 'User invited',
  'user/update/fulfilled': 'User updated',
  'user/delete/fulfilled': 'User removed',
  'user/updateRole/fulfilled': 'User role changed',
  'user/activate/fulfilled': 'User activated',
  'user/deactivate/fulfilled': 'User deactivated',
  
  // KPI actions
  'kpi/create/fulfilled': 'KPI created',
  'kpi/update/fulfilled': 'KPI updated',
  'kpi/delete/fulfilled': 'KPI deleted',
  'kpi/submitActual/fulfilled': 'KPI actual value submitted',
  'kpi/submitForApproval/fulfilled': 'KPI submitted for approval',
  'kpi/approve/fulfilled': 'KPI approved',
  'kpi/reject/fulfilled': 'KPI rejected',
};

export const auditMiddleware = (store) => (next) => (action) => {
  const result = next(action);
  
  const actionType = action.type;
  const auditMessage = AUDIT_ACTIONS[actionType];
  
  if (auditMessage && action.payload) {
    const timestamp = new Date().toISOString();
    const user = store.getState().auth?.user;
    
    // Create audit log entry
    const auditEntry = {
      id: Date.now(),
      action: actionType.split('/')[1] || 'unknown',
      message: auditMessage,
      details: {
        payload: action.payload,
        previousState: null, // Would need to track previous state for full audit
      },
      user: user ? { id: user.id, name: user.name, email: user.email } : null,
      timestamp,
      ip_address: null, // Would need to get from request
    };
    
    // Log to console in development
    if (import.meta.env.MODE !== 'production') {
      console.log('[AUDIT]', auditEntry);
    }
    
    // Add notification for important actions
    const importantActions = [
      'organisation/update/fulfilled',
      'subscription/upgrade/fulfilled',
      'subscription/cancel/fulfilled',
      'domain/verify/fulfilled',
      'user/invite/fulfilled',
      'kpi/approve/fulfilled',
      'kpi/reject/fulfilled',
    ];
    
    if (importantActions.includes(actionType)) {
      store.dispatch(addNotification({
        title: auditMessage,
        message: `Action completed successfully`,
        type: 'success',
        read: false,
      }));
    }
    
    // In production, send to audit API
    // if (import.meta.env.MODE === 'production') {
    //   api.post('/audit/logs/', auditEntry).catch(console.error);
    // }
  }
  
  return result;
};