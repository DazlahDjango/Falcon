import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { Activity } from 'lucide-react';

const HierarchyHealthGauge = ({ score, title = 'Hierarchy Health Score', height = 250, className = '' }) => {
  const chartRef = useRef(null);
  let chartInstance = null;
  useEffect(() => {
    if (!chartRef.current) return;
    chartInstance = echarts.init(chartRef.current);
    const getColor = () => {
      if (score >= 80) return '#10b981';
      if (score >= 50) return '#f59e0b';
      return '#ef4444';
    };
    const option = {
      series: [{
        type: 'gauge',
        center: ['50%', '50%'],
        radius: '80%',
        min: 0,
        max: 100,
        splitNumber: 5,
        progress: { show: true, width: 18, itemStyle: { color: getColor() } },
        axisLine: { lineStyle: { width: 18, color: [[0.8, '#10b981'], [0.5, '#f59e0b'], [0, '#ef4444']] } },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        pointer: { show: false },
        detail: {
          offsetCenter: [0, 20],
          valueAnimation: true,
          fontSize: 24,
          fontWeight: 'bold',
          color: getColor(),
          formatter: '{value}',
        },
        title: { show: false },
        data: [{ value: score, name: 'Health Score' }],
      }],
    };
    chartInstance.setOption(option);
    return () => {
      if (chartInstance) chartInstance.dispose();
    };
  }, [score]);
  useEffect(() => {
    const handleResize = () => chartInstance?.resize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const getStatus = () => {
    if (score >= 80) return { label: 'Excellent', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 60) return { label: 'Good', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (score >= 40) return { label: 'Fair', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { label: 'Poor', color: 'text-red-600', bg: 'bg-red-100' };
  };
  const status = getStatus();

  return (
    <div className={`chart-container ${className}`}>
      <div className="chart-title">
        <Activity size={16} className="text-purple-500" />
        <span>{title}</span>
      </div>
      <div ref={chartRef} style={{ height: `${height}px`, width: '100%' }} />
      <div className="text-center mt-2">
        <span className={`px-2 py-1 rounded-full text-xs ${status.bg} ${status.color}`}>
          {status.label}
        </span>
      </div>
    </div>
  );
};
export default HierarchyHealthGauge;