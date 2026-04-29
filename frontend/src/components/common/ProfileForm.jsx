import React, { useState } from 'react';
import { useForm } from '../../hooks/kpi';
import useToast from '../../hooks/kpi/useToast';
import { useAuth } from '../../hooks/accounts/useAuth'
import styles from './ProfileForm.module.css';

/**
 * ProfileForm - User profile edit form
 */
const ProfileForm = ({ user, onUpdate }) => {
    const { updateProfile } = useAuth();
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const { values, errors, handleChange, handleSubmit, setValues } = useForm(
        {
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            email: user?.email || '',
            phone: user?.phone || '',
            department: user?.department || '',
            title: user?.title || '',
        },
        {
            firstName: [rules.required('First name is required')],
            lastName: [rules.required('Last name is required')],
            email: [rules.required('Email is required'), rules.email()],
        },
        handleFormSubmit
    );

    async function handleFormSubmit(formValues) {
        setIsLoading(true);
        try {
            const updatedUser = await updateProfile(formValues);
            toast.success('Profile updated successfully');
            if (onUpdate) onUpdate(updatedUser);
        } catch (error) {
            console.error('Profile update failed:', error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formRow}>
                <div className={styles.formGroup}>
                    <label className={styles.label}>
                        First Name <span className={styles.required}>*</span>
                    </label>
                    <input
                        type="text"
                        name="firstName"
                        value={values.firstName}
                        onChange={handleChange}
                        className={`${styles.input} ${errors.firstName ? styles.error : ''}`}
                        disabled={isLoading}
                    />
                    {errors.firstName && <span className={styles.errorText}>{errors.firstName}</span>}
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>
                        Last Name <span className={styles.required}>*</span>
                    </label>
                    <input
                        type="text"
                        name="lastName"
                        value={values.lastName}
                        onChange={handleChange}
                        className={`${styles.input} ${errors.lastName ? styles.error : ''}`}
                        disabled={isLoading}
                    />
                    {errors.lastName && <span className={styles.errorText}>{errors.lastName}</span>}
                </div>
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>
                    Email <span className={styles.required}>*</span>
                </label>
                <input
                    type="email"
                    name="email"
                    value={values.email}
                    onChange={handleChange}
                    className={`${styles.input} ${errors.email ? styles.error : ''}`}
                    disabled={true}
                />
                <small className={styles.hint}>Email cannot be changed</small>
                {errors.email && <span className={styles.errorText}>{errors.email}</span>}
            </div>

            <div className={styles.formRow}>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Phone Number</label>
                    <input
                        type="tel"
                        name="phone"
                        value={values.phone}
                        onChange={handleChange}
                        className={styles.input}
                        disabled={isLoading}
                        placeholder="+254 700 000 000"
                    />
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Job Title</label>
                    <input
                        type="text"
                        name="title"
                        value={values.title}
                        onChange={handleChange}
                        className={styles.input}
                        disabled={isLoading}
                        placeholder="e.g., Senior Manager"
                    />
                </div>
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>Department</label>
                <input
                    type="text"
                    name="department"
                    value={values.department}
                    onChange={handleChange}
                    className={styles.input}
                    disabled={isLoading}
                    placeholder="e.g., Sales & Marketing"
                />
            </div>

            <div className={styles.actions}>
                <button type="submit" className={styles.submitButton} disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
    );
};

// Validation rules
const rules = {
    required: (message) => (value) => {
        if (!value || value.trim() === '') return message;
        return null;
    },
    email: () => (value) => {
        const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
        if (value && !emailRegex.test(value)) return 'Please enter a valid email address';
        return null;
    },
};

export default ProfileForm;