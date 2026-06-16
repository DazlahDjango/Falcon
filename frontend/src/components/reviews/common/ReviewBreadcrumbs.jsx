// src/components/reviews/common/ReviewBreadcrumbs.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const ReviewBreadcrumbs = ({
  items,
  className = '',
  separator = '/',
  homePath = '/reviews',
  homeLabel = 'Reviews',
}) => {
  const breadcrumbItems = [
    { label: homeLabel, path: homePath, isActive: false },
    ...items,
  ];

  return (
    <nav className={`review-breadcrumbs ${className}`} aria-label="Breadcrumb">
      <ol className="review-breadcrumbs-list">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;

          return (
            <li key={item.path || index} className="review-breadcrumbs-item">
              {isLast ? (
                <span className="review-breadcrumbs-current">{item.label}</span>
              ) : (
                <Link to={item.path} className="review-breadcrumbs-link">
                  {item.label}
                </Link>
              )}
              {!isLast && (
                <span className="review-breadcrumbs-separator">{separator}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

ReviewBreadcrumbs.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      path: PropTypes.string.isRequired,
      isActive: PropTypes.bool,
    })
  ).isRequired,
  className: PropTypes.string,
  separator: PropTypes.string,
  homePath: PropTypes.string,
  homeLabel: PropTypes.string,
};

export default ReviewBreadcrumbs;