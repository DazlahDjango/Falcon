/** Map executive dashboard API (snake_case) to UI props (camelCase). */
export const mapExecutiveDashboardApi = (data) => {
    if (!data) return null;
    return {
        overallHealth: data.overall_health ?? 0,
        redKPICount: data.red_kpi_count ?? 0,
        redKPIPercentage: data.red_kpi_percentage ?? 0,
        validationCompliance: data.validation_compliance ?? 0,
        departmentRankings: (data.department_rankings || []).map((d, i) => ({
            departmentId: d.department_id,
            department: d.department,
            score: d.score,
            rank: d.rank ?? i + 1,
        })),
        trendData: data.trend_data || [],
        totalKPIs: data.total_kpis ?? 0,
        greenCount: data.green_count ?? 0,
        yellowCount: data.yellow_count ?? 0,
        redCount: data.red_count ?? 0,
        riskIndicators: data.risk_indicators,
    };
};
