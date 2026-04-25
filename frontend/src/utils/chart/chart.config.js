import { CHART_COLORS, CHART_DEFAULTS } from '../kpi/constants';

/**
 * Default chart configuration
 */
export const defaultChartConfig = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
        duration: CHART_DEFAULTS.ANIMATION_DURATION,
        easing: 'easeInOutQuart'
    },
    plugins: {
        legend: {
            position: 'top',
            labels: {
                font: {
                    family: CHART_DEFAULTS.FONT_FAMILY,
                    size: 12
                },
                usePointStyle: true,
                boxWidth: 8
            }
        },
        tooltip: {
            enabled: true,
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleFont: {
                family: CHART_DEFAULTS.FONT_FAMILY,
                size: 12
            },
            bodyFont: {
                family: CHART_DEFAULTS.FONT_FAMILY,
                size: 11
            },
            padding: 8,
            cornerRadius: 4
        }
    }
};

/**
 * Line chart configuration
 */
export const lineChartConfig = {
    ...defaultChartConfig,
    scales: {
        x: {
            grid: {
                display: false,
                drawBorder: true,
                drawOnChartArea: false
            },
            ticks: {
                font: {
                    family: CHART_DEFAULTS.FONT_FAMILY,
                    size: 11
                }
            }
        },
        y: {
            beginAtZero: true,
            max: 100,
            grid: {
                color: CHART_COLORS.LIGHT_GRAY,
                drawBorder: true
            },
            ticks: {
                font: {
                    family: CHART_DEFAULTS.FONT_FAMILY,
                    size: 11
                },
                callback: (value) => `${value}%`
            }
        }
    },
    elements: {
        line: {
            tension: 0.3,
            borderWidth: 2,
            fill: false
        },
        point: {
            radius: 4,
            hoverRadius: 6,
            borderWidth: 2,
            backgroundColor: CHART_COLORS.WHITE
        }
    }
};

/**
 * Bar chart configuration
 */
export const barChartConfig = {
    ...defaultChartConfig,
    scales: {
        x: {
            grid: {
                display: false
            },
            ticks: {
                font: {
                    family: CHART_DEFAULTS.FONT_FAMILY,
                    size: 11
                }
            }
        },
        y: {
            beginAtZero: true,
            grid: {
                color: CHART_COLORS.LIGHT_GRAY
            },
            ticks: {
                font: {
                    family: CHART_DEFAULTS.FONT_FAMILY,
                    size: 11
                }
            }
        }
    },
    elements: {
        bar: {
            borderRadius: 4,
            borderWidth: 0
        }
    }
};

/**
 * Pie chart configuration
 */
export const pieChartConfig = {
    ...defaultChartConfig,
    plugins: {
        ...defaultChartConfig.plugins,
        tooltip: {
            ...defaultChartConfig.plugins.tooltip,
            callbacks: {
                label: (context) => {
                    const label = context.label || '';
                    const value = context.raw || 0;
                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                    return `${label}: ${value} (${percentage}%)`;
                }
            }
        }
    }
};

/**
 * Gauge chart configuration
 */
export const gaugeChartConfig = {
    ...defaultChartConfig,
    scales: {
        angleLines: {
            display: false
        },
        ticks: {
            display: false
        }
    },
    plugins: {
        ...defaultChartConfig.plugins,
        tooltip: {
            enabled: true,
            callbacks: {
                label: (context) => `Score: ${context.raw}%`
            }
        }
    }
};