import React from 'react';
import { FiInbox } from 'react-icons/fi';
import ScoreCard from './ScoreCard';
import KPIEmptyState from '../common/KPIEmptyState';
import KPILoading from '../common/KPILoading';

const ScoreList = ({ scores, loading, onScoreClick, title = "Scores" }) => {
    if (loading) {
        return <KPILoading text="Loading scores..." />;
    }

    if (!scores || scores.length === 0) {
        return (
            <KPIEmptyState 
                icon={<FiInbox size={40} />}
                title="No Scores Available"
                description="No scores have been calculated for this period."
            />
        );
    }

    return (
        <div className="kpi-score-list">
            <div className="kpi-score-list-header">
                <h3 className="kpi-score-list-title">{title}</h3>
                <span className="kpi-score-list-count">{scores.length} items</span>
            </div>
            <div className="kpi-score-list-grid">
                {scores.map(score => (
                    <ScoreCard key={score.id} score={score} onClick={onScoreClick} />
                ))}
            </div>
        </div>
    );
};

export default ScoreList;