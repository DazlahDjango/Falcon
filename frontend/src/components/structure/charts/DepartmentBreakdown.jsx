import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { PieChart } from 'lucide-react';

const DepartmentBreakdown = ({ data, title = 'Department Distribution', height = 300, className = '' }) => {
  const chartRef = useRef(null);
  let chartInstance = null;

  useEffect(() => {
    if (!chartRef.current || !data) return;
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
        formatter: (name) => {
          const item = data.find(d => d.name === name);
          return `${name}: ${item?.value || 0}`;
        },
      },
      series: [{
        type: 'pie',
        radius: '55%',
        center: ['50%', '50%'],
        data: data,
        emphasis: { scale: true },
        label: { show: true, formatter: '{b}', position: 'outside', fontSize: 10 },
        labelLine: { length: 5, length2: 5, smooth: true },
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2,
        },
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

  return (
    <div className={`chart-container ${className}`}>
      <div className="chart-title">
        <PieChart size={16} className="text-purple-500" />
        <span>{title}</span>
      </div>
      <div ref={chartRef} style={{ height: `${height}px`, width: '100%' }} />
    </div>
  );
};
export default DepartmentBreakdown;