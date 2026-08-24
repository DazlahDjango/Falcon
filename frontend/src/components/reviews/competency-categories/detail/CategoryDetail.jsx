// src/components/reviews/competency-categories/detail/CategoryDetail.jsx
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, FolderOpen, Plus, Award, CheckCircle, XCircle } from 'lucide-react';
import { useCompetencyCategories } from '../../../../hooks/reviews';
import { ReviewStatusBadge, ReviewLoading } from '../../common';
import { REVIEW_ROUTES } from '../../../../config/constants/reviewRouteConstants';

const CategoryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selected, loading, error, fetchOne, getCompetencies, categoryCompetencies, deleteCategory, canManage } = useCompetencyCategories();

  useEffect(() => {
    if (id) {
      fetchOne(id);
      getCompetencies(id);
    }
  }, [id, fetchOne, getCompetencies]);

  const handleDelete = async () => {
    if (categoryCompetencies && categoryCompetencies.length > 0) {
      alert('Cannot delete a category that contains competencies.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete "${selected?.name}"?`)) {
      await deleteCategory(id);
      navigate(REVIEW_ROUTES.COMPETENCY_CATEGORIES);
    }
  };

  if (loading) {
    return <ReviewLoading message="Loading category details..." />;
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600">
        <p>Error loading category: {error}</p>
        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          onClick={() => navigate(REVIEW_ROUTES.COMPETENCY_CATEGORIES)}
        >
          Back to Categories
        </button>
      </div>
    );
  }

  if (!selected) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p>Category not found</p>
        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          onClick={() => navigate(REVIEW_ROUTES.COMPETENCY_CATEGORIES)}
        >
          Back to Categories
        </button>
      </div>
    );
  }

  return (
    <div className="category-detail p-6 space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(REVIEW_ROUTES.COMPETENCY_CATEGORIES)}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            title="Back to Categories"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <FolderOpen className="text-blue-600" size={24} />
              <h1 className="text-xl font-bold text-gray-900">{selected.name}</h1>
              <ReviewStatusBadge status={selected.is_active ? 'active' : 'inactive'} />
            </div>
            <p className="text-xs text-gray-500 mt-1">Display Order: {selected.order || 0}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canManage && (
            <>
              <button
                onClick={() => navigate(REVIEW_ROUTES.COMPETENCY_CATEGORIES_EDIT(selected.id))}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1.5"
              >
                <Edit size={16} /> Edit Category
              </button>
              <button
                onClick={handleDelete}
                className="px-3 py-1.5 border border-red-200 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-1.5"
                disabled={categoryCompetencies && categoryCompetencies.length > 0}
                title={categoryCompetencies && categoryCompetencies.length > 0 ? 'Cannot delete category containing competencies' : 'Delete Category'}
              >
                <Trash2 size={16} /> Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Description & Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">Description</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            {selected.description || 'No description provided for this category.'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-medium text-gray-500 uppercase">Assigned Competencies</span>
            <div className="text-3xl font-bold text-gray-900 mt-1">
              {categoryCompetencies ? categoryCompetencies.length : (selected.competency_count || 0)}
            </div>
          </div>
          <button
            onClick={() => navigate(`${REVIEW_ROUTES.COMPETENCIES_CREATE}?category=${selected.id}`)}
            className="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Plus size={14} /> Add Competency
          </button>
        </div>
      </div>

      {/* Competencies List Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Award size={18} className="text-blue-600" />
            Competencies in {selected.name}
          </h2>
          <span className="text-xs text-gray-500 font-medium">
            {categoryCompetencies ? categoryCompetencies.length : 0} items
          </span>
        </div>

        {categoryCompetencies && categoryCompetencies.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {categoryCompetencies.map((comp) => (
              <div
                key={comp.id}
                className="p-4 hover:bg-gray-50/80 transition-colors flex items-center justify-between cursor-pointer"
                onClick={() => navigate(REVIEW_ROUTES.COMPETENCIES_DETAIL(comp.id))}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                      {comp.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      {comp.competency_type || 'soft_skill'}
                    </span>
                    {comp.is_required && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                        Required
                      </span>
                    )}
                  </div>
                  {comp.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{comp.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-xs text-gray-400 block">Default Weight</span>
                    <span className="text-sm font-semibold text-gray-800">{comp.default_weight || 10}%</span>
                  </div>
                  <ReviewStatusBadge status={comp.is_active ? 'active' : 'inactive'} size="sm" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <Award size={32} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm font-medium">No competencies created in this category yet</p>
            <p className="text-xs text-gray-400 mt-1">Click below to add the first competency</p>
            <button
              onClick={() => navigate(`${REVIEW_ROUTES.COMPETENCIES_CREATE}?category=${selected.id}`)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 inline-flex items-center gap-1.5"
            >
              <Plus size={14} /> Add First Competency
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryDetail;
