// src/components/reviews/competency-categories/edit/CategoryEdit.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useCompetencyCategories } from '../../../../hooks/reviews';
import { ReviewLoading, ReviewError } from '../../common';
import CategoryForm from '../create/CategoryForm';
import CategoryHelpGuide from '../create/CategoryHelpGuide';

const CategoryEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selected, loading, error, fetchOne, updateCategory } = useCompetencyCategories();
  const [formData, setFormData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGuide, setShowGuide] = useState(true);

  useEffect(() => {
    if (id) {
      fetchOne(id);
    }
  }, [id, fetchOne]);

  useEffect(() => {
    if (selected) {
      setFormData({
        name: selected.name || '',
        description: selected.description || '',
        order: selected.order || 0,
        is_active: selected.is_active || true,
        parent_id: selected.parent_id || null,
      });
    }
  }, [selected]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData) return;
    setIsSubmitting(true);
    try {
      await updateCategory(id, formData);
      navigate('/reviews/competency-categories');
    } catch (error) {
      console.error('Failed to update category:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (data) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  if (loading) return <ReviewLoading size="lg" text="Loading category..." />;
  if (error) return <ReviewError error={error} onRetry={() => fetchOne(id)} />;
  if (!formData) return null;

  return (
    <div className="category-edit">
      <div className="category-edit-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="category-edit-back" onClick={() => navigate('/reviews/competency-categories')}>
            <ArrowLeft size={20} />
            Back to Categories
          </button>
          <h1 className="category-edit-title">Edit Competency Category</h1>
        </div>
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => setShowGuide(!showGuide)}
        >
          {showGuide ? 'Hide Help Guide' : 'Show Help Guide'}
        </button>
      </div>

      <div className={showGuide ? "category-edit-layout" : "category-form-container-single"}>
        <form onSubmit={handleSubmit} className="category-edit-form">
          <CategoryForm
            data={formData}
            onChange={handleChange}
          />

          <div className="category-edit-actions">
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
              disabled={isSubmitting || !formData.name}
            >
              <Save size={18} />
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>

        {showGuide && <CategoryHelpGuide />}
      </div>
    </div>
  );
};

export default CategoryEdit;