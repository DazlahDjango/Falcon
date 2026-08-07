// src/components/reviews/rating-scales/create/RatingScaleLevelEditor.jsx
import React, { useState } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';

const RatingScaleLevelEditor = ({ levels = [], onChange, minValue = 1, maxValue = 5 }) => {
  const [newLevel, setNewLevel] = useState({
    value: minValue,
    label: '',
    description: '',
    min_pct: 0,
    color: '#3b82f6',
  });

  const moveLevel = (index, direction) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= levels.length) return;
    const updatedLevels = [...levels];
    const temp = updatedLevels[index];
    updatedLevels[index] = updatedLevels[nextIndex];
    updatedLevels[nextIndex] = temp;
    onChange(updatedLevels);
  };

  const addLevel = () => {
    if (!newLevel.label.trim()) {
      alert('Please enter a Level Label before adding.');
      return;
    }
    const val = Number(newLevel.value);
    if (isNaN(val) || val < minValue || val > maxValue) {
      alert(`Level value must be between ${minValue} and ${maxValue}.`);
      return;
    }
    const duplicate = levels.find(l => Number(l.value) === val);
    if (duplicate) {
      alert(`A level with value ${val} already exists.`);
      return;
    }
    const minPctVal = Number(newLevel.min_pct);
    if (isNaN(minPctVal) || minPctVal < 0 || minPctVal > 100) {
      alert('Min % must be between 0 and 100.');
      return;
    }

    const updatedLevels = [...levels, { ...newLevel, id: Date.now() }];
    onChange(updatedLevels);
    setNewLevel({
      value: levels.length + minValue + 1,
      label: '',
      description: '',
      min_pct: 0,
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
        Define the levels for this rating scale (Values should stay between {minValue} and {maxValue})
      </p>

      <div className="rating-scale-level-editor-list">
        {levels.map((level, index) => {
          const valNum = Number(level.value);
          const isValueInvalid = isNaN(valNum) || valNum < minValue || valNum > maxValue;
          const isValueDuplicate = levels.filter(l => Number(l.value) === valNum).length > 1;
          const minPctNum = Number(level.min_pct);
          const isMinPctInvalid = isNaN(minPctNum) || minPctNum < 0 || minPctNum > 100;

          return (
            <div key={level.id || index} className="rating-scale-level-editor-item flex items-center gap-1">
              <div className="rating-scale-level-editor-actions-reorder flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => moveLevel(index, -1)}
                  disabled={index === 0}
                  className="px-1 text-xs text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:hover:text-gray-500"
                  title="Move Up"
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => moveLevel(index, 1)}
                  disabled={index === levels.length - 1}
                  className="px-1 text-xs text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:hover:text-gray-500"
                  title="Move Down"
                >
                  ▼
                </button>
              </div>
              <input
                type="number"
                className="rating-scale-level-editor-input small"
                value={level.value}
                onChange={(e) => updateLevel(index, 'value', Number(e.target.value))}
                placeholder="Value"
                style={{
                  borderColor: isValueInvalid || isValueDuplicate ? '#ef4444' : '',
                  borderWidth: isValueInvalid || isValueDuplicate ? '1.5px' : ''
                }}
                title={isValueInvalid ? `Value must be between ${minValue} and ${maxValue}` : isValueDuplicate ? 'Duplicate level value' : ''}
              />
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
                value={level.min_pct || 0}
                onChange={(e) => updateLevel(index, 'min_pct', Number(e.target.value))}
                placeholder="Min %"
                style={{
                  borderColor: isMinPctInvalid ? '#ef4444' : '',
                  borderWidth: isMinPctInvalid ? '1.5px' : ''
                }}
                title={isMinPctInvalid ? 'Min % must be between 0 and 100' : ''}
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
          );
        })}
      </div>

      {levels.some(l => Number(l.value) < minValue || Number(l.value) > maxValue) && (
        <p className="text-red-500 text-xs mt-1">⚠️ Warning: Some level values are outside the scale bounds ({minValue} - {maxValue}).</p>
      )}
      {levels.some((l, idx) => levels.findIndex(o => Number(o.value) === Number(l.value)) !== idx) && (
        <p className="text-red-500 text-xs mt-1">⚠️ Warning: Duplicate level values detected.</p>
      )}
      {levels.some(l => Number(l.min_pct) < 0 || Number(l.min_pct) > 100) && (
        <p className="text-red-500 text-xs mt-1">⚠️ Warning: Min % must be between 0 and 100.</p>
      )}

      <div className="rating-scale-level-editor-add mt-3">
        <div className="rating-scale-level-editor-add-row">
          <input
            type="number"
            className="rating-scale-level-editor-input small"
            value={newLevel.value}
            onChange={(e) => setNewLevel({ ...newLevel, value: Number(e.target.value) })}
            placeholder="Value"
          />
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
            value={newLevel.min_pct}
            onChange={(e) => setNewLevel({ ...newLevel, min_pct: Number(e.target.value) })}
            placeholder="Min %"
          />
          <div className="rating-scale-level-editor-color-select">
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                className={`rating-scale-level-editor-color-option ${newLevel.color === color ? 'active' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => setNewLevel({ ...newLevel, color })}
              />
            ))}
          </div>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={addLevel}
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