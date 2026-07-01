import React, { useState } from 'react';
import {
  FiPlus,
  FiTrash2,
  FiEdit,
  FiX,
  FiTool,
  FiStar,
  FiAlertCircle,
  FiCheckCircle,
} from 'react-icons/fi';
import { useProfile } from '../../../hooks/accounts/useProfile';

export const SkillManager = ({ profileId, skills = [], isOwner = true }) => {
  const { addSkill, updateSkill, removeSkill, isLoading } = useProfile();

  const [showForm, setShowForm] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    level: 'intermediate',
    years_experience: 0,
  });
  const [formError, setFormError] = useState(null);
  const [success, setSuccess] = useState(false);

  const levelOptions = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'expert', label: 'Expert' },
  ];

  const handleAdd = () => {
    setEditingSkill(null);
    setFormData({ name: '', level: 'intermediate', years_experience: 0 });
    setFormError(null);
    setShowForm(true);
  };

  const handleEdit = (skill) => {
    setEditingSkill(skill);
    setFormData({
      name: skill.name,
      level: skill.level,
      years_experience: skill.years_experience || 0,
    });
    setFormError(null);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingSkill(null);
    setFormData({ name: '', level: 'intermediate', years_experience: 0 });
    setFormError(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'years_experience' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim()) {
      setFormError('Skill name is required');
      return;
    }

    const skillData = {
      name: formData.name.trim(),
      level: formData.level,
      years_experience: formData.years_experience || 0,
    };

    let result;
    if (editingSkill) {
      result = await updateSkill(profileId, editingSkill.name, skillData);
    } else {
      result = await addSkill(profileId, skillData);
    }

    if (result.success !== false) {
      setSuccess(true);
      setShowForm(false);
      setEditingSkill(null);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setFormError(result.error || 'Failed to save skill');
    }
  };

  const handleDelete = async (skillName) => {
    if (!confirm(`Remove skill "${skillName}"?`)) return;
    const result = await removeSkill(profileId, skillName);
    if (result.success !== false) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  const getLevelBadge = (level) => {
    const colors = {
      beginner: 'gray',
      intermediate: 'blue',
      advanced: 'green',
      expert: 'purple',
    };
    return colors[level] || 'gray';
  };

  const getLevelStars = (level) => {
    const map = {
      beginner: 1,
      intermediate: 2,
      advanced: 3,
      expert: 4,
    };
    return map[level] || 0;
  };

  return (
    <div className="skill-manager">
      <div className="skill-manager-header">
        <h3>
          <FiTool /> Skills ({skills.length})
        </h3>
        {isOwner && (
          <button className="btn-primary-sm" onClick={handleAdd}>
            <FiPlus /> Add Skill
          </button>
        )}
      </div>

      {success && (
        <div className="skill-manager-success">
          <FiCheckCircle /> Operation successful!
        </div>
      )}

      {skills.length === 0 ? (
        <div className="skill-manager-empty">
          <FiTool className="empty-icon" />
          <p>No skills added yet</p>
          {isOwner && <p className="empty-hint">Click "Add Skill" to get started</p>}
        </div>
      ) : (
        <div className="skill-list">
          {skills.map((skill) => (
            <div key={skill.name} className="skill-item">
              <div className="skill-info">
                <span className="skill-name">{skill.name}</span>
                <span className={`skill-level ${getLevelBadge(skill.level)}`}>
                  {skill.level}
                </span>
                <div className="skill-stars">
                  {[...Array(4)].map((_, i) => (
                    <FiStar
                      key={i}
                      className={i < getLevelStars(skill.level) ? 'filled' : ''}
                    />
                  ))}
                </div>
                {skill.years_experience > 0 && (
                  <span className="skill-experience">
                    {skill.years_experience} year{skill.years_experience > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              {isOwner && (
                <div className="skill-actions">
                  <button className="action-btn edit" onClick={() => handleEdit(skill)}>
                    <FiEdit />
                  </button>
                  <button className="action-btn delete" onClick={() => handleDelete(skill.name)}>
                    <FiTrash2 />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="skill-form">
          <h4>{editingSkill ? 'Edit Skill' : 'Add Skill'}</h4>
          {formError && (
            <div className="form-error">
              <FiAlertCircle /> {formError}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="skill-name" className="form-label">Skill Name</label>
              <input
                id="skill-name"
                name="name"
                type="text"
                className="form-input"
                placeholder="e.g., Python, Project Management"
                value={formData.name}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="skill-level" className="form-label">Level</label>
                <select
                  id="skill-level"
                  name="level"
                  className="form-select"
                  value={formData.level}
                  onChange={handleChange}
                  disabled={isLoading}
                >
                  {levelOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="skill-years" className="form-label">Years Experience</label>
                <input
                  id="skill-years"
                  name="years_experience"
                  type="number"
                  className="form-input"
                  min="0"
                  max="50"
                  value={formData.years_experience}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-secondary-sm" onClick={handleCancel}>
                <FiX /> Cancel
              </button>
              <button type="submit" className="btn-primary-sm" disabled={isLoading}>
                {isLoading ? 'Saving...' : editingSkill ? 'Update Skill' : 'Add Skill'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
export default SkillManager;