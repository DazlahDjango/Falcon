// src/components/reviews/cycles/detail/CycleProgress.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import { selectCycleProgress } from '../../../../store/reviews/selectors';
import { ReviewLoading } from '../../common';

const CycleProgress = ({ cycleId }) => {
  const progress = useSelector((state) => selectCycleProgress(state));

  if (!progress) return <ReviewLoading size="sm" text="Loading progress..." />;

  const stages = [
    {
      key: 'self_assessment',
      label: 'Self Assessment',
      completed: progress.self_assessment_submitted || 0,
      total: progress.total_employees || 1,
      percentage: progress.self_assessment_percentage || 0,
    },
    {
      key: 'supervisor_review',
      label: 'Supervisor Review',
      completed: progress.supervisor_review_completed || 0,
      total: progress.total_employees || 1,
      percentage: progress.supervisor_review_percentage || 0,
    },
    {
      key: 'final_rating',
      label: 'Final Rating',
      completed: progress.final_rating_locked || 0,
      total: progress.total_employees || 1,
      percentage: progress.final_rating_percentage || 0,
    },
  ];

  return (
    <div className="cycle-progress">
      <div className="cycle-progress-header">
        <h3 className="cycle-progress-title">Progress Overview</h3>
        <span className="cycle-progress-overall">
          Overall: {progress.overall_completion_percentage || 0}%
        </span>
      </div>

      <div className="cycle-progress-bar">
        <div
          className="cycle-progress-fill"
          style={{ width: `${progress.overall_completion_percentage || 0}%` }}
        />
      </div>

      <div className="cycle-progress-stages">
        {stages.map((stage) => (
          <div key={stage.key} className="cycle-progress-stage">
            <div className="cycle-progress-stage-header">
              <span className="cycle-progress-stage-label">{stage.label}</span>
              <span className="cycle-progress-stage-stats">
                {stage.completed} / {stage.total}
              </span>
            </div>
            <div className="cycle-progress-stage-bar">
              <div
                className="cycle-progress-stage-fill"
                style={{ width: `${stage.percentage}%` }}
              />
            </div>
            <span className="cycle-progress-stage-percentage">{stage.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CycleProgress;