// src/components/reviews/reviewDashboard/ReviewAddWidgetButton.jsx
import React from 'react';
import './dashboard.css';

const ReviewAddWidgetButton = ({ onClick, label = 'Add Widget' }) => {
    return (
        <button className="add-widget-button" onClick={onClick}>
            <span>+</span>
            <span>{label}</span>
        </button>
    );
};

export default ReviewAddWidgetButton;