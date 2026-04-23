import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import * as echarts from 'echarts';

const GaugeChart = ({ data, options, height, width, title }) => {
    const chartRef = useRef(null);
    let chartInstance = null;
    useEffect(() => {
        if (chartRef.current) {
            chartInstance = echarts.init(chartRef.current);
            const value = data?.value || 0;
            const thresholds = {
                green: data?.greenThreshold || 90,
                yellow: data?.yellowThreshold || 50,
            };
            let color = '#ef4444';
            if (value >= thresholds.green) color = '#22c55e';
            else if (value >= thresholds.yellow) color = '#eab308';
            const defaultOptions = {
                tooltip: {
                    formatter: `{b}: {c}%`,
                },
                series: [
                    {
                        name: title || 'Score',
                        type: 'gauge',
                        center: ['50%', '50%'],
                        radius: '80%',
                        min: 0,
                        max: 100,
                        splitNumber: 5,
                        progress: {
                            show: true,
                            width: 18,
                            itemStyle: {
                                color: color,
                            },
                        },
                        axisLine: {
                            lineStyle: {
                                width: 18,
                                color: [
                                    [thresholds.yellow / 100, '#eab308'],
                                    [thresholds.green / 100, '#22c55e'],
                                    [1, '#ef4444'],
                                ],
                            },
                        },
                        axisTick: { show: false },
                        splitLine: { show: false },
                        axisLabel: { show: false },
                        pointer: { show: true, length: '70%', width: 8 },
                        detail: {
                            offsetCenter: [0, 25],
                            valueAnimation: true,
                            fontSize: 24,
                            fontWeight: 'bold',
                            color: color,
                        },
                        title: { show: true, offsetCenter: [0, -20] },
                        data: [{ value: value, name: title || 'Score' }],
                    },
                ],
            };
            chartInstance.setOption({ ...defaultOptions, ...options });
        }
        return () => {
            if (chartInstance) {
                chartInstance.dispose();
            }
        };
    }, [data, options, title]);
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
GaugeChart.propTypes = {
    data: PropTypes.shape({
        value: PropTypes.number,
        greenThreshold: PropTypes.number,
        yellowThreshold: PropTypes.number,
    }).isRequired,
    options: PropTypes.object,
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    title: PropTypes.string,
};
GaugeChart.defaultProps = {
    options: {},
    height: 200,
    width: '100%',
    title: '',
};
export default GaugeChart;