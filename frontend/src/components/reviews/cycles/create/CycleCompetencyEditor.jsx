// src/components/reviews/cycles/create/CycleCompetencyEditor.jsx
import React, { useState } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { useCompetencies } from '../../../../hooks/reviews';

const CycleCompetencyEditor = ({ competencies = [], onChange }) => {
  const { data: availableCompetencies, loading } = useCompetencies();
  const [selectedCompetency, setSelectedCompetency] = useState('');

  const addCompetency = () => {
    if (!selectedCompetency) return;
    const comp = availableCompetencies.find((c) => c.id === selectedCompetency);
    if (!comp) return;
    
    const exists = competencies.find((c) => c.competency_id === selectedCompetency);
    if (exists) return;

    onChange([
      ...competencies,
      {
        competency: selectedCompetency,
        competency_id: selectedCompetency,
        competency_name: comp.name,
        weight: comp.default_weight || 10,
        display_order: competencies.length + 1,
      },
    ]);
    setSelectedCompetency('');
  };

  const removeCompetency = (index) => {
    const updated = competencies.filter((_, i) => i !== index);
    onChange(updated);
  };

  const updateWeight = (index, weight) => {
    const updated = competencies.map((c, i) =>
      i === index ? { ...c, weight: Number(weight) } : c
    );
    onChange(updated);
  };

  const totalWeight = competencies.reduce((sum, c) => sum + (c.weight || 0), 0);

  return (
    <div className="cycle-competency-editor">
      <h3 className="cycle-competency-editor-title">Competencies</h3>
      <p className="cycle-competency-editor-subtitle">
        Add competencies and assign weights (Total: {totalWeight}%)
      </p>

      <div className="cycle-competency-editor-add">
        <select
          className="cycle-competency-editor-select"
          value={selectedCompetency}
          onChange={(e) => setSelectedCompetency(e.target.value)}
          disabled={loading}
        >
          <option value="">Select a competency...</option>
          {availableCompetencies.map((comp) => (
            <option key={comp.id} value={comp.id}>
              {comp.name} ({comp.competency_type})
            </option>
          ))}
        </select>
        <button
          className="btn btn-primary btn-sm"
          onClick={addCompetency}
          disabled={!selectedCompetency}
        >
          <Plus size={16} />
          Add
        </button>
      </div>

      {competencies.length > 0 ? (
        <div className="cycle-competency-editor-list">
          {competencies.map((comp, index) => (
            <div key={comp.competency_id || index} className="cycle-competency-editor-item">
              <div className="cycle-competency-editor-drag">
                <GripVertical size={16} />
              </div>
              <span className="cycle-competency-editor-name">{comp.competency_name}</span>
              <input
                type="number"
                className="cycle-competency-editor-weight"
                value={comp.weight || 0}
                onChange={(e) => updateWeight(index, e.target.value)}
                min={0}
                max={100}
              />
              <span className="cycle-competency-editor-percent">%</span>
              <button
                className="cycle-competency-editor-remove"
                onClick={() => removeCompetency(index)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="cycle-competency-editor-empty">
          No competencies added yet
        </div>
      )}
    </div>
  );
};

export default CycleCompetencyEditor;