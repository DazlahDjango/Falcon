import React, { useState, useEffect } from 'react';
import { subscriptionApi, settingsApi } from '../../../services/organisation';
import toast from 'react-hot-toast';

const BillingSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [formData, setFormData] = useState({
    billing_email: '',
    billing_phone: '',
    billing_address: '',
    billing_city: '',
    billing_country: '',
    billing_zip: '',
    vat_number: '',
    tax_rate: 0,
    invoice_currency: 'USD',
    invoice_notes: '',
  });
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      const [subRes, invoicesRes, paymentRes, settingsRes] = await Promise.all([
        subscriptionApi.getCurrent(),
        subscriptionApi.getInvoices(),
        subscriptionApi.getPaymentMethods(),
        settingsApi.getBilling(),
      ]);
      
      setSubscription(subRes.data);
      setInvoices(invoicesRes.data.results || invoicesRes.data || []);
      setPaymentMethods(paymentRes.data.results || paymentRes.data || []);
      
      const billingData = settingsRes.data;
      setFormData({
        billing_email: billingData.billing_email || '',
        billing_phone: billingData.billing_phone || '',
        billing_address: billingData.billing_address || '',
        billing_city: billingData.billing_city || '',
        billing_country: billingData.billing_country || '',
        billing_zip: billingData.billing_zip || '',
        vat_number: billingData.vat_number || '',
        tax_rate: billingData.tax_rate || 0,
        invoice_currency: billingData.invoice_currency || 'USD',
        invoice_notes: billingData.invoice_notes || '',
      });
    } catch (error) {
      console.error('Error fetching billing data:', error);
      toast.error('Failed to load billing data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await settingsApi.updateBilling(formData);
      toast.success('Billing settings saved successfully');
      fetchBillingData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadInvoice = async (invoiceId) => {
    try {
      const response = await subscriptionApi.downloadInvoice(invoiceId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Invoice downloaded');
    } catch (error) {
      toast.error('Failed to download invoice');
    }
  };

  const handleAddPaymentMethod = async (paymentData) => {
    try {
      await subscriptionApi.addPaymentMethod(paymentData);
      toast.success('Payment method added successfully');
      setShowAddPaymentModal(false);
      fetchBillingData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add payment method');
    }
  };

  const handleRemovePaymentMethod = async (methodId) => {
    if (!confirm('Are you sure you want to remove this payment method?')) return;
    try {
      await subscriptionApi.removePaymentMethod(methodId);
      toast.success('Payment method removed');
      fetchBillingData();
    } catch (error) {
      toast.error('Failed to remove payment method');
    }
  };

  const handleSetDefaultPaymentMethod = async (methodId) => {
    try {
      await subscriptionApi.setDefaultPaymentMethod(methodId);
      toast.success('Default payment method updated');
      fetchBillingData();
    } catch (error) {
      toast.error('Failed to update default payment method');
    }
  };

  const currencies = [
    { value: 'USD', label: 'USD - US Dollar', symbol: '$' },
    { value: 'EUR', label: 'EUR - Euro', symbol: '€' },
    { value: 'GBP', label: 'GBP - British Pound', symbol: '£' },
    { value: 'KES', label: 'KES - Kenyan Shilling', symbol: 'KSh' },
    { value: 'NGN', label: 'NGN - Nigerian Naira', symbol: '₦' },
    { value: 'ZAR', label: 'ZAR - South African Rand', symbol: 'R' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Billing Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your billing information, payment methods, and invoices
        </p>
      </div>

      <div className="space-y-6">
        {/* Current Subscription */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-medium text-gray-900">Current Subscription</h2>
          </div>
          <div className="p-6">
            {subscription ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Plan</dt>
                  <dd className="mt-1 text-xl font-bold text-gray-900">
                    {subscription.plan_name || subscription.plan_type}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1">
                    <span className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${
                      subscription.status === 'active' ? 'bg-green-100 text-green-800' :
                      subscription.status === 'trialing' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {subscription.status}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Next Billing Date</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {subscription.end_date ? new Date(subscription.end_date).toLocaleDateString() : 'N/A'}
                  </dd>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No active subscription</p>
            )}
          </div>
        </div>

        {/* Billing Information Form */}
        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-medium text-gray-900">Billing Information</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Billing Email
                </label>
                <input
                  type="email"
                  name="billing_email"
                  value={formData.billing_email}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="billing@example.com"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Invoices will be sent to this email
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Billing Phone
                </label>
                <input
                  type="tel"
                  name="billing_phone"
                  value={formData.billing_phone}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Billing Address
                </label>
                <input
                  type="text"
                  name="billing_address"
                  value={formData.billing_address}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Street address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  City
                </label>
                <input
                  type="text"
                  name="billing_city"
                  value={formData.billing_city}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Country
                </label>
                <input
                  type="text"
                  name="billing_country"
                  value={formData.billing_country}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  ZIP / Postal Code
                </label>
                <input
                  type="text"
                  name="billing_zip"
                  value={formData.billing_zip}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  VAT Number
                </label>
                <input
                  type="text"
                  name="vat_number"
                  value={formData.vat_number}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  name="tax_rate"
                  value={formData.tax_rate}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  max="100"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Invoice Currency
                </label>
                <select
                  name="invoice_currency"
                  value={formData.invoice_currency}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {currencies.map(curr => (
                    <option key={curr.value} value={curr.value}>{curr.label}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Invoice Notes
                </label>
                <textarea
                  name="invoice_notes"
                  value={formData.invoice_notes}
                  onChange={handleChange}
                  rows="3"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Additional notes to appear on invoices"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Billing Information'}
              </button>
            </div>
          </div>
        </form>

        {/* Payment Methods */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Payment Methods</h2>
            <button
              onClick={() => setShowAddPaymentModal(true)}
              className="text-sm text-indigo-600 hover:text-indigo-900"
            >
              + Add Payment Method
            </button>
          </div>
          <div className="p-6">
            {paymentMethods.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No payment methods added</p>
            ) : (
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xl">
                        {method.brand === 'visa' ? '💳' : method.brand === 'mastercard' ? '💳' : '🏦'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {method.brand} •••• {method.last4}
                        </p>
                        <p className="text-xs text-gray-500">
                          Expires {method.expiry_month}/{method.expiry_year}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {!method.is_default && (
                        <button
                          onClick={() => handleSetDefaultPaymentMethod(method.id)}
                          className="text-xs text-indigo-600 hover:text-indigo-900"
                        >
                          Set Default
                        </button>
                      )}
                      {method.is_default && (
                        <span className="text-xs text-green-600">Default</span>
                      )}
                      <button
                        onClick={() => handleRemovePaymentMethod(method.id)}
                        className="text-xs text-red-600 hover:text-red-900"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Invoice History */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-medium text-gray-900">Invoice History</h2>
          </div>
          <div className="overflow-x-auto">
            {invoices.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No invoices yet</p>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{invoice.invoice_number}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(invoice.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {invoice.amount} {invoice.currency}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${
                          invoice.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleDownloadInvoice(invoice.id)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Download PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Add Payment Method Modal */}
      {showAddPaymentModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Add Payment Method</h2>
              <button onClick={() => setShowAddPaymentModal(false)} className="text-gray-400 hover:text-gray-500 text-2xl">×</button>
            </div>
            {/* Payment form would go here - using Stripe Elements or similar */}
            <div className="bg-gray-100 p-4 rounded-md text-center">
              <p className="text-gray-500">Payment form integration (Stripe/PayPal)</p>
              <p className="text-xs text-gray-400 mt-2">This would integrate with Stripe Elements or similar payment provider</p>
            </div>
            <div className="flex justify-end mt-4">
              <button onClick={() => setShowAddPaymentModal(false)} className="px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingSettings;