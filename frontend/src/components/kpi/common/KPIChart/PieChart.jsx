import React, { useRef, useEffect } from "react";
import PropTypes from 'prop-types';
import * as echarts from 'echarts';

const PieChart = ({ data, options, height, width }) => {
    const chartRef = useRef(null);
    let chartInstance = null;
    useEffect(() => {
        if (chartRef.current) {
            chartInstance = echarts.init(chartRef.current);
            const defaultOptions = {
                tooltip: {
                    trigger: 'item',
                    formatter: '{b}: {d}%',
                },
                legend: {
                    orient: 'vertical',
                    left: 'left',
                    data: data?.labels || [],
                },
                series: [
                    {
                        name: data?.title || 'Distribution',
                        type: 'pie',
                        radius: '55%',
                        center: ['50%', '50%'],
                        data: data?.values?.map((value, index) => ({
                            name: data.labels[index],
                            value: value,
                            itemStyle: {
                                color: data?.colors?.[index] || `hsl(${index * 45}, 70%, 50%)`,
                            },
                        })),
                        emphasis: {
                            itemStyle: {
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.5)',
                            },
                        },
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
PieChart.propTypes = {
    data: PropTypes.shape({
        labels: PropTypes.array,
        values: PropTypes.array,
        colors: PropTypes.array,
        title: PropTypes.string,
    }).isRequired,
    options: PropTypes.object,
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};
PieChart.defaultProps = {
    options: {},
    height: 300,
    width: '100%',
};
export default PieChart;