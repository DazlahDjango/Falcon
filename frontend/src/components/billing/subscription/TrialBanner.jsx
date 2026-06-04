import React from 'react';
import { FiRocket, FiClock } from 'react-icons/fi';
import './subscription.css';

export const TrialBanner = ({ daysRemaining, onUpgrade }) => {
    const isUrgent = daysRemaining <= 3;

    return (
        <div className={`trial-banner ${isUrgent ? 'urgent' : ''}`}>
            <div className="trial-banner-icon"><FiRocket /></div>
            <div className="trial-banner-content">
                <h4>{isUrgent ? 'Your Trial is Ending Soon!' : 'You\'re on a Free Trial'}</h4>
                <p>{daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining in your trial period.</p>
            </div>
            <button className="trial-banner-action" onClick={onUpgrade}>Upgrade Now</button>
            <div className="trial-banner-clock"><FiClock /></div>
        </div>
    );
};

export default TrialBanner;