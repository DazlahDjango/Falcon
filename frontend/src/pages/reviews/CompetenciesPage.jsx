// src/pages/reviews/CompetenciesPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompetencies } from '../../hooks/reviews';
import { CompetencyList, CompetencyForm, CompetencyCategoryList, CompetencyCategoryForm } from '../../components/reviews/competency';
import { REVIEW_ROUTES } from '../../config/constants';

const CompetenciesPage = () => {
    const navigate = useNavigate();
    const { competencies, categories, fetchCompetencies, fetchCategories, createCompetency, updateCompetency, deleteCompetency, createCategory, updateCategory, deleteCategory, loading } = useCompetencies();
    const [activeTab, setActiveTab] = useState('competencies');
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [userRole, setUserRole] = useState('staff');

    useEffect(() => {
        fetchCompetencies();
        fetchCategories();
        setUserRole(localStorage.getItem('user_role') || 'staff');
    }, []);

    const canManage = userRole === 'super_admin' || userRole === 'client_admin' || userRole === 'dashboard_champion' || userRole === 'executive' || userRole === 'hr';

    const handleCreateClick = () => {
        setEditingItem(null);
        setShowForm(true);
    };

    const handleEdit = (id, type) => {
        const item = type === 'competency' 
            ? competencies.find(c => c.id === id)
            : categories.find(c => c.id === id);
        setEditingItem({ ...item, type });
        setShowForm(true);
    };

    const handleSubmit = async (data) => {
        if (editingItem?.type === 'competency') {
            await updateCompetency(editingItem.id, data);
        } else if (editingItem?.type === 'category') {
            await updateCategory(editingItem.id, data);
        } else if (activeTab === 'competencies') {
            await createCompetency(data);
        } else {
            await createCategory(data);
        }
        setShowForm(false);
        setEditingItem(null);
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingItem(null);
    };

    const handleDelete = async (id, type) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            if (type === 'competency') {
                await deleteCompetency(id);
            } else {
                await deleteCategory(id);
            }
        }
    };

    if (showForm) {
        return (
            <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1f2937', margin: 0 }}>
                        {editingItem ? 'Edit' : 'Create'} {activeTab === 'competencies' ? 'Competency' : 'Category'}
                    </h1>
                </div>
                {activeTab === 'competencies' ? (
                    <CompetencyForm 
                        initialData={editingItem || {}} 
                        categories={categories}
                        onSubmit={handleSubmit} 
                        onCancel={handleCancel} 
                    />
                ) : (
                    <CompetencyCategoryForm 
                        initialData={editingItem || {}} 
                        onSubmit={handleSubmit} 
                        onCancel={handleCancel} 
                    />
                )}
            </div>
        );
    }

    return (
        <div>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid #e5e7eb', padding: '0 1.5rem' }}>
                <button 
                    onClick={() => setActiveTab('competencies')}
                    style={{ padding: '0.5rem 1rem', border: 'none', background: 'none', cursor: 'pointer', fontWeight: activeTab === 'competencies' ? 600 : 400, borderBottom: activeTab === 'competencies' ? '2px solid #3b82f6' : 'none' }}
                >
                    Competencies
                </button>
                <button 
                    onClick={() => setActiveTab('categories')}
                    style={{ padding: '0.5rem 1rem', border: 'none', background: 'none', cursor: 'pointer', fontWeight: activeTab === 'categories' ? 600 : 400, borderBottom: activeTab === 'categories' ? '2px solid #3b82f6' : 'none' }}
                >
                    Categories
                </button>
            </div>

            {activeTab === 'competencies' ? (
                <CompetencyList 
                    competencies={competencies}
                    categories={categories}
                    loading={loading}
                    onEdit={(id) => handleEdit(id, 'competency')}
                    onDelete={(id) => handleDelete(id, 'competency')}
                    onCreateClick={canManage ? handleCreateClick : null}
                    canManage={canManage}
                />
            ) : (
                <CompetencyCategoryList 
                    categories={categories}
                    loading={loading}
                    onEdit={(id) => handleEdit(id, 'category')}
                    onDelete={(id) => handleDelete(id, 'category')}
                    onCreateClick={canManage ? handleCreateClick : null}
                    canManage={canManage}
                />
            )}
        </div>
    );
};

export default CompetenciesPage;