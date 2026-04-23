import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './PeriodSelector.module.css';

const PeriodSelector = ({ 
    year, 
    month, 
    onChange, 
    minYear, 
    maxYear, 
    showQuickNav,
    disabled,
    className 
}) => {
    const [selectedYear, setSelectedYear] = useState(year);
    const [selectedMonth, setSelectedMonth] = useState(month);
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const years = [];
    for (let y = minYear; y <= maxYear; y++) {
        years.push(y);
    }
    useEffect(() => {
        setSelectedYear(year);
        setSelectedMonth(month);
    }, [year, month]);
    const handleYearChange = (e) => {
        const newYear = parseInt(e.target.value, 10);
        setSelectedYear(newYear);
        onChange(newYear, selectedMonth);
    };
    const handleMonthChange = (e) => {
        const newMonth = parseInt(e.target.value, 10);
        setSelectedMonth(newMonth);
        onChange(selectedYear, newMonth);
    };
    const goToPreviousMonth = () => {
        let newYear = selectedYear;
        let newMonth = selectedMonth - 1;
        if (newMonth < 1) {
            newMonth = 12;
            newYear--;
        }
        if (newYear <= maxYear) {
            onChange(newYear, newMonth);
        }
    };
    const goToCurrentPeriod = () => {
        const now = new Date();
        onChange(now.getFullYear(), now.getMonth() + 1);
    };
    return (
        <div className={`${styles.periodSelector} ${className || ''}`}>
            <div className={styles.selectors}>
                <select 
                    value={selectedYear} 
                    onChange={handleYearChange}
                    disabled={disabled}
                    className={styles.select}
                >
                    {years.map(y => (
                        <option key={y} value={y}>{y}</option>
                    ))}
                </select>
                
                <select 
                    value={selectedMonth} 
                    onChange={handleMonthChange}
                    disabled={disabled}
                    className={styles.select}
                >
                    {months.map((m, idx) => (
                        <option key={idx + 1} value={idx + 1}>{m}</option>
                    ))}
                </select>
            </div>

            {showQuickNav && (
                <div className={styles.navigation}>
                    <button 
                        onClick={goToPreviousMonth}
                        disabled={disabled || (selectedYear === minYear && selectedMonth === 1)}
                        className={styles.navButton}
                    >
                        ◀
                    </button>
                    <button 
                        onClick={goToCurrentPeriod}
                        disabled={disabled}
                        className={styles.navButton}
                    >
                        Today
                    </button>
                    <button 
                        onClick={goToNextMonth}
                        disabled={disabled || (selectedYear === maxYear && selectedMonth === 12)}
                        className={styles.navButton}
                    >
                        ▶
                    </button>
                </div>
            )}
        </div>
    );
}
PeriodSelector.propTypes = {
    year: PropTypes.number.isRequired,
    month: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
    minYear: PropTypes.number,
    maxYear: PropTypes.number,
    showQuickNav: PropTypes.bool,
    disabled: PropTypes.bool,
    className: PropTypes.string,
};
PeriodSelector.defaultProps = {
    minYear: 2020,
    maxYear: new Date().getFullYear() + 2,
    showQuickNav: true,
    disabled: false,
};
export default PeriodSelector;