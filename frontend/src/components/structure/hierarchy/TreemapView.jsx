import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

const TreemapView = ({ data, onNodeClick, height = 500, className = '' }) => {
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
                  Employees: ${params.value || 0}<br/>
                  ${params.data.code || ''}`;
        },
      },
      series: [{
        type: 'treemap',
        data: data,
        leafDepth: 2,
        roam: true,
        nodeClick: 'zoomNode',
        breadcrumb: { show: true },
        label: {
          show: true,
          formatter: '{b}',
          fontSize: 11,
        },
        upperLabel: {
          show: true,
          height: 20,
        },
        colorMappingBy: 'value',
        visualDimension: 256,
        levels: [
          { colorSaturation: [0.3, 0.6], itemStyle: { borderWidth: 2, gapWidth: 2 } },
          { colorSaturation: [0.4, 0.7], itemStyle: { borderWidth: 1, gapWidth: 1 } },
          { colorSaturation: [0.5, 0.8], itemStyle: { borderWidth: 0, gapWidth: 0 } },
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
      className={`treemap-view ${className}`}
      style={{ height: `${height}px`, width: '100%' }}
    />
  );
};
export default TreemapView;