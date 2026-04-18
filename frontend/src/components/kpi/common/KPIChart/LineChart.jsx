import React, { useRef, useEffect } from 'react';
import PropTypes, { symbol } from 'prop-types';
import * as echarts from 'echarts';

const LineChart = ({ data, options, height, width }) => {
    const chartRef = useRef(null);
    let chartInstance = null;
    useEffect(() => {
        if (chartRef.current) {
            chartInstance = echarts.init(chartRef.current);
            const defaultOptions = {
                tooltip: {
                    trigger: 'axis',
                    axisPointer: { type: 'shadow'},
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true,
                },
                xAxis: {
                    type: 'category',
                    data: data?.labels || [],
                    boundaryGap: false,
                },
                yAxis: {
                    type: 'value',
                    name: data?.yAxisLabel || 'Score (%)',
                    min: 0,
                    max: 100,
                },
                series: data?.datasets?.map(dataset => ({
                    name: dataset.label,
                    type: 'line',
                    data: dataset.data,
                    smooth: true,
                    symbol: 'circle',
                    symbolSize: 8,
                    lineStyle: {
                        width: 3,
                        color: dataset.color || '#3b82f6',
                    },
                    areaStyle: dataset.area ? {
                        opacity: 0.3,
                        color: dataset.color || '#3b82f6',
                    } : undefined,
                })),
            };
            chartInstance.setOption({ ...defaultOptions, ...options });
        }
        return () => {
            if (chartInstance) {
                chartInstance.dispose();
            }
        };
    }, [data, options]);
    useEffect(() => {
        const handleResize = () => {
            if (chartInstance) {
                chartInstance.resize();
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return (
        <div 
            ref={chartRef} 
            style={{ height: typeof height === 'number' ? `${height}px` : height, width }}
        />
    );
};
LineChart.propTypes = {
    data: PropTypes.shape({
        labels: PropTypes.array,
        datasets: PropTypes.array,
        yAxisLabel: PropTypes.string,
    }).isRequired,
    options: PropTypes.object,
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};
LineChart.defaultProps = {
    options: {},
    height: 300,
    width: '100%',
};
export default LineChart;