import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { TrendingUp } from 'lucide-react';

const HeadcountTrend = ({ data, title = 'Headcount Trend', height = 300, className = '' }) => {
  const chartRef = useRef(null);
  let chartInstance = null;
  useEffect(() => {
    if (!chartRef.current || !data) return;
    chartInstance = echarts.init(chartRef.current);
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
      },
      legend: {
        data: ['Total Headcount', 'New Hires', 'Departures'],
        textStyle: { fontSize: 11 },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: { type: 'category', data: data.map(d => d.month), axisLabel: { rotate: 45, fontSize: 10 } },
      yAxis: { type: 'value', name: 'Count' },
      series: [
        {
          name: 'Total Headcount',
          type: 'line',
          data: data.map(d => d.total),
          smooth: true,
          lineStyle: { color: '#3b82f6', width: 2 },
          areaStyle: { opacity: 0.1, color: '#3b82f6' },
          symbol: 'circle',
          symbolSize: 6,
        },
        {
          name: 'New Hires',
          type: 'bar',
          data: data.map(d => d.new_hires),
          barWidth: '30%',
          itemStyle: { color: '#10b981', borderRadius: [4, 4, 0, 0] },
        },
        {
          name: 'Departures',
          type: 'bar',
          data: data.map(d => d.departures),
          barWidth: '30%',
          itemStyle: { color: '#ef4444', borderRadius: [4, 4, 0, 0] },
        },
      ],
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

  return (
    <div className={`chart-container ${className}`}>
      <div className="chart-title">
        <TrendingUp size={16} className="text-blue-500" />
        <span>{title}</span>
      </div>
      <div ref={chartRef} style={{ height: `${height}px`, width: '100%' }} />
    </div>
  );
};
export default HeadcountTrend;