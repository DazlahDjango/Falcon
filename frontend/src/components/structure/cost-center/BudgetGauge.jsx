import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const BudgetGauge = ({ budget, spent, remaining, currency = 'USD', className = '' }) => {
  const utilization = budget > 0 ? Math.round((spent / budget) * 100) : 0;
  const getStatus = () => {
    if (utilization >= 100) return { color: 'text-red-600', icon: TrendingUp, label: 'Over Budget' };
    if (utilization >= 90) return { color: 'text-orange-600', icon: TrendingUp, label: 'Critical' };
    if (utilization >= 75) return { color: 'text-yellow-600', icon: TrendingUp, label: 'Warning' };
    if (utilization <= 50) return { color: 'text-green-600', icon: TrendingDown, label: 'Good' };
    return { color: 'text-blue-600', icon: Minus, label: 'On Track' };
  };
  const status = getStatus();
  const StatusIcon = status.icon;
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(value || 0);
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-full bg-${status.color.replace('text-', '')}/10`}>
            <StatusIcon size={16} className={status.color} />
          </div>
          <span className="text-sm font-medium">{status.label}</span>
        </div>
        <span className="text-sm font-semibold">{utilization}%</span>
      </div>
      <div className="budget-gauge mb-3">
        <div 
          className={`budget-gauge-fill ${utilization >= 90 ? 'budget-gauge-fill-high' : utilization >= 75 ? 'budget-gauge-fill-medium' : 'budget-gauge-fill-low'}`}
          style={{ width: `${Math.min(100, utilization)}%` }}
        />
      </div>
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div>
          <div className="text-gray-400">Budget</div>
          <div className="font-semibold text-gray-900">{formatCurrency(budget)}</div>
        </div>
        <div>
          <div className="text-gray-400">Spent</div>
          <div className="font-semibold text-gray-900">{formatCurrency(spent)}</div>
        </div>
        <div>
          <div className="text-gray-400">Remaining</div>
          <div className={`font-semibold ${remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
            {formatCurrency(remaining)}
          </div>
        </div>
      </div>
    </div>
  );
};
export default BudgetGauge;