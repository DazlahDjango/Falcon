import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { GitBranch } from 'lucide-react';

const SpanOfControlChart = ({ data, title = 'Span of Control Distribution', height = 300, className = '' }) => {
  const chartRef = useRef(null);
  let chartInstance = null;
  useEffect(() => {
    if (!chartRef.current || !data) return;
    chartInstance = echarts.init(chartRef.current);
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: '{b}: {c} managers',
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: { type: 'category', data: data.map(d => d.range), axisLabel: { rotate: 0, fontSize: 11 } },
      yAxis: { type: 'value', name: 'Number of Managers' },
      series: [{
        type: 'bar',
        data: data.map(d => d.count),
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: (params) => {
            const ranges = ['0', '1-5', '6-10', '11-15', '16-20', '20+'];
            const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#dc2626'];
            return colors[ranges.indexOf(params.name)];
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
  const healthyCount = data.find(d => d.range === '1-5' || d.range === '6-10')?.count || 0;
  const warningCount = data.find(d => d.range === '11-15' || d.range === '16-20')?.count || 0;
  const criticalCount = data.find(d => d.range === '20+')?.count || 0;

  return (
    <div className={`chart-container ${className}`}>
      <div className="chart-title">
        <GitBranch size={16} className="text-purple-500" />
        <span>{title}</span>
      </div>
      <div className="flex gap-3 mb-3 text-xs">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Healthy: {healthyCount}</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500" /> Warning: {warningCount}</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Critical: {criticalCount}</span>
      </div>
      <div ref={chartRef} style={{ height: `${height}px`, width: '100%' }} />
    </div>
  );
};
export default SpanOfControlChart;