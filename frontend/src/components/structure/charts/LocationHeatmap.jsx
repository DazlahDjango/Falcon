import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { MapPin } from 'lucide-react';

const LocationHeatmap = ({ data, title = 'Geographic Distribution', height = 350, className = '' }) => {
  const chartRef = useRef(null);
  let chartInstance = null;
  useEffect(() => {
    if (!chartRef.current || !data) return;
    chartInstance = echarts.init(chartRef.current);
    const countries = data.map(d => d.country);
    const counts = data.map(d => d.count);
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: '{b}: {c} employees',
      },
      grid: {
        left: '10%',
        right: '5%',
        bottom: '5%',
        containLabel: true,
      },
      xAxis: { type: 'category', data: countries, axisLabel: { rotate: 45, fontSize: 10 } },
      yAxis: { type: 'value', name: 'Number of Employees' },
      series: [{
        type: 'bar',
        data: counts,
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [{ offset: 0, color: '#3b82f6' }, { offset: 1, color: '#8b5cf6' }],
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
  return (
    <div className={`chart-container ${className}`}>
      <div className="chart-title">
        <MapPin size={16} className="text-red-500" />
        <span>{title}</span>
      </div>
      <div ref={chartRef} style={{ height: `${height}px`, width: '100%' }} />
    </div>
  );
};

export default LocationHeatmap;