import React from 'react';
import { ScoreList } from '../../../components/kpi';
import { useScores } from '../../../hooks/kpi';

const ScoresPage = () => {
    const { scores, loading, error } = useScores();

    return (
        <div className="kpi-page-container">
            <ScoreList scores={scores} loading={loading} error={error} />
        </div>
    );
};

export default ScoresPage;