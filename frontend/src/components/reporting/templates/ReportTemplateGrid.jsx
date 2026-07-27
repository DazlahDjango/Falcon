import React, { useState } from 'react';
import ReportTemplateCard from './ReportTemplateCard';

export const ReportTemplateGrid = ({ templates, onGenerate, onDuplicate }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filtered = templates.filter((tpl) => {
    const matchesSearch = tpl.name.toLowerCase().includes(search.toLowerCase()) ||
      tpl.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || tpl.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Search templates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: 8,
            background: 'rgba(30, 41, 59, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#f8fafc',
            fontSize: 14
          }}
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{
            padding: '10px 14px',
            borderRadius: 8,
            background: '#1e293b',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#f8fafc',
            fontSize: 14
          }}
        >
          <option value="all">All Categories</option>
          <option value="production">Production</option>
          <option value="system">System</option>
        </select>
      </div>
      <div className="reporting-grid">
        {filtered.map((tpl) => (
          <ReportTemplateCard
            key={tpl.id || tpl.code}
            template={tpl}
            onGenerate={onGenerate}
            onDuplicate={onDuplicate}
          />
        ))}
      </div>
    </div>
  );
};

export default ReportTemplateGrid;
