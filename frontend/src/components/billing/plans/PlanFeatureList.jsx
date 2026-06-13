import React, { useState } from 'react';
import { FiCheck, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import './plans.css';

export const PlanFeatureList = ({ features, limit = 6, showAll = false }) => {
    const [expanded, setExpanded] = useState(showAll);
    const displayFeatures = expanded ? features : features?.slice(0, limit);
    const hasMore = features?.length > limit;

    if (!features?.length) return <div className="feature-list-empty">No features listed</div>;

    return (
        <div className="plan-feature-list">
            <ul>
                {displayFeatures?.map((feature, index) => (
                    <li key={index}>
                        <FiCheck className="feature-check" />
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>
            {hasMore && (
                <button className="feature-expand-btn" onClick={() => setExpanded(!expanded)}>
                    {expanded ? <><FiChevronUp /> Show Less</> : <><FiChevronDown /> Show {features.length - limit} More</>}
                </button>
            )}
        </div>
    );
};

export default PlanFeatureList;