import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

const ForceDirectedGraph = ({ nodes, links, onNodeClick, height = 600, className = '' }) => {
  const chartRef = useRef(null);
  let chartInstance = null;
  useEffect(() => {
    if (!chartRef.current || !nodes || !links) return;
    chartInstance = echarts.init(chartRef.current);
    const option = {
      tooltip: {
        trigger: 'item',
        formatter: (params) => {
          if (params.dataType === 'node') {
            return `<strong>${params.name}</strong><br/>
                    Type: ${params.data.type || 'Department'}<br/>
                    ${params.data.code || ''}`;
          }
          return `${params.data.from} → ${params.data.to}`;
        },
      },
      series: [{
        type: 'graph',
        layout: 'force',
        force: {
          repulsion: 500,
          edgeLength: 100,
          gravity: 0.1,
          friction: 0.2,
          layoutAnimation: true,
        },
        data: nodes,
        links: links,
        roam: true,
        draggable: true,
        focusNodeAdjacency: true,
        edgeSymbol: ['none', 'arrow'],
        edgeSymbolSize: [0, 10],
        label: {
          show: true,
          position: 'right',
          fontSize: 11,
          formatter: '{b}',
        },
        lineStyle: {
          color: '#c0c4cc',
          width: 1.5,
          curveness: 0.3,
        },
        emphasis: {
          focus: 'adjacency',
          lineStyle: {
            width: 2,
            color: '#3b82f6',
          },
        },
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
      if (params.dataType === 'node' && params.data && params.data.id && onNodeClick) {
        onNodeClick(params.data);
      }
    });
    return () => {
      if (chartInstance) {
        chartInstance.dispose();
      }
    };
  }, [nodes, links, onNodeClick]);
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
      className={`force-directed-graph ${className}`}
      style={{ height: `${height}px`, width: '100%' }}
    />
  );
};
export default ForceDirectedGraph;