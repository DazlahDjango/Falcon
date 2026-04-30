import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

const SunburstChart = ({ data, onNodeClick, height = 500, className = '' }) => {
  const chartRef = useRef(null);
  let chartInstance = null;
  useEffect(() => {
    if (!chartRef.current || !data) return;
    chartInstance = echarts.init(chartRef.current);
    const option = {
      tooltip: {
        trigger: 'item',
        formatter: (params) => {
          return `<strong>${params.name}</strong><br/>
                  Value: ${params.value || 0}<br/>
                  ${params.data.code || ''}`;
        },
      },
      series: [{
        type: 'sunburst',
        data: data,
        radius: [0, '90%'],
        center: ['50%', '50%'],
        sort: undefined,
        emphasis: {
          focus: 'descendant',
        },
        label: {
          rotate: 'radial',
          fontWeight: 'normal',
          fontSize: 11,
        },
        levels: [
          { radius: '15%', label: { fontSize: 12, fontWeight: 'bold' } },
          { radius: '30%', label: { fontSize: 11 } },
          { radius: '50%', label: { fontSize: 10 } },
          { radius: '70%', label: { fontSize: 9 } },
          { radius: '85%', label: { fontSize: 8 } },
        ],
      }],
      toolbox: {
        feature: {
          saveAsImage: { title: 'Save as Image' },
          restore: { title: 'Reset' },
        },
      },
    };
    chartInstance.setOption(option);
    chartInstance.on('click', (params) => {
      if (params.data && params.data.id && onNodeClick) {
        onNodeClick(params.data);
      }
    });
    return () => {
      if (chartInstance) {
        chartInstance.dispose();
      }
    };
  }, [data, onNodeClick]);
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
      className={`sunburst-chart ${className}`}
      style={{ height: `${height}px`, width: '100%' }}
    />
  );
};
export default SunburstChart;