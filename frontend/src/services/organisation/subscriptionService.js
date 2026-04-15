import api from './api';

export const subscriptionApi = {
  // ============================================================
  // Plans
  // ============================================================
  
  /**
   * Get all subscription plans
   */
  getPlans: () => api.get('/organisations/plans/'),
  
  /**
   * Get plan by ID
   * @param {string} id - Plan UUID
   */
  getPlanById: (id) => api.get(`/organisations/plans/${id}/`),
  
  /**
   * Get plan comparison
   */
  getPlanComparison: () => api.get('/organisations/plans/comparison/'),
  
  // ============================================================
  // Subscriptions
  // ============================================================
  
  /**
   * Get current organisation subscription
   */
  getCurrent: () => api.get('/organisations/subscriptions/current/'),
  
  /**
   * Get subscription history
   */
  getHistory: () => api.get('/organisations/subscriptions/history/'),
  
  /**
   * Get subscription by ID
   * @param {string} id - Subscription UUID
   */
  getById: (id) => api.get(`/organisations/subscriptions/${id}/`),
  
  /**
   * Create a new subscription
   * @param {Object} data - Subscription data
   */
  create: (data) => api.post('/organisations/subscriptions/', data),
  
  /**
   * Upgrade subscription plan
   * @param {string} planId - New plan ID
   */
  upgrade: (planId) => api.post('/organisations/subscriptions/upgrade/', { plan_id: planId }),
  
  /**
   * Cancel subscription
   */
  cancel: () => api.post('/organisations/subscriptions/cancel/'),
  
  /**
   * Reactivate cancelled subscription
   */
  reactivate: () => api.post('/organisations/subscriptions/reactivate/'),
  
  /**
   * Update billing cycle (monthly/yearly)
   * @param {string} cycle - 'monthly' or 'yearly'
   */
  updateBillingCycle: (cycle) => api.patch('/organisations/subscriptions/billing-cycle/', { cycle }),
  
  // ============================================================
  // Invoices
  // ============================================================
  
  /**
   * Get all invoices
   * @param {Object} params - Query parameters
   */
  getInvoices: (params) => api.get('/organisations/billing/invoices/', { params }),
  
  /**
   * Get invoice by ID
   * @param {string} id - Invoice UUID
   */
  getInvoiceById: (id) => api.get(`/organisations/billing/invoices/${id}/`),
  
  /**
   * Download invoice PDF
   * @param {string} id - Invoice UUID
   */
  downloadInvoice: (id) => api.get(`/organisations/billing/invoices/${id}/download/`, { responseType: 'blob' }),
  
  /**
   * Pay invoice
   * @param {string} id - Invoice UUID
   * @param {Object} paymentData - Payment details
   */
  payInvoice: (id, paymentData) => api.post(`/organisations/billing/invoices/${id}/pay/`, paymentData),
  
  // ============================================================
  // Payment Methods
  // ============================================================
  
  /**
   * Get all payment methods
   */
  getPaymentMethods: () => api.get('/organisations/billing/payment-methods/'),
  
  /**
   * Get payment method by ID
   * @param {string} id - Payment method ID
   */
  getPaymentMethodById: (id) => api.get(`/organisations/billing/payment-methods/${id}/`),
  
  /**
   * Add new payment method
   * @param {Object} data - Payment method data
   */
  addPaymentMethod: (data) => api.post('/organisations/billing/payment-methods/', data),
  
  /**
   * Update payment method
   * @param {string} id - Payment method ID
   * @param {Object} data - Updated data
   */
  updatePaymentMethod: (id, data) => api.patch(`/organisations/billing/payment-methods/${id}/`, data),
  
  /**
   * Remove payment method
   * @param {string} id - Payment method ID
   */
  removePaymentMethod: (id) => api.delete(`/organisations/billing/payment-methods/${id}/`),
  
  /**
   * Set default payment method
   * @param {string} id - Payment method ID
   */
  setDefaultPaymentMethod: (id) => api.post(`/organisations/billing/payment-methods/${id}/set-default/`),
  
  // ============================================================
  // Checkout
  // ============================================================
  
  /**
   * Create Stripe checkout session
   * @param {string} planId - Plan ID
   * @param {string} successUrl - Success redirect URL
   * @param {string} cancelUrl - Cancel redirect URL
   */
  createCheckoutSession: (planId, successUrl, cancelUrl) => api.post('/organisations/billing/create-checkout-session/', { 
    plan_id: planId, 
    success_url: successUrl, 
    cancel_url: cancelUrl 
  }),
  
  /**
   * Get checkout session status
   * @param {string} sessionId - Stripe session ID
   */
  getCheckoutSessionStatus: (sessionId) => api.get(`/organisations/billing/checkout-session/${sessionId}/status/`),
};