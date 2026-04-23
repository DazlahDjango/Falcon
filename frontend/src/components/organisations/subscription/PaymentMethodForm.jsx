import React, { useState } from 'react';
import { subscriptionApi } from '../../../services/organisations';
import toast from 'react-hot-toast';

const PaymentMethodForm = ({ onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiryMonth: '',
    expiryYear: '',
    cvc: '',
  });

  const handleChange = (e) => {
    setCardDetails({
      ...cardDetails,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // In production, use Stripe Elements or similar
      // This is a placeholder for the API call
      await subscriptionApi.addPaymentMethod(cardDetails);
      toast.success('Payment method added successfully');
      onSuccess?.();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add payment method');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Add Payment Method</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Card Number
          </label>
          <input
            type="text"
            name="cardNumber"
            placeholder="1234 5678 9012 3456"
            value={cardDetails.cardNumber}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Name on Card
          </label>
          <input
            type="text"
            name="cardName"
            placeholder="John Doe"
            value={cardDetails.cardName}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Expiry Month
            </label>
            <select
              name="expiryMonth"
              value={cardDetails.expiryMonth}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Month</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                <option key={month} value={month}>
                  {month.toString().padStart(2, '0')}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Expiry Year
            </label>
            <select
              name="expiryYear"
              value={cardDetails.expiryYear}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Year</option>
              {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            CVC
          </label>
          <input
            type="text"
            name="cvc"
            placeholder="123"
            value={cardDetails.cvc}
            onChange={handleChange}
            required
            className="mt-1 block w-32 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Add Payment Method'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentMethodForm;