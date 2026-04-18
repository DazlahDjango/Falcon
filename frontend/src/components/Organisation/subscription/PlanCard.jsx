import React from 'react';

const PlanCard = ({ plan, isCurrent, onUpgrade, onDowngrade }) => {
  const getPriceText = () => {
    if (plan.price_monthly === 0 && plan.price_yearly === 0) return 'Free';
    if (plan.price_monthly > 0) return `$${plan.price_monthly}/month`;
    return `$${plan.price_yearly}/year`;
  };

  const getYearlyDiscount = () => {
    if (plan.price_monthly > 0 && plan.price_yearly > 0) {
      const monthlyTotal = plan.price_monthly * 12;
      const discount = ((monthlyTotal - plan.price_yearly) / monthlyTotal) * 100;
      return Math.round(discount);
    }
    return 0;
  };

  return (
    <div className={`border rounded-lg p-6 transition-all ${
      isCurrent 
        ? 'border-indigo-500 ring-2 ring-indigo-500 bg-indigo-50' 
        : 'border-gray-200 hover:shadow-lg'
    }`}>
      {plan.is_popular && (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mb-3">
          Most Popular
        </span>
      )}
      
      <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
      <p className="mt-1 text-sm text-gray-500">{plan.description}</p>
      
      <p className="mt-4">
        <span className="text-3xl font-bold text-gray-900">{getPriceText()}</span>
        {plan.price_yearly > 0 && plan.price_monthly > 0 && (
          <span className="ml-2 text-sm text-green-600">
            Save {getYearlyDiscount()}% annually
          </span>
        )}
      </p>
      
      <ul className="mt-6 space-y-3">
        <li className="flex items-center text-sm">
          <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          Up to {plan.max_users} users
        </li>
        <li className="flex items-center text-sm">
          <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          {plan.max_storage_gb} GB storage
        </li>
        <li className="flex items-center text-sm">
          <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          {plan.max_departments} departments
        </li>
        <li className="flex items-center text-sm">
          <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          {plan.max_custom_domains} custom {plan.max_custom_domains === 1 ? 'domain' : 'domains'}
        </li>
        {plan.features?.kpi_tracking && (
          <li className="flex items-center text-sm">
            <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            KPI Tracking
          </li>
        )}
        {plan.features?.advanced_reports && (
          <li className="flex items-center text-sm">
            <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            Advanced Reports
          </li>
        )}
        {plan.features?.api_access && (
          <li className="flex items-center text-sm">
            <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            API Access
          </li>
        )}
        {plan.features?.priority_support && (
          <li className="flex items-center text-sm">
            <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            Priority Support
          </li>
        )}
        {plan.features?.sso && (
          <li className="flex items-center text-sm">
            <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            SSO Integration
          </li>
        )}
      </ul>

      <button
        onClick={isCurrent ? null : (plan.price_monthly === 0 ? onDowngrade : onUpgrade)}
        disabled={isCurrent}
        className={`mt-6 w-full py-2 px-4 rounded-md transition-colors ${
          isCurrent
            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
            : 'bg-indigo-600 text-white hover:bg-indigo-700'
        }`}
      >
        {isCurrent ? 'Current Plan' : plan.price_monthly === 0 ? 'Downgrade to Free' : 'Upgrade'}
      </button>
    </div>
  );
};

export default PlanCard;