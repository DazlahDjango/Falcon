import React, { createContext, useContext, useState } from 'react';

const TabsContext = createContext();

export const Tabs = ({ value, onValueChange, children, className = '' }) => {
  const [activeTab, setActiveTab] = useState(value || '');
  
  const handleValueChange = (newValue) => {
    if (onValueChange) {
      onValueChange(newValue);
    } else {
      setActiveTab(newValue);
    }
  };
  
  const currentValue = value !== undefined ? value : activeTab;
  
  return (
    <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
      <div className={`w-full ${className}`}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

export const TabsList = ({ children, className = '' }) => {
  return (
    <div className={`flex space-x-1 rounded-lg bg-gray-100 p-1 ${className}`}>
      {children}
    </div>
  );
};

export const TabsTrigger = ({ value, children, className = '' }) => {
  const { value: activeValue, onValueChange } = useContext(TabsContext);
  const isActive = activeValue === value;
  
  return (
    <button
      className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
        isActive 
          ? 'bg-white text-gray-900 shadow-sm' 
          : 'text-gray-600 hover:text-gray-900'
      } ${className}`}
      onClick={() => onValueChange(value)}
    >
      {children}
    </button>
  );
};

export const TabsContent = ({ value, children, className = '' }) => {
  const { value: activeValue } = useContext(TabsContext);
  
  if (activeValue !== value) return null;
  
  return (
    <div className={`mt-2 ${className}`}>
      {children}
    </div>
  );
};

export default Tabs;