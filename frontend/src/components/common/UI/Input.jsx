import React, { useState } from 'react';
import { FiEye, FiEyeOff, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

const Input = ({
    type = 'text',
    name,
    value,
    onChange,
    onBlur,
    label,
    placeholder,
    error,
    success = false,
    required = false,
    disabled = false,
    readOnly = false,
    icon = null,
    iconPosition = 'left',
    className = '',
    ...props
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputType = type === 'password' && showPassword ? 'text' : type;
    const handleTogglePassword = () => {
        setShowPassword(!showPassword);
    };
    const inputClasses = [
        'form-input',
        error ? 'is-invalid' : '',
        success ? 'is-valid' : '',
        icon ? 'has-icon' : '',
        iconPosition === 'left' ? 'has-icon-left' : 'has-icon-right',
        className
    ].filter(Boolean).join(' ');
    return (
        <div className="form-group">
            {label && (
                <label htmlFor={name} className="form-label">
                    {label}
                    {required && <span className="required-mark">*</span>}
                </label>
            )} 
            <div className="input-wrapper">
                {icon && iconPosition === 'left' && (
                    <span className="input-icon-left">{icon}</span>
                )}  
                <input
                    id={name}
                    name={name}
                    type={inputType}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    placeholder={placeholder}
                    disabled={disabled}
                    readOnly={readOnly}
                    className={inputClasses}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${name}-error` : undefined}
                    {...props}
                />
                {type === 'password' && (
                    <button
                        type="button"
                        className="password-toggle"
                        onClick={handleTogglePassword}
                        tabIndex="-1"
                    >
                        {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                )}
                {icon && iconPosition === 'right' && type !== 'password' && (
                    <span className="input-icon-right">{icon}</span>
                )}
                {error && (
                    <div className="input-feedback error">
                        <FiAlertCircle size={14} />
                        <span>{error}</span>
                    </div>
                )}
                {success && !error && (
                    <div className="input-feedback success">
                        <FiCheckCircle size={14} />
                        <span>Valid</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Input;