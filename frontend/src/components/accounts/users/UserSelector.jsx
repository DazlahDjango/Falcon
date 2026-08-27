import React, { useEffect, useMemo } from 'react';
import { useUsers } from '../../../hooks/accounts/useUsers';

const UserSelector = ({ 
    value, 
    onChange, 
    placeholder = 'Select user...', 
    disabled = false, 
    className = '',
    groupByRole = true
}) => {
    const { users, isLoading, loadUsers, getFullName } = useUsers();

    useEffect(() => {
        if (users.length === 0 && !isLoading) {
            loadUsers({ page_size: 1000 });
        }
    }, [users.length, isLoading, loadUsers]);

    const groupedUsers = useMemo(() => {
        if (!groupByRole) return null;
        
        const groups = {
            '👑 Executive Leadership': [],
            '👔 Managers & Supervisors': [],
            '🚀 Team Leads': [],
            '👥 Specialists & Staff': [],
            '👁️ Read Only & Others': []
        };

        users.forEach(user => {
            const role = (user.role || '').toLowerCase();
            const position = (user.position_title || user.position || '').toLowerCase();
            
            if (role === 'executive' || role === 'client_admin' || role === 'super_admin' || position.includes('chief') || position.includes('director') || position.includes('ceo') || position.includes('coo')) {
                groups['👑 Executive Leadership'].push(user);
            } else if (role === 'manager' || role === 'hr_admin' || position.includes('manager') || position.includes('head') || position.includes('controller')) {
                groups['👔 Managers & Supervisors'].push(user);
            } else if (role === 'team_lead' || position.includes('lead') || position.includes('supervisor')) {
                groups['🚀 Team Leads'].push(user);
            } else if (role === 'read_only') {
                groups['👁️ Read Only & Others'].push(user);
            } else {
                groups['👥 Specialists & Staff'].push(user);
            }
        });

        return groups;
    }, [users, groupByRole]);

    return (
        <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value || null)}
            disabled={disabled || isLoading}
            className={`user-selector ${className}`}
        >
            <option value="">{isLoading ? 'Loading users...' : placeholder}</option>
            {groupByRole && groupedUsers ? (
                Object.entries(groupedUsers).map(([groupTitle, groupMembers]) => {
                    if (groupMembers.length === 0) return null;
                    return (
                        <optgroup key={groupTitle} label={groupTitle}>
                            {groupMembers.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {getFullName(user)} ({user.email})
                                </option>
                            ))}
                        </optgroup>
                    );
                })
            ) : (
                users.map((user) => (
                    <option key={user.id} value={user.id}>
                        {getFullName(user)} ({user.email})
                    </option>
                ))
            )}
        </select>
    );
};

export default UserSelector;