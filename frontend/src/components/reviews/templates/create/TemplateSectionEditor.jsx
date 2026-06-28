// src/components/reviews/templates/create/TemplateSectionEditor.jsx
import React, { useState } from 'react';
import { Plus, Trash2, GripVertical, CheckCircle, XCircle } from 'lucide-react';

const TemplateSectionEditor = ({ sections = [], requiredSections = [], onChange }) => {
  const [newSection, setNewSection] = useState('');

  const availableSections = [
    { value: 'overall_comment', label: 'Overall Comment' },
    { value: 'performance_summary', label: 'Performance Summary' },
    { value: 'strengths', label: 'Strengths' },
    { value: 'strengths_observed', label: 'Strengths Observed' },
    { value: 'areas_for_improvement', label: 'Areas for Improvement' },
    { value: 'development_areas', label: 'Development Areas' },
    { value: 'career_aspirations', label: 'Career Aspirations' },
    { value: 'challenges_faced', label: 'Challenges Faced' },
    { value: 'achievements', label: 'Achievements' },
    { value: 'achievements_recognized', label: 'Achievements Recognized' },
    { value: 'career_progression_notes', label: 'Career Progression Notes' },
    { value: 'training_completed', label: 'Training Completed' },
    { value: 'training_requested', label: 'Training Requested' },
    { value: 'training_recommendations', label: 'Training Recommendations' },
    { value: 'goals_achieved', label: 'Goals Achieved' },
    { value: 'goals_for_next_period', label: 'Goals for Next Period' },
    { value: 'recommendation', label: 'Recommendation' },
    { value: 'promotion_readiness', label: 'Promotion Readiness' },
    { value: 'bonus_recommendation', label: 'Bonus Recommendation' },
  ];

  const addSection = () => {
    if (!newSection.trim()) return;
    const updated = [...sections, newSection];
    onChange(updated, requiredSections);
    setNewSection('');
  };

  const removeSection = (index) => {
    const updated = sections.filter((_, i) => i !== index);
    const updatedRequired = requiredSections.filter((s) => s !== sections[index]);
    onChange(updated, updatedRequired);
  };

  const toggleRequired = (section) => {
    const updatedRequired = requiredSections.includes(section)
      ? requiredSections.filter((s) => s !== section)
      : [...requiredSections, section];
    onChange(sections, updatedRequired);
  };

  const moveSection = (from, to) => {
    const updated = [...sections];
    const [removed] = updated.splice(from, 1);
    updated.splice(to, 0, removed);
    onChange(updated, requiredSections);
  };

  return (
    <div className="template-section-editor">
      <h3 className="template-section-editor-title">Sections</h3>
      <p className="template-section-editor-subtitle">
        Add and manage template sections
      </p>

      <div className="template-section-editor-add">
        <select
          className="template-section-editor-select"
          value={newSection}
          onChange={(e) => setNewSection(e.target.value)}
        >
          <option value="">Select a section...</option>
          {availableSections
            .filter((s) => !sections.includes(s.value))
            .map((section) => (
              <option key={section.value} value={section.value}>
                {section.label}
              </option>
            ))}
        </select>
        <button
          className="btn btn-primary btn-sm"
          onClick={addSection}
          disabled={!newSection}
        >
          <Plus size={16} />
          Add
        </button>
      </div>

      {sections.length === 0 ? (
        <div className="template-section-editor-empty">No sections added</div>
      ) : (
        <div className="template-section-editor-list">
          {sections.map((section, index) => {
            const label = availableSections.find(s => s.value === section)?.label || section;
            const isRequired = requiredSections.includes(section);

            return (
              <div key={index} className="template-section-editor-item">
                <div className="template-section-editor-item-left">
                  <button
                    className="template-section-editor-move"
                    onClick={() => index > 0 && moveSection(index, index - 1)}
                    disabled={index === 0}
                  >
                    ↑
                  </button>
                  <button
                    className="template-section-editor-move"
                    onClick={() => index < sections.length - 1 && moveSection(index, index + 1)}
                    disabled={index === sections.length - 1}
                  >
                    ↓
                  </button>
                  <span className="template-section-editor-item-label">{label}</span>
                </div>
                <div className="template-section-editor-item-right">
                  <button
                    className={`template-section-editor-required ${isRequired ? 'active' : ''}`}
                    onClick={() => toggleRequired(section)}
                    title={isRequired ? 'Mark as optional' : 'Mark as required'}
                  >
                    {isRequired ? (
                      <CheckCircle size={16} color="#22c55e" />
                    ) : (
                      <XCircle size={16} color="#9ca3af" />
                    )}
                  </button>
                  <button
                    className="template-section-editor-remove"
                    onClick={() => removeSection(index)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="template-section-editor-info">
        <span>{sections.length} sections</span>
        <span>{requiredSections.length} required</span>
      </div>
    </div>
  );
};

export default TemplateSectionEditor;