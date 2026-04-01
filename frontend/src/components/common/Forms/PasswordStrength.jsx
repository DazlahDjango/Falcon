import React, { useState, useEffect } from 'react';
import { FiCheck, FiX, FiAlertTriangle } from 'react-icons/fi';

const PasswordStrength = ({ password, onStrengthChange, className = '' }) => {
    const [strength, setStrength] = useState({
        score: 0,
        level: 'weak',
        levelText: 'Weak',
        checks: {
            length: false,
            uppercase: false,
            lowercase: false,
            number: false,
            special: false
        }
    });
    useEffect(() => {
        const evaluateStrength = () => {
            let score = 0;
            const checks = {
                length: password.length >= 8,
                uppercase: /[A-Z]/.test(password),
                lowercase: /[a-z]/.test(password),
                number: /[0-9]/.test(password),
                special: /[!@#$%^&*()_+\-=\[\]{};:"\\|,.<>\/?]/.test(password)
            };
            // Calculate score
            Object.values(checks).forEach(passed => {
                if (passed) score++;
            });
            // Determine strength level
            let level = 'weak';
            let levelText = 'Weak';
            let color = '#ef4444';
            if (score >= 5) {
                level = 'strong';
                levelText = 'Strong';
                color = '#10b981';
            } else if (score >= 4) {
                level = 'good';
                levelText = 'Good';
                color = '#3b82f6';
            } else if (score >= 3) {
                level = 'fair';
                levelText = 'Fair';
                color = '#f59e0b';
            } else {
                level = 'weak';
                levelText = 'Weak';
                color = '#ef4444';
            }
            const strengthData = { score, level, levelText, checks, color };
            setStrength(strengthData);
            if (onStrengthChange) {
                onStrengthChange(strengthData);
            }
        };
        evaluateStrength();
    }, [password, onStrengthChange]);
    const getCheckIcon = (passed) => {
        return passed ? <FiCheck size={14} /> : <FiX size={14} />;
    };
    const getCheckClass = (passed) => {
        return passed ? 'check-passed' : 'check-failed';
    };
    return (
        <div className={`password-strength ${className}`}>
            <div className="strength-header">
                <div className="strength-meter">
                    <div 
                        className="strength-meter-fill"
                        style={{ 
                            width: `${(strength.score / 5) * 100}%`,
                            backgroundColor: strength.color
                        }}
                    />
                </div>
                <div className="strength-text" style={{ color: strength.color }}>
                    {strength.levelText} Password
                </div>
            </div>
            
            <div className="strength-requirements">
                <div className="strength-title">Password must contain:</div>
                <ul className="requirements-list">
                    <li className={getCheckClass(strength.checks.length)}>
                        {getCheckIcon(strength.checks.length)}
                        <span>At least 8 characters</span>
                    </li>
                    <li className={getCheckClass(strength.checks.uppercase)}>
                        {getCheckIcon(strength.checks.uppercase)}
                        <span>Uppercase letter (A-Z)</span>
                    </li>
                    <li className={getCheckClass(strength.checks.lowercase)}>
                        {getCheckIcon(strength.checks.lowercase)}
                        <span>Lowercase letter (a-z)</span>
                    </li>
                    <li className={getCheckClass(strength.checks.number)}>
                        {getCheckIcon(strength.checks.number)}
                        <span>Number (0-9)</span>
                    </li>
                    <li className={getCheckClass(strength.checks.special)}>
                        {getCheckIcon(strength.checks.special)}
                        <span>Special character (!@#$%^&*)</span>
                    </li>
                </ul>
            </div>
            
            {password && strength.score < 3 && (
                <div className="strength-warning">
                    <FiAlertTriangle size={14} />
                    <span>For better security, please meet all requirements</span>
                </div>
            )}
        </div>
    );
};

export { PasswordStrength };