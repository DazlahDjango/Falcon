import { useFeature } from '../../contexts/organisation';

export const useFeatureFlags = () => {
  const { 
    features, 
    loading, 
    error, 
    hasFeature, 
    enableFeature, 
    disableFeature, 
    refreshFeatures 
  } = useFeature();
  
  return { 
    features, 
    loading, 
    error, 
    hasFeature, 
    enableFeature, 
    disableFeature, 
    refreshFeatures 
  };
};