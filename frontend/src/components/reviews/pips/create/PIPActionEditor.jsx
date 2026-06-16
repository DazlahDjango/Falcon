// src/components/reviews/pips/create/PIPActionEditor.jsx
import React, { useState } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';

const PIPActionEditor = ({ actions = [], onChange }) => {
  const [newAction, setNewAction] = useState({
    title: '',
    description: '',
    priority: 'medium',
    due_date: '',
    requires_evidence: false,
  });

  const addAction = () => {
    if (!newAction.title.trim() || !newAction.due_date) return;
    const updated = [...actions, { ...newAction, id: Date.now() }];
    onChange(updated);
    setNewAction({
      title: '',
      description: '',
      priority: 'medium',
      due_date: '',
      requires_evidence: false,
    });
  };

  const removeAction = (index) => {
    const updated = actions.filter((_, i) => i !== index);
    onChange(updated);
  };

  const updateAction = (index, field, value) => {
    const updated = actions.map((action, i) =>
      i === index ? { ...action, [field]: value } : action
    );
    onChange(updated);
  };

  const priorities = [
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ];

  return (
    <div className="pip-action-editor">
      <h3 className="pip-action-editor-title">Actions</h3>
      <p className="pip-action-editor-subtitle">
        Define the actions for this PIP
      </p>

      <div className="pip-action-editor-list">
        {actions.map((action, index) => (
          <div key={action.id || index} className="pip-action-editor-item">
            <div className="pip-action-editor-drag">
              <GripVertical size={16} />
            </div>
            <input
              type="text"
              className="pip-action-editor-input"
              value={action.title}
              onChange={(e) => updateAction(index, 'title', e.target.value)}
              placeholder="Action title"
            />
            <input
              type="text"
              className="pip-action-editor-input"
              value={action.description || ''}
              onChange={(e) => updateAction(index, 'description', e.target.value)}
              placeholder="Description"
            />
            <select
              className="pip-action-editor-select"
              value={action.priority || 'medium'}
              onChange={(e) => updateAction(index, 'priority', e.target.value)}
            >
              {priorities.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
            <input
              type="date"
              className="pip-action-editor-input small"
              value={action.due_date || ''}
              onChange={(e) => updateAction(index, 'due_date', e.target.value)}
            />
            <label className="pip-action-editor-checkbox">
              <input
                type="checkbox"
                checked={action.requires_evidence || false}
                onChange={(e) => updateAction(index, 'requires_evidence', e.target.checked)}
              />
              Evidence
            </label>
            <button
              className="pip-action-editor-remove"
              onClick={() => removeAction(index)}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <div className="pip-action-editor-add">
        <div className="pip-action-editor-add-row">
          <input
            type="text"
            className="pip-action-editor-input"
            value={newAction.title}
            onChange={(e) => setNewAction({ ...newAction, title: e.target.value })}
            placeholder="Action title"
          />
          <input
            type="text"
            className="pip-action-editor-input"
            value={newAction.description}
            onChange={(e) => setNewAction({ ...newAction, description: e.target.value })}
            placeholder="Description"
          />
          <select
            className="pip-action-editor-select"
            value={newAction.priority}
            onChange={(e) => setNewAction({ ...newAction, priority: e.target.value })}
          >
            {priorities.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
          <input
            type="date"
            className="pip-action-editor-input small"
            value={newAction.due_date}
            onChange={(e) => setNewAction({ ...newAction, due_date: e.target.value })}
          />
          <label className="pip-action-editor-checkbox">
            <input
              type="checkbox"
              checked={newAction.requires_evidence}
              onChange={(e) => setNewAction({ ...newAction, requires_evidence: e.target.checked })}
            />
            Evidence
          </label>
          <button
            className="btn btn-primary btn-sm"
            onClick={addAction}
            disabled={!newAction.title.trim() || !newAction.due_date}
          >
            <Plus size={16} />
            Add
          </button>
        </div>
      </div>

      <div className="pip-action-editor-info">
        <span>{actions.length} actions defined</span>
      </div>
    </div>
  );
};

export default PIPActionEditor;