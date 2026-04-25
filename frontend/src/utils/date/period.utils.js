import { startOfMonth, endOfMonth, formatDate, addDays, subtractDays } from './date.utils';
import { DATE_FORMATS } from '../kpi/constants';

/**
 * Get current period (year, month)
 * @returns {Object} Current period
 */
export const getCurrentPeriod = () => {
    const now = new Date();
    return {
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        period: formatDate(now, DATE_FORMATS.PERIOD)
    };
};

/**
 * Get previous period
 * @param {number} year - Year
 * @param {number} month - Month
 * @returns {Object} Previous period
 */
export const getPreviousPeriod = (year, month) => {
    if (month === 1) {
        return { year: year - 1, month: 12 };
    }
    return { year, month: month - 1 };
};

/**
 * Get next period
 * @param {number} year - Year
 * @param {number} month - Month
 * @returns {Object} Next period
 */
export const getNextPeriod = (year, month) => {
    if (month === 12) {
        return { year: year + 1, month: 1 };
    }
    return { year, month: month + 1 };
};

/**
 * Get period range
 * @param {number} startYear - Start year
 * @param {number} startMonth - Start month
 * @param {number} endYear - End year
 * @param {number} endMonth - End month
 * @returns {Array} Array of periods
 */
export const getPeriodRange = (startYear, startMonth, endYear, endMonth) => {
    const periods = [];
    let year = startYear;
    let month = startMonth;
    
    while (year < endYear || (year === endYear && month <= endMonth)) {
        periods.push({ year, month });
        if (month === 12) {
            year++;
            month = 1;
        } else {
            month++;
        }
    }
    
    return periods;
};

/**
 * Get year to date periods
 * @param {number} year - Year
 * @param {number} currentMonth - Current month
 * @returns {Array} YTD periods
 */
export const getYearToDatePeriods = (year, currentMonth) => {
    const periods = [];
    for (let month = 1; month <= currentMonth; month++) {
        periods.push({ year, month });
    }
    return periods;
};

/**
 * Get last N periods
 * @param {number} year - Year
 * @param {number} month - Month
 * @param {number} count - Number of periods
 * @returns {Array} Last N periods
 */
export const getLastNPeriods = (year, month, count) => {
    const periods = [];
    let currentYear = year;
    let currentMonth = month;
    
    for (let i = 0; i < count; i++) {
        periods.unshift({ year: currentYear, month: currentMonth });
        if (currentMonth === 1) {
            currentYear--;
            currentMonth = 12;
        } else {
            currentMonth--;
        }
    }
    
    return periods;
};

/**
 * Format period string
 * @param {number} year - Year
 * @param {number} month - Month
 * @param {string} format - Format type
 * @returns {string} Formatted period
 */
export const formatPeriod = (year, month, format = DATE_FORMATS.PERIOD) => {
    const date = new Date(year, month - 1, 1);
    return formatDate(date, format);
};

/**
 * Parse period string
 * @param {string} periodStr - Period string (YYYY-MM)
 * @returns {Object} Parsed period
 */
export const parsePeriod = (periodStr) => {
    const [year, month] = periodStr.split('-');
    return {
        year: parseInt(year, 10),
        month: parseInt(month, 10)
    };
};

/**
 * Check if period is valid
 * @param {number} year - Year
 * @param {number} month - Month
 * @returns {boolean} Whether period is valid
 */
export const isValidPeriod = (year, month) => {
    return year >= 2000 && year <= 2100 && month >= 1 && month <= 12;
};

/**
 * Get quarter from month
 * @param {number} month - Month (1-12)
 * @returns {number} Quarter (1-4)
 */
export const getQuarterFromMonth = (month) => {
    return Math.ceil(month / 3);
};

/**
 * Get months in quarter
 * @param {number} quarter - Quarter (1-4)
 * @returns {Array} Months in quarter
 */
export const getMonthsInQuarter = (quarter) => {
    const startMonth = (quarter - 1) * 3 + 1;
    return [startMonth, startMonth + 1, startMonth + 2];
};

/**
 * Get fiscal year
 * @param {number} year - Year
 * @param {number} fiscalStartMonth - Fiscal year start month
 * @returns {Object} Fiscal year range
 */
export const getFiscalYear = (year, fiscalStartMonth = 1) => {
    if (fiscalStartMonth === 1) {
        return { startYear: year, endYear: year };
    }
    
    const currentDate = new Date(year, 0, 1);
    const fiscalStartDate = new Date(year, fiscalStartMonth - 1, 1);
    
    if (currentDate < fiscalStartDate) {
        return { startYear: year - 1, endYear: year };
    }
    return { startYear: year, endYear: year + 1 };
};