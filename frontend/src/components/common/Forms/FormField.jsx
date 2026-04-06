import React from 'react';
import { FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

const FormField = ({
    name,
    label,
    type = 'text',
    value,
    onChange,
    onBlur,
    error,
    touched,
    required = false,
    disabled = false,
    readOnly = false,
    placeholder,
    icon = null,
    iconPosition = 'left',
    helperText = null,
    className = '',
    ...props
}) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const inputType = type === 'password' && showPassword ? 'text' : type;
    const handleTogglePassword = () => {
        setShowPassword(!showPassword);
    };
    const hasError = error && touched;
    const isValid = !error && touched && value;
    const inputClasses = [
        'form-input',
        hasError ? 'is-invalid' : '',
        isValid ? 'is-valid' : '',
        icon ? 'has-icon' : '',
        iconPosition === 'left' ? 'has-icon-left' : 'has-icon-right',
        className
    ].filter(Boolean).join(' ');
    return (
        <div className="form-field">
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
                {type === 'textarea' ? (
                    <textarea
                        id={name}
                        name={name}
                        value={value || ''}
                        onChange={onChange}
                        onBlur={onBlur}
                        placeholder={placeholder}
                        disabled={disabled}
                        readOnly={readOnly}
                        className={inputClasses}
                        rows={props.rows || 4}
                        aria-invalid={hasError}
                        aria-describedby={hasError ? `${name}-error` : undefined}
                        {...props}
                    />
                ) : (
                    <input
                        id={name}
                        name={name}
                        type={inputType}
                        value={value || ''}
                        onChange={onChange}
                        onBlur={onBlur}
                        placeholder={placeholder}
                        disabled={disabled}
                        readOnly={readOnly}
                        className={inputClasses}
                        aria-invalid={hasError}
                        aria-describedby={hasError ? `${name}-error` : undefined}
                        {...props}
                    />
                )}
                {type === 'password' && (
                    <button
                        type="button"
                        className="password-toggle"
                        onClick={handleTogglePassword}
                        tabIndex="-1"
                    >
                        {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                )}
                {icon && iconPosition === 'right' && type !== 'password' && (
                    <span className="input-icon-right">{icon}</span>
                )}
                {hasError && (
                    <div className="input-feedback error" id={`${name}-error`}>
                        <FiAlertCircle size={14} />
                        <span>{error}</span>
                    </div>
                )}
                {isValid && !hasError && (
                    <div className="input-feedback success">
                        <FiCheckCircle size={14} />
                        <span>Valid</span>
                    </div>
                )}
            </div>
            {helperText && !hasError && (
                <div className="helper-text">{helperText}</div>
            )}
        </div>
    );
};

export default FormField;