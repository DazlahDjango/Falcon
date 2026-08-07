// src/pages/reviews/rating-scales/RatingScaleCreatePage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { RatingScaleCreate } from '../../../components/reviews/rating-scales';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';
import '../pages.css';

const RatingScaleCreatePage = () => {
  const navigate = useNavigate();
  const { canManageRatingScales, isAdmin } = useReviewsPermissions();
  const [showGuide, setShowGuide] = useState(false);

  if (!canManageRatingScales && !isAdmin) {
    return (
      <div className="reviews-page">
        <div className="reviews-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to create rating scales.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reviews-page">
      <div className="reviews-page-header">
        <button className="reviews-page-back" onClick={() => navigate('/reviews/rating-scales')}>
          <ArrowLeft size={20} />
          Back to Rating Scales
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'Rating Scales', path: '/reviews/rating-scales' },
            { label: 'Create', path: '/reviews/rating-scales/create', isActive: true },
          ]}
        />
        <div className="flex justify-between items-center mt-2 flex-wrap gap-2">
          <h1 className="reviews-page-title flex items-center gap-2">
            <Plus size={24} />
            Create Rating Scale
          </h1>
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
          >
            {showGuide ? 'Hide Setup Guide' : 'Show Setup Guide'}
          </button>
        </div>
      </div>

      {/* Guide Card */}
      {showGuide && (
        <div className="reviews-page-section mb-6">
          <div className="reviews-page-section-content p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <span>💡</span> Setup Guide: Standard Corporate 5-Point Scale
            </h3>
            <p className="text-blue-800 text-sm mb-3">
              To create a standard rating scale, define a name (e.g. "Standard 5-Point Scale"), set min to 1, max to 5, and add these levels:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
              <div>
                <strong>Min/Max values:</strong>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>Min Value: 1.0</li>
                  <li>Max Value: 5.0</li>
                </ul>
              </div>
              <div>
                <strong>Recommended Rating Levels:</strong>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>Level 1: 1.0 - Unsatisfactory (Red: #ef4444)</li>
                  <li>Level 2: 2.0 - Needs Improvement (Orange: #f97316)</li>
                  <li>Level 3: 3.0 - Meets Expectations (Blue: #3b82f6)</li>
                  <li>Level 4: 4.0 - Exceeds Expectations (Green: #22c55e)</li>
                  <li>Level 5: 5.0 - Outstanding (Purple: #8b5cf6)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="reviews-page-section">
        <div className="reviews-page-section-content">
          <RatingScaleCreate />
        </div>
      </div>
    </div>
  );
};

export default RatingScaleCreatePage;