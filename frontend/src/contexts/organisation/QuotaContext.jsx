import React, { createContext, useContext, useState, useEffect } from 'react';
import { quotaApi } from '../../services/organisation/api';
import { useOrganisation } from './OrganisationContext';
import toast from 'react-hot-toast';

const QuotaContext = createContext();

export const useQuota = () => {
  const context = useContext(QuotaContext);
  if (!context) {
    throw new Error('useQuota must be used within QuotaProvider');
  }
  return context;
};

export const QuotaProvider = ({ children }) => {
  const { organisation } = useOrganisation();
  const [quotas, setQuotas] = useState({
    users: { current: 0, limit: 0, percentage: 0 },
    storage: { current: 0, limit: 0, percentage: 0, unit: 'GB' },
    api_calls: { current: 0, limit: 0, percentage: 0 },
    departments: { current: 0, limit: 0, percentage: 0 },
    teams: { current: 0, limit: 0, percentage: 0 },
    positions: { current: 0, limit: 0, percentage: 0 },
    domains: { current: 0, limit: 0, percentage: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [exceededQuotas, setExceededQuotas] = useState([]);
  const [warningQuotas, setWarningQuotas] = useState([]);

  const fetchQuotas = async () => {
    if (!organisation) return;
    
    try {
      setLoading(true);
      const response = await quotaApi.getAll();
      const data = response.data;
      
      const updatedQuotas = { ...quotas };
      const exceeded = [];
      const warnings = [];
      
      Object.keys(data).forEach(key => {
        if (updatedQuotas[key]) {
          const percentage = (data[key].current / data[key].limit) * 100;
          updatedQuotas[key] = {
            ...data[key],
            percentage: Math.round(percentage),
          };
          
          if (percentage >= 100) {
            exceeded.push(key);
          } else if (percentage >= 80) {
            warnings.push(key);
          }
        }
      });
      
      setQuotas(updatedQuotas);
      setExceededQuotas(exceeded);
      setWarningQuotas(warnings);
      
      if (exceeded.length > 0) {
        toast.error(`Quota exceeded: ${exceeded.join(', ')}`);
      } else if (warnings.length > 0) {
        toast.warning(`Approaching quota limit: ${warnings.join(', ')}`);
      }
    } catch (err) {
      console.error('Error fetching quotas:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkQuota = (quotaName, currentValue) => {
    const quota = quotas[quotaName];
    if (!quota) return true;
    return currentValue <= quota.limit;
  };

  const getQuotaPercentage = (quotaName) => {
    return quotas[quotaName]?.percentage || 0;
  };

  const isQuotaExceeded = (quotaName) => {
    return exceededQuotas.includes(quotaName);
  };

  const isQuotaWarning = (quotaName) => {
    return warningQuotas.includes(quotaName);
  };

  useEffect(() => {
    fetchQuotas();
  }, [organisation]);

  const value = {
    quotas,
    loading,
    exceededQuotas,
    warningQuotas,
    checkQuota,
    getQuotaPercentage,
    isQuotaExceeded,
    isQuotaWarning,
    refreshQuotas: fetchQuotas,
  };

  return (
    <QuotaContext.Provider value={value}>
      {children}
    </QuotaContext.Provider>
  );
};