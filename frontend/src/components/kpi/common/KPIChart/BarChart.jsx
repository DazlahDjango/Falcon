import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import * as echarts from 'echarts';

const BarChart = ({ data, options, height, width }) => {
    const chartRef = useRef(null);
    let chartInstance = null
    useEffect(() => {
        if (chartRef.current) {
            chartInstance = echarts.init(chartRef.current);
            const defaultOptions = {
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {type: 'shadow'},
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
                },
                yAxis: {
                    type: 'category',
                    data: data?.yAxisLabel || 'value',
                },
                series: data?.datasets?.map(dataset => ({
                    name: dataset.labels,
                    type: 'bar',
                    data: dataset.data,
                    barWidth: '60%',
                    itemStyle: {
                        borderRadius: [4, 4, 0, 0],
                        color: dataset.color || '#3b82f6',
                    },
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
BarChart.propTypes = {
    data: PropTypes.shape({
        labels: PropTypes.array,
        datasets: PropTypes.array,
        yAxisLabel: PropTypes.string,
    }).isRequired,
    options: PropTypes.object,
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};
BarChart.defaultProps = {
    options: {},
    height: 300,
    width: '100%',
};
export default BarChart;