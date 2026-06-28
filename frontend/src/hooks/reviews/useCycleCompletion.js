// src/hooks/reviews/useCycleCompletion.js
import { useSelector } from 'react-redux';
import { useMemo } from 'react';
import { selectCycleCompletionStatus } from '../../store/reviews/selectors';

const useCycleCompletion = (cycleId) => {
  const completion = useSelector((state) =>
    selectCycleCompletionStatus(state, cycleId)
  );

  const result = useMemo(() => {
    if (!completion) return null;

    const { total, selfAssessment, supervisorReview, finalRating, overall } = completion;

    return {
      ...completion,
      // Overall status
      status: overall.percentage === 100 ? 'complete' :
              overall.percentage >= 75 ? 'almost_complete' :
              overall.percentage >= 50 ? 'in_progress' :
              overall.percentage >= 25 ? 'started' : 'not_started',

      // Current step
      currentStep: finalRating.percentage < 100 ? 'final_rating' :
                    supervisorReview.percentage < 100 ? 'supervisor_review' :
                    selfAssessment.percentage < 100 ? 'self_assessment' : 'complete',

      // Next action needed
      nextAction: finalRating.percentage < 100 ? 'Complete final ratings' :
                   supervisorReview.percentage < 100 ? 'Complete supervisor reviews' :
                   selfAssessment.percentage < 100 ? 'Complete self assessments' : 'All complete',

      // Summary
      summary: {
        completed: overall.completed,
        pending: overall.pending,
        percentage: overall.percentage,
        total,
      },

      // Detailed progress
      details: {
        selfAssessment: {
          ...selfAssessment,
          status: selfAssessment.percentage === 100 ? 'complete' :
                  selfAssessment.percentage >= 50 ? 'in_progress' : 'pending',
        },
        supervisorReview: {
          ...supervisorReview,
          status: supervisorReview.percentage === 100 ? 'complete' :
                  supervisorReview.percentage >= 50 ? 'in_progress' : 'pending',
        },
        finalRating: {
          ...finalRating,
          status: finalRating.percentage === 100 ? 'complete' :
                  finalRating.percentage >= 50 ? 'in_progress' : 'pending',
        },
      },

      // Is behind schedule
      isBehindSchedule: overall.percentage < 50,
      isOnTrack: overall.percentage >= 50,
    };
  }, [completion]);

  return result;
};

export default useCycleCompletion;