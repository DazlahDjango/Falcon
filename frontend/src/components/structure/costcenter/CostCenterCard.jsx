import React from 'react';
import { DollarSign, PieChart, Calendar, TrendingUp } from 'lucide-react';

const CostCenterCard = ({ costCenter, onClick, className = '' }) => {
  if (!costCenter) return null;
  const utilization = costCenter.budget_amount 
    ? Math.round(((costCenter.budget_amount - (costCenter.remaining_budget || 0)) / costCenter.budget_amount) * 100)
    : 0;
  const getUtilizationClass = () => {
    if (utilization >= 90) return 'text-red-600';
    if (utilization >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };
  const getFillClass = () => {
    if (utilization >= 90) return 'budget-gauge-fill-high';
    if (utilization >= 75) return 'budget-gauge-fill-medium';
    return 'budget-gauge-fill-low';
  };

  return (
    <div className={`cost-center-card ${className}`} onClick={() => onClick?.(costCenter)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <DollarSign size={16} className="text-purple-500" />
            <span className="font-mono text-sm font-medium">{costCenter.code}</span>
          </div>
          <h4 className="font-medium text-gray-900 mt-1">{costCenter.name}</h4>
          {costCenter.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{costCenter.description}</p>
          )}
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-400 capitalize">{costCenter.category}</div>
          {costCenter.is_shared && (
            <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full mt-1 inline-block">
              Shared
            </span>
          )}
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <TrendingUp size={12} className="text-gray-400" />
            <span className="text-xs text-gray-500">Budget Utilization</span>
          </div>
          <span className={`text-sm font-medium ${getUtilizationClass()}`}>{utilization}%</span>
        </div>
        <div className="budget-gauge">
          <div className={`budget-gauge-fill ${getFillClass()}`} style={{ width: `${Math.min(100, utilization)}%` }} />
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <DollarSign size={10} />
            <span>Budget: {costCenter.budget_amount?.toLocaleString() || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-1">
            <PieChart size={10} />
            <span>Alloc: {costCenter.allocation_percentage || 0}%</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar size={10} />
            <span>FY {costCenter.fiscal_year}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CostCenterCard;