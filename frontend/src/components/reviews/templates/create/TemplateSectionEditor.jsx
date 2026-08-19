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

  const [isNewRequired, setIsNewRequired] = useState(true);

  const addSection = () => {
    if (!newSection.trim()) return;
    const updated = [...sections, newSection];
    const updatedRequired = isNewRequired
      ? (requiredSections.includes(newSection) ? requiredSections : [...requiredSections, newSection])
      : requiredSections.filter((s) => s !== newSection);
    onChange(updated, updatedRequired);
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
        Add appraisal form sections and toggle whether they are required or optional.
      </p>

      <div className="template-section-editor-add-container">
        <div className="template-section-editor-add">
          <select
            className="template-section-editor-select"
            value={newSection}
            onChange={(e) => setNewSection(e.target.value)}
          >
            <option value="">Select a section to add...</option>
            {availableSections
              .filter((s) => !sections.includes(s.value))
              .map((section) => (
                <option key={section.value} value={section.value}>
                  {section.label}
                </option>
              ))}
          </select>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={addSection}
            disabled={!newSection}
          >
            <Plus size={16} />
            Add
          </button>
        </div>
        <label className="template-section-editor-add-required-label">
          <input
            type="checkbox"
            checked={isNewRequired}
            onChange={(e) => setIsNewRequired(e.target.checked)}
          />
          <span>Mark as Required section</span>
        </label>
      </div>

      {sections.length === 0 ? (
        <div className="template-section-editor-empty">No sections added yet. Select a section above and click Add.</div>
      ) : (
        <div className="template-section-editor-list">
          {sections.map((section, index) => {
            const label = availableSections.find(s => s.value === section)?.label || section;
            const isRequired = requiredSections.includes(section);

            return (
              <div key={index} className="template-section-editor-item">
                <div className="template-section-editor-item-left">
                  <div className="template-section-editor-move-buttons">
                    <button
                      type="button"
                      className="template-section-editor-move"
                      onClick={() => index > 0 && moveSection(index, index - 1)}
                      disabled={index === 0}
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="template-section-editor-move"
                      onClick={() => index < sections.length - 1 && moveSection(index, index + 1)}
                      disabled={index === sections.length - 1}
                      title="Move down"
                    >
                      ↓
                    </button>
                  </div>
                  <span className="template-section-editor-item-label">{label}</span>
                </div>
                <div className="template-section-editor-item-right">
                  <button
                    type="button"
                    className={`template-section-badge-btn ${isRequired ? 'required' : 'optional'}`}
                    onClick={() => toggleRequired(section)}
                    title={isRequired ? 'Click to mark as Optional' : 'Click to mark as Required'}
                  >
                    {isRequired ? (
                      <>
                        <CheckCircle size={13} />
                        <span>Required</span>
                      </>
                    ) : (
                      <>
                        <XCircle size={13} />
                        <span>Optional</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="template-section-editor-remove"
                    onClick={() => removeSection(index)}
                    title="Remove section"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="template-section-editor-info">
        <span><strong>{sections.length}</strong> sections included</span>
        <span><strong>{requiredSections.length}</strong> required</span>
      </div>
    </div>
  );
};

export default TemplateSectionEditor;