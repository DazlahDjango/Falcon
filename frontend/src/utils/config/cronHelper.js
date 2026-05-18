import cronParser from 'cron-parser';

export const validateCronExpression = (expression) => {
  if (!expression || typeof expression !== 'string') {
    return { valid: false, error: 'Cron expression is required' };
  }
  
  try {
    cronParser.parseExpression(expression);
    return { valid: true };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

export const getNextRunTime = (expression, options = {}) => {
  const { startDate = new Date(), count = 1 } = options;
  
  try {
    const interval = cronParser.parseExpression(expression, { currentDate: startDate });
    const nextRuns = [];
    for (let i = 0; i < count; i++) {
      nextRuns.push(interval.next().toDate());
    }
    return { success: true, nextRuns };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getPreviousRunTime = (expression, options = {}) => {
  const { endDate = new Date(), count = 1 } = options;
  
  try {
    const interval = cronParser.parseExpression(expression, { currentDate: endDate });
    const prevRuns = [];
    for (let i = 0; i < count; i++) {
      prevRuns.push(interval.prev().toDate());
    }
    return { success: true, prevRuns };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getCronDescription = (expression) => {
  const descriptions = {
    '0 * * * *': 'Every hour',
    '0 */6 * * *': 'Every 6 hours',
    '0 2 * * *': 'Daily at 2:00 AM',
    '0 2 * * 1-5': 'Weekdays at 2:00 AM',
    '0 2 * * 0': 'Weekly on Sunday at 2:00 AM',
    '0 2 1 * *': 'Monthly on the 1st at 2:00 AM',
    '*/30 * * * *': 'Every 30 minutes',
    '*/15 * * * *': 'Every 15 minutes',
    '0 */1 * * *': 'Every hour on the hour',
    '0 0 * * *': 'Daily at midnight',
    '0 9 * * 1-5': 'Weekdays at 9:00 AM'
  };
  
  return descriptions[expression] || null;
};

export const getCronParts = (expression) => {
  const parts = expression.split(' ');
  if (parts.length !== 5) return null;
  
  return {
    minute: parts[0],
    hour: parts[1],
    dayOfMonth: parts[2],
    month: parts[3],
    dayOfWeek: parts[4]
  };
};

export const buildCronExpression = (parts) => {
  const { minute = '*', hour = '*', dayOfMonth = '*', month = '*', dayOfWeek = '*' } = parts;
  return `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;
};

export const getCommonPresets = () => {
  return [
    { label: 'Every hour', value: '0 * * * *' },
    { label: 'Every 6 hours', value: '0 */6 * * *' },
    { label: 'Daily at 2 AM', value: '0 2 * * *' },
    { label: 'Daily at 2 AM (weekdays)', value: '0 2 * * 1-5' },
    { label: 'Weekly on Sunday', value: '0 2 * * 0' },
    { label: 'Monthly on 1st', value: '0 2 1 * *' },
    { label: 'Every 30 minutes', value: '*/30 * * * *' },
    { label: 'Every 15 minutes', value: '*/15 * * * *' }
  ];
};