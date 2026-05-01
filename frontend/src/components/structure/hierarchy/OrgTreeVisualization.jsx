import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

const OrgTreeVisualization = ({ data, onNodeClick, height = 600, className = '' }) => {
  const chartRef = useRef(null);
  let chartInstance = null;
  useEffect(() => {
    if (!chartRef.current || !data) return;
    chartInstance = echarts.init(chartRef.current);
    const option = {
      tooltip: {
        trigger: 'item',
        triggerOn: 'mousemove',
        formatter: (params) => {
          if (params.data && params.data.name) {
            return `<strong>${params.data.name}</strong><br/>
                    ${params.data.code || ''}<br/>
                    Employees: ${params.data.stats?.employee_count || 0}`;
          }
          return params.name;
        },
      },
      series: [{
        type: 'tree',
        data: [data],
        layout: 'orthogonal',
        orient: 'LR',
        symbol: 'emptyCircle',
        symbolSize: 12,
        edgeShape: 'polyline',
        edgeLabel: { fontSize: 10 },
        initialTreeDepth: 2,
        roam: true,
        expandAndCollapse: true,
        label: {
          position: 'right',
          rotate: 0,
          offset: [10, 0],
          fontSize: 12,
          formatter: (params) => {
            return `${params.name}\n${params.data.code || ''}`;
          },
        },
        leaves: { label: { position: 'right', offset: [10, 0] } },
        lineStyle: { color: '#c0c4cc', width: 1.5, curveness: 0.5 },
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
      className={`org-tree-visualization ${className}`}
      style={{ height: `${height}px` }}
    />
  );
};

export default OrgTreeVisualization;