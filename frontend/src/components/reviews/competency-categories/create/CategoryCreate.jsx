// src/components/reviews/competency-categories/create/CategoryCreate.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useCompetencyCategories } from '../../../../hooks/reviews';
import CategoryForm from './CategoryForm';
import CategoryHelpGuide from './CategoryHelpGuide';

const CategoryCreate = () => {
  const navigate = useNavigate();
  const { createCategory, loading } = useCompetencyCategories();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    order: 0,
    is_active: true,
    parent_id: null,
  });
  const [showGuide, setShowGuide] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createCategory(formData);
      navigate('/reviews/competency-categories');
    } catch (error) {
      console.error('Failed to create category:', error);
    }
  };

  const handleChange = (data) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  return (
    <div className="category-create">
      <div className="category-create-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="category-create-back" onClick={() => navigate('/reviews/competency-categories')}>
            <ArrowLeft size={20} />
            Back to Categories
          </button>
          <h1 className="category-create-title">Create Competency Category</h1>
        </div>
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => setShowGuide(!showGuide)}
        >
          {showGuide ? 'Hide Help Guide' : 'Show Help Guide'}
        </button>
      </div>

      <div className={showGuide ? "category-create-layout" : "category-form-container-single"}>
        <form onSubmit={handleSubmit} className="category-create-form">
          <CategoryForm
            data={formData}
            onChange={handleChange}
          />

          <div className="category-create-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate('/reviews/competency-categories')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !formData.name}
            >
              <Save size={18} />
              {loading ? 'Creating...' : 'Create Category'}
            </button>
          </div>
        </form>

        {showGuide && <CategoryHelpGuide />}
      </div>
    </div>
  );
};

export default CategoryCreate;