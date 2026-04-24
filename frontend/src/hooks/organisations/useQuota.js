import { useQuota as useQuotaContext } from '../../contexts/organisations/QuotaContext.jsx';

export const useQuota = () => {
  const { 
    quotas, 
    loading, 
    exceededQuotas, 
    warningQuotas, 
    checkQuota, 
    getQuotaPercentage, 
    isQuotaExceeded, 
    isQuotaWarning, 
    refreshQuotas 
  } = useQuotaContext();
  
  return { 
    quotas, 
    loading, 
    exceededQuotas, 
    warningQuotas, 
    checkQuota, 
    getQuotaPercentage, 
    isQuotaExceeded, 
    isQuotaWarning, 
    refreshQuotas 
  };
};