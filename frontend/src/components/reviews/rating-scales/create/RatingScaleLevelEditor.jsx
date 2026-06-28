// src/components/reviews/rating-scales/create/RatingScaleLevelEditor.jsx
import React, { useState } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';

const RatingScaleLevelEditor = ({ levels = [], onChange, minValue = 1, maxValue = 5 }) => {
  const [newLevel, setNewLevel] = useState({
    label: '',
    description: '',
    min: minValue,
    max: maxValue,
    color: '#3b82f6',
  });

  const addLevel = () => {
    if (!newLevel.label.trim()) return;
    const updatedLevels = [...levels, { ...newLevel, id: Date.now() }];
    onChange(updatedLevels);
    setNewLevel({
      label: '',
      description: '',
      min: minValue,
      max: maxValue,
      color: '#3b82f6',
    });
  };

  const removeLevel = (index) => {
    const updatedLevels = levels.filter((_, i) => i !== index);
    onChange(updatedLevels);
  };

  const updateLevel = (index, field, value) => {
    const updatedLevels = levels.map((level, i) =>
      i === index ? { ...level, [field]: value } : level
    );
    onChange(updatedLevels);
  };

  const colors = ['#3b82f6', '#22c55e', '#eab308', '#f97316', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="rating-scale-level-editor">
      <h3 className="rating-scale-level-editor-title">Rating Levels</h3>
      <p className="rating-scale-level-editor-subtitle">
        Define the levels for this rating scale
      </p>

      <div className="rating-scale-level-editor-list">
        {levels.map((level, index) => (
          <div key={level.id || index} className="rating-scale-level-editor-item">
            <div className="rating-scale-level-editor-drag">
              <GripVertical size={16} />
            </div>
            <input
              type="text"
              className="rating-scale-level-editor-input"
              value={level.label}
              onChange={(e) => updateLevel(index, 'label', e.target.value)}
              placeholder="Level label"
            />
            <input
              type="text"
              className="rating-scale-level-editor-input"
              value={level.description || ''}
              onChange={(e) => updateLevel(index, 'description', e.target.value)}
              placeholder="Description"
            />
            <input
              type="number"
              className="rating-scale-level-editor-input small"
              value={level.min}
              onChange={(e) => updateLevel(index, 'min', Number(e.target.value))}
              placeholder="Min"
            />
            <input
              type="number"
              className="rating-scale-level-editor-input small"
              value={level.max}
              onChange={(e) => updateLevel(index, 'max', Number(e.target.value))}
              placeholder="Max"
            />
            <input
              type="color"
              className="rating-scale-level-editor-color"
              value={level.color || '#3b82f6'}
              onChange={(e) => updateLevel(index, 'color', e.target.value)}
            />
            <button
              className="rating-scale-level-editor-remove"
              onClick={() => removeLevel(index)}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <div className="rating-scale-level-editor-add">
        <div className="rating-scale-level-editor-add-row">
          <input
            type="text"
            className="rating-scale-level-editor-input"
            value={newLevel.label}
            onChange={(e) => setNewLevel({ ...newLevel, label: e.target.value })}
            placeholder="Level label"
          />
          <input
            type="text"
            className="rating-scale-level-editor-input"
            value={newLevel.description}
            onChange={(e) => setNewLevel({ ...newLevel, description: e.target.value })}
            placeholder="Description"
          />
          <input
            type="number"
            className="rating-scale-level-editor-input small"
            value={newLevel.min}
            onChange={(e) => setNewLevel({ ...newLevel, min: Number(e.target.value) })}
            placeholder="Min"
          />
          <input
            type="number"
            className="rating-scale-level-editor-input small"
            value={newLevel.max}
            onChange={(e) => setNewLevel({ ...newLevel, max: Number(e.target.value) })}
            placeholder="Max"
          />
          <div className="rating-scale-level-editor-color-select">
            {colors.map((color) => (
              <button
                key={color}
                className={`rating-scale-level-editor-color-option ${newLevel.color === color ? 'active' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => setNewLevel({ ...newLevel, color })}
              />
            ))}
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={addLevel}
            disabled={!newLevel.label.trim()}
          >
            <Plus size={16} />
            Add
          </button>
        </div>
      </div>

      <div className="rating-scale-level-editor-info">
        <span>{levels.length} levels defined</span>
      </div>
    </div>
  );
};

export default RatingScaleLevelEditor;