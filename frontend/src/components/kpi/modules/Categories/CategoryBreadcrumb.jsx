import React from 'react';
import { FiHome } from 'react-icons/fi';

const CategoryBreadcrumb = ({ categories, selectedCategory, onNavigate }) => {
    const getBreadcrumbPath = () => {
        if (!selectedCategory) return [];

        const path = [];
        let current = selectedCategory;

        while (current) {
            path.unshift(current);
            current = categories.find(c => c.id === current.parent);
        }

        return path;
    };

    const breadcrumbPath = getBreadcrumbPath();

    if (breadcrumbPath.length === 0) return null;

    return (
        <div className="category-breadcrumb">
            <button className="breadcrumb-home" onClick={() => onNavigate(null)}>
                <FiHome size={14} />
                All Categories
            </button>
            {breadcrumbPath.map((cat, index) => (
                <React.Fragment key={cat.id}>
                    <span className="breadcrumb-separator">›</span>
                    <button
                        className={`breadcrumb-item ${index === breadcrumbPath.length - 1 ? 'active' : ''}`}
                        onClick={() => onNavigate(cat)}
                    >
                        {cat.name}
                    </button>
                </React.Fragment>
            ))}
        </div>
    );
};

export default CategoryBreadcrumb;