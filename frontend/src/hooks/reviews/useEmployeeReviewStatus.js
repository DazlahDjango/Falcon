// src/hooks/reviews/useEmployeeReviewStatus.js
import { useSelector } from 'react-redux';
import { useMemo } from 'react';
import { selectEmployeeReviewStatus } from '../../store/reviews/selectors';

const useEmployeeReviewStatus = (employeeId, cycleId) => {
  const status = useSelector((state) =>
    selectEmployeeReviewStatus(state, employeeId, cycleId)
  );

  const result = useMemo(() => {
    const { selfAssessment, supervisorReview, finalRating } = status;

    return {
      ...status,
      // Derived statuses
      selfAssessmentStatus: selfAssessment?.status || 'not_started',
      supervisorReviewStatus: supervisorReview?.status || 'not_started',
      finalRatingStatus: finalRating?.status || 'not_started',

      // Progress
      progress: {
        selfAssessment: selfAssessment?.status === 'submitted' ? 100 : 0,
        supervisorReview: supervisorReview?.status === 'approved' ? 100 : 0,
        finalRating: finalRating?.status === 'locked' ? 100 : 0,
        overall: [
          selfAssessment?.status === 'submitted' ? 1 : 0,
          supervisorReview?.status === 'approved' ? 1 : 0,
          finalRating?.status === 'locked' ? 1 : 0,
        ].reduce((a, b) => a + b, 0) * 33.33,
      },

      // Is complete
      isComplete: !!(
        selfAssessment &&
        supervisorReview &&
        finalRating &&
        selfAssessment.status === 'submitted' &&
        supervisorReview.status === 'approved' &&
        finalRating.status === 'locked'
      ),

      // Steps
      steps: {
        selfAssessment: {
          completed: selfAssessment?.status === 'submitted',
          label: 'Self Assessment',
          status: selfAssessment?.status || 'pending',
        },
        supervisorReview: {
          completed: supervisorReview?.status === 'approved',
          label: 'Supervisor Review',
          status: supervisorReview?.status || 'pending',
        },
        finalRating: {
          completed: finalRating?.status === 'locked',
          label: 'Final Rating',
          status: finalRating?.status || 'pending',
        },
      },
    };
  }, [status]);

  return result;
};

export default useEmployeeReviewStatus;