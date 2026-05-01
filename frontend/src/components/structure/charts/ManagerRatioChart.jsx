import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { Users } from 'lucide-react';

const ManagerRatioChart = ({ managers, nonManagers, title = 'Manager vs Non-Manager', height = 250, className = '' }) => {
  const chartRef = useRef(null);
  let chartInstance = null;
  useEffect(() => {
    if (!chartRef.current) return;
    chartInstance = echarts.init(chartRef.current);
    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {d}% ({c})',
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        textStyle: { fontSize: 11 },
      },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '50%'],
        data: [
          { name: 'Managers', value: managers, itemStyle: { color: '#3b82f6' } },
          { name: 'Non-Managers', value: nonManagers, itemStyle: { color: '#10b981' } },
        ],
        label: { show: true, formatter: '{b}: {d}%', fontSize: 12 },
        emphasis: { scale: true },
      }],
      toolbox: {
        feature: {
          saveAsImage: { title: 'Save as Image' },
        },
      },
    };
    chartInstance.setOption(option);
    return () => {
      if (chartInstance) chartInstance.dispose();
    };
  }, [managers, nonManagers]);
  useEffect(() => {
    const handleResize = () => chartInstance?.resize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const total = managers + nonManagers;
  const ratio = total > 0 ? (managers / total * 100).toFixed(1) : 0;

  return (
    <div className={`chart-container ${className}`}>
      <div className="chart-title">
        <Users size={16} className="text-blue-500" />
        <span>{title}</span>
      </div>
      <div className="chart-subtitle">Management Ratio: {ratio}%</div>
      <div ref={chartRef} style={{ height: `${height}px`, width: '100%' }} />
    </div>
  );
};
export default ManagerRatioChart;