import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { TrendingUp } from 'lucide-react';

const LevelDistribution = ({ data, title = 'Position Level Distribution', height = 300, className = '' }) => {
  const chartRef = useRef(null);
  let chartInstance = null;
  useEffect(() => {
    if (!chartRef.current || !data) return;
    chartInstance = echarts.init(chartRef.current);
    const levels = data.map(d => `Level ${d.level}`);
    const counts = data.map(d => d.count);
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: { type: 'category', data: levels, axisLabel: { rotate: 0, fontSize: 10 } },
      yAxis: { type: 'value', name: 'Number of Positions' },
      series: [{
        type: 'bar',
        data: counts,
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: (params) => {
            const level = params.dataIndex + 1;
            if (level <= 3) return '#ef4444';
            if (level <= 6) return '#f59e0b';
            if (level <= 9) return '#10b981';
            return '#3b82f6';
          },
        },
        label: { show: true, position: 'top', formatter: '{c}' },
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
  }, [data]);
  useEffect(() => {
    const handleResize = () => chartInstance?.resize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const executiveCount = data.filter(d => d.level <= 3).reduce((sum, d) => sum + d.count, 0);
  const seniorCount = data.filter(d => d.level >= 4 && d.level <= 6).reduce((sum, d) => sum + d.count, 0);
  const midCount = data.filter(d => d.level >= 7 && d.level <= 9).reduce((sum, d) => sum + d.count, 0);
  const juniorCount = data.filter(d => d.level >= 10).reduce((sum, d) => sum + d.count, 0);

  return (
    <div className={`chart-container ${className}`}>
      <div className="chart-title">
        <TrendingUp size={16} className="text-orange-500" />
        <span>{title}</span>
      </div>
      <div className="flex flex-wrap gap-2 mb-3 text-xs">
        <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700">Executive (L1-3): {executiveCount}</span>
        <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">Senior (L4-6): {seniorCount}</span>
        <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700">Mid (L7-9): {midCount}</span>
        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Junior (L10+): {juniorCount}</span>
      </div>
      <div ref={chartRef} style={{ height: `${height}px`, width: '100%' }} />
    </div>
  );
};
export default LevelDistribution;