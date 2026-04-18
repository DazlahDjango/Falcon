import React, { useState, useEffect } from 'react';
import { settingsApi } from '../../../services/organisation';
import toast from 'react-hot-toast';

const GeneralSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    organisation_name: '',
    organisation_slug: '',
    timezone: 'UTC',
    language: 'en',
    currency: 'USD',
    date_format: 'DD/MM/YYYY',
    fiscal_year_start: 1,
    week_start_day: 'monday',
    time_format: '24h',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsApi.get();
      const data = response.data;
      setSettings(data);
      setFormData({
        organisation_name: data.organisation_name || '',
        organisation_slug: data.organisation_slug || '',
        timezone: data.timezone || 'UTC',
        language: data.language || 'en',
        currency: data.currency || 'USD',
        date_format: data.date_format || 'DD/MM/YYYY',
        fiscal_year_start: data.fiscal_year_start || 1,
        week_start_day: data.week_start_day || 'monday',
        time_format: data.time_format || '24h',
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
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
      await settingsApi.update(formData);
      toast.success('General settings saved successfully');
      fetchSettings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const timezones = [
    { value: 'UTC', label: 'UTC (Universal Time)' },
    { value: 'Africa/Nairobi', label: 'Nairobi (EAT)' },
    { value: 'America/New_York', label: 'New York (EST/EDT)' },
    { value: 'America/Los_Angeles', label: 'Los Angeles (PST/PDT)' },
    { value: 'Europe/London', label: 'London (GMT/BST)' },
    { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
    { value: 'Asia/Dubai', label: 'Dubai (GST)' },
    { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { value: 'Australia/Sydney', label: 'Sydney (AEDT/AEST)' },
  ];

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'French' },
    { value: 'es', label: 'Spanish' },
    { value: 'de', label: 'German' },
    { value: 'it', label: 'Italian' },
    { value: 'pt', label: 'Portuguese' },
    { value: 'nl', label: 'Dutch' },
    { value: 'sw', label: 'Swahili' },
    { value: 'ar', label: 'Arabic' },
    { value: 'zh', label: 'Chinese' },
    { value: 'ja', label: 'Japanese' },
    { value: 'ko', label: 'Korean' },
  ];

  const currencies = [
    { value: 'USD', label: 'USD - US Dollar', symbol: '$' },
    { value: 'EUR', label: 'EUR - Euro', symbol: '€' },
    { value: 'GBP', label: 'GBP - British Pound', symbol: '£' },
    { value: 'KES', label: 'KES - Kenyan Shilling', symbol: 'KSh' },
    { value: 'NGN', label: 'NGN - Nigerian Naira', symbol: '₦' },
    { value: 'ZAR', label: 'ZAR - South African Rand', symbol: 'R' },
    { value: 'AED', label: 'AED - UAE Dirham', symbol: 'د.إ' },
    { value: 'SAR', label: 'SAR - Saudi Riyal', symbol: '﷼' },
    { value: 'INR', label: 'INR - Indian Rupee', symbol: '₹' },
    { value: 'CNY', label: 'CNY - Chinese Yuan', symbol: '¥' },
    { value: 'JPY', label: 'JPY - Japanese Yen', symbol: '¥' },
    { value: 'AUD', label: 'AUD - Australian Dollar', symbol: 'A$' },
    { value: 'CAD', label: 'CAD - Canadian Dollar', symbol: 'C$' },
    { value: 'CHF', label: 'CHF - Swiss Franc', symbol: 'Fr' },
  ];

  const dateFormats = [
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (31/12/2024)', example: '31/12/2024' },
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (12/31/2024)', example: '12/31/2024' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2024-12-31)', example: '2024-12-31' },
    { value: 'DD-MM-YYYY', label: 'DD-MM-YYYY (31-12-2024)', example: '31-12-2024' },
    { value: 'MM-DD-YYYY', label: 'MM-DD-YYYY (12-31-2024)', example: '12-31-2024' },
  ];

  const weekStartDays = [
    { value: 'monday', label: 'Monday' },
    { value: 'sunday', label: 'Sunday' },
    { value: 'saturday', label: 'Saturday' },
  ];

  const timeFormats = [
    { value: '12h', label: '12-hour (12:00 PM)' },
    { value: '24h', label: '24-hour (14:00)' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">General Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configure your organisation's regional and display preferences
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Regional Settings */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-medium text-gray-900">Regional Settings</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Timezone
                </label>
                <select
                  name="timezone"
                  value={formData.timezone}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {timezones.map(tz => (
                    <option key={tz.value} value={tz.value}>{tz.label}</option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  All dates and times will be displayed in this timezone
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Default Language
                </label>
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {languages.map(lang => (
                    <option key={lang.value} value={lang.value}>{lang.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Default Currency
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {currencies.map(curr => (
                    <option key={curr.value} value={curr.value}>{curr.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date Format
                </label>
                <select
                  name="date_format"
                  value={formData.date_format}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {dateFormats.map(format => (
                    <option key={format.value} value={format.value}>{format.label}</option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Example: {dateFormats.find(f => f.value === formData.date_format)?.example}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Week Starts On
                </label>
                <select
                  name="week_start_day"
                  value={formData.week_start_day}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {weekStartDays.map(day => (
                    <option key={day.value} value={day.value}>{day.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Time Format
                </label>
                <select
                  name="time_format"
                  value={formData.time_format}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {timeFormats.map(format => (
                    <option key={format.value} value={format.value}>{format.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Fiscal Settings */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-medium text-gray-900">Fiscal Settings</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Fiscal Year Start Month
                </label>
                <select
                  name="fiscal_year_start"
                  value={formData.fiscal_year_start}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                    <option key={month} value={month}>
                      {new Date(2000, month - 1, 1).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Determines when your financial year begins
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GeneralSettings;