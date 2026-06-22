import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FiSearch, FiChevronDown, FiChevronRight, FiShield, FiCheck } from 'react-icons/fi';
import { fetchPermissions } from '../../../../store/accounts/slice/permissionSlice';
import Spinner from '../../../common/UI/Spinner';

const PermissionList = ({ selectedPermissions = [], onChange, readOnly = false }) => {
    const dispatch = useDispatch();
    const { permissions, isLoading } = useSelector((state) => state.permissions);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedCategories, setExpandedCategories] = useState(() => {
        const initial = {};
        if (permissions) {
            Object.keys(groupPermissionsByCategory(permissions)).forEach(cat => {
                initial[cat] = true;
            });
        }
        return initial;
    });
    const [localSelected, setLocalSelected] = useState(selectedPermissions);

    useEffect(() => {
        dispatch(fetchPermissions());
    }, [dispatch]);

    useEffect(() => {
        setLocalSelected(selectedPermissions);
    }, [selectedPermissions]);

    const handlePermissionToggle = (permissionId) => {
        if (readOnly) return;
        const newSelected = localSelected.includes(permissionId)
            ? localSelected.filter(id => id !== permissionId)
            : [...localSelected, permissionId];
        setLocalSelected(newSelected);
        if (onChange) {
            onChange(newSelected);
        }
    };

    const handleSelectAll = (categoryPermissions) => {
        const categoryIds = categoryPermissions.map(p => p.id);
        const allSelected = categoryIds.every(id => localSelected.includes(id));
        let newSelected;
        if (allSelected) {
            newSelected = localSelected.filter(id => !categoryIds.includes(id));
        } else {
            const toAdd = categoryIds.filter(id => !localSelected.includes(id));
            newSelected = [...localSelected, ...toAdd];
        }
        setLocalSelected(newSelected);
        if (onChange) {
            onChange(newSelected);
        }
    };

    const toggleCategory = (category) => {
        setExpandedCategories(prev => ({
            ...prev,
            [category]: !prev[category]
        }));
    };

    const groupPermissionsByCategory = (perms) => {
        const grouped = {};
        perms.forEach(perm => {
            const category = perm.category || 'other';
            if (!grouped[category]) {
                grouped[category] = [];
            }
            grouped[category].push(perm);
        });
        return grouped;
    };

    const filterPermissions = (perms) => {
        if (!searchTerm) return perms;
        return perms.filter(p => 
            p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.codename?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    const getCategoryDisplay = (category) => {
        const categories = {
            kpi: 'KPI Management',
            review: 'Performance Reviews',
            user: 'User Management',
            tenant: 'Tenant Management',
            report: 'Reports',
            workflow: 'Workflow',
            admin: 'Administration'
        };
        return categories[category] || category.charAt(0).toUpperCase() + category.slice(1);
    };

    if (isLoading) {
        return (
            <div className="permission-list-loading">
                <Spinner size="md" />
                <p>Loading permissions...</p>
            </div>
        );
    }

    if (!permissions || permissions.length === 0) {
        return (
            <div className="permission-list-empty">
                <FiShield size={32} />
                <p>No permissions found</p>
            </div>
        );
    }

    const groupedPermissions = groupPermissionsByCategory(permissions);

    return (
        <div className="permission-list">
            <div className="permission-search">
                <FiSearch className="search-icon" />
                <input
                    type="text"
                    placeholder="Search permissions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>
            <div className="permission-categories">
                {Object.entries(groupedPermissions).map(([category, perms]) => {
                    const filteredPerms = filterPermissions(perms);
                    if (filteredPerms.length === 0) return null;
                    
                    const isExpanded = expandedCategories[category];
                    const allSelected = filteredPerms.every(p => localSelected.includes(p.id));
                    const someSelected = filteredPerms.some(p => localSelected.includes(p.id));
                    
                    return (
                        <div key={category} className="permission-category">
                            <div className="category-header">
                                <button 
                                    className="category-toggle"
                                    onClick={() => toggleCategory(category)}
                                    type="button"
                                >
                                    {isExpanded ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />}
                                </button>
                                <span className="category-name">{getCategoryDisplay(category)}</span>
                                {!readOnly && (
                                    <label className="select-all">
                                        <input
                                            type="checkbox"
                                            checked={allSelected}
                                            ref={el => {
                                                if (el) el.indeterminate = !allSelected && someSelected;
                                            }}
                                            onChange={() => handleSelectAll(filteredPerms)}
                                        />
                                        <span>Select All</span>
                                    </label>
                                )}
                            </div>
                            
                            {isExpanded && (
                                <div className="permission-items">
                                    {filteredPerms.map(perm => (
                                        <label key={perm.id} className="permission-item">
                                            <input
                                                type="checkbox"
                                                checked={localSelected.includes(perm.id)}
                                                onChange={() => handlePermissionToggle(perm.id)}
                                                disabled={readOnly}
                                            />
                                            <div className="permission-info">
                                                <span className="permission-name">{perm.name}</span>
                                                <span className="permission-code">{perm.codename}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PermissionList;