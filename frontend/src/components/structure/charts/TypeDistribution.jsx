import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { Briefcase } from 'lucide-react';

const TypeDistribution = ({ data, title = 'Employment Type Distribution', height = 300, className = '' }) => {
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
      },
      series: [{
        type: 'pie',
        radius: '55%',
        center: ['50%', '50%'],
        data: data,
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
  const permanent = data.find(d => d.name === 'permanent')?.value || 0;
  const contract = data.find(d => d.name === 'contract')?.value || 0;
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className={`chart-container ${className}`}>
      <div className="chart-title">
        <Briefcase size={16} className="text-green-500" />
        <span>{title}</span>
      </div>
      <div className="chart-subtitle">Permanent: {((permanent / total) * 100).toFixed(1)}% | Contract: {((contract / total) * 100).toFixed(1)}%</div>
      <div ref={chartRef} style={{ height: `${height}px`, width: '100%' }} />
    </div>
  );
};
export default TypeDistribution;