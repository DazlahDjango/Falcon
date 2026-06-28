// src/hooks/reviews/usePerformanceMetrics.js
import { useSelector } from 'react-redux';
import { useMemo } from 'react';
import { selectPerformanceMetrics } from '../../store/reviews/selectors';

const usePerformanceMetrics = (employeeId) => {
  const metrics = useSelector((state) =>
    selectPerformanceMetrics(state, employeeId)
  );

  const result = useMemo(() => {
    const { ratings, pips, promotions, averageScore } = metrics;

    // Rating trends
    const ratingTrend = ratings
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      .map((r) => ({
        date: r.created_at,
        score: r.final_score,
        label: r.final_rating_label,
        cycle: r.review_cycle_name,
      }));

    // PIP history
    const pipHistory = pips.map((p) => ({
      id: p.id,
      title: p.title,
      startDate: p.start_date,
      endDate: p.end_date,
      status: p.status,
      outcome: p.outcome,
      severity: p.severity,
    }));

    // Promotion history
    const promotionHistory = promotions.map((p) => ({
      id: p.id,
      fromRole: p.current_role,
      toRole: p.recommended_role,
      date: p.actual_promotion_date || p.approved_at,
      status: p.status,
    }));

    // Performance summary
    const summary = {
      totalReviews: ratings.length,
      totalPIPs: pips.length,
      totalPromotions: promotions.length,
      averageScore,
      latestRating: ratings.length > 0 ? ratings[ratings.length - 1] : null,
      trend: ratingTrend,
      pipHistory,
      promotionHistory,
      isHighPerformer: averageScore >= 80,
      isLowPerformer: averageScore < 60,
      needsAttention: pips.some((p) => p.status === 'active' || p.status === 'draft'),
    };

    return summary;
  }, [metrics]);

  return result;
};

export default usePerformanceMetrics;