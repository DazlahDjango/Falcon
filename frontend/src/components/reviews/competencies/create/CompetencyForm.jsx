// src/components/reviews/competencies/create/CompetencyForm.jsx
import React, { useEffect } from 'react';
import { useCompetencyCategories, useRatingScales } from '../../../../hooks/reviews';

const CompetencyForm = ({ data, onChange, usageCount = 0 }) => {
  const { data: categories, loading: categoriesLoading } = useCompetencyCategories();
  const { data: ratingScales, fetchAll: fetchRatingScales } = useRatingScales();

  useEffect(() => {
    fetchRatingScales();
  }, [fetchRatingScales]);

  const handleChange = (field, value) => {
    onChange({ [field]: value });
  };

  const isLocked = usageCount > 0;

  const competencyTypes = [
    { value: 'leadership', label: 'Leadership' },
    { value: 'management', label: 'Management' },
    { value: 'technical', label: 'Technical Skills' },
    { value: 'soft_skill', label: 'Soft Skills' },
    { value: 'cultural', label: 'Cultural Fit' },
    { value: 'strategic', label: 'Strategic Thinking' },
    { value: 'operational', label: 'Operational Excellence' },
    { value: 'customer', label: 'Customer Focus' },
    { value: 'innovation', label: 'Innovation' },
    { value: 'teamwork', label: 'Teamwork & Collaboration' },
  ];

  const behaviorTemplates = {
    leadership: {
      excellent: "Demonstrates vision, inspires team members, delegates tasks effectively, and models the company's core values.",
      improvement: "Struggles to provide direction, fails to support team members, or takes sole credit for achievements."
    },
    management: {
      excellent: "Consistently delivers projects on time and within budget, manages resources efficiently, and resolves conflicts constructively.",
      improvement: "Struggles with planning, fails to organize resources effectively, or avoids dealing with team conflicts."
    },
    technical: {
      excellent: "Possesses deep domain knowledge, writes clean and maintainable code, and mentors others on technical best practices.",
      improvement: "Lacks critical technical skills, produces sub-standard work, or resists learning new tools/technologies."
    },
    soft_skill: {
      excellent: "Communicates clearly and persuasively, active listener, and builds strong working relationships across teams.",
      improvement: "Communicates poorly, dismisses feedback, or struggles to collaborate with colleagues."
    },
    cultural: {
      excellent: "Acts as a champion for team culture, values diversity, and participates actively in company initiatives.",
      improvement: "Shows lack of respect for company values, isolates themselves, or creates friction in the team."
    },
    strategic: {
      excellent: "Anticipates future trends, aligns daily work with company goals, and formulates clear long-term growth plans.",
      improvement: "Focuses only on short-term tasks, fails to connect work with the bigger picture, or ignores market developments."
    },
    operational: {
      excellent: "Maintains high quality standards, optimizes workflows, and consistently achieves operational KPIs.",
      improvement: "Fails to meet process guidelines, accepts poor quality, or misses operational milestones."
    },
    customer: {
      excellent: "Puts customer needs first, responds promptly to feedback, and builds strong customer loyalty.",
      improvement: "Fails to understand customer pain points, responds defensively, or neglects customer inquiries."
    },
    innovation: {
      excellent: "Proposes creative solutions, embraces experimentation, and encourages constructive brainstorming.",
      improvement: "Resists change, relies solely on traditional methods, or discourages team input on new ideas."
    },
    teamwork: {
      excellent: "Highly cooperative, supports peers during peak times, and actively contributes to a positive team dynamic.",
      improvement: "Struggles to work with others, hoards information, or shifts blame to teammates."
    }
  };

  const handleLoadTemplate = () => {
    const type = data.competency_type || 'technical';
    const template = behaviorTemplates[type] || behaviorTemplates['soft_skill'];
    onChange({
      excellent_behavior: template.excellent,
      needs_improvement_behavior: template.improvement
    });
  };

  return (
    <div className="competency-form">
      {isLocked && (
        <div className="alert alert-warning mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded">
          🔒 Scoring parameters (type, weight, and rating scale) are locked because this competency has been graded in cycles.
        </div>
      )}

      <div className="competency-form-group">
        <label className="competency-form-label">Name *</label>
        <input
          type="text"
          className="competency-form-input"
          value={data.name || ''}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Enter competency name"
          required
        />
      </div>

      <div className="competency-form-group">
        <label className="competency-form-label">Description</label>
        <textarea
          className="competency-form-textarea"
          value={data.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Enter description"
          rows={3}
        />
      </div>

      <div className="competency-form-row">
        <div className="competency-form-group">
          <label className="competency-form-label">Type</label>
          <select
            className="competency-form-select"
            value={data.competency_type || 'technical'}
            onChange={(e) => handleChange('competency_type', e.target.value)}
            disabled={isLocked}
            title={isLocked ? 'Locked because this competency is in use' : ''}
          >
            {competencyTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        <div className="competency-form-group">
          <label className="competency-form-label">Category</label>
          <select
            className="competency-form-select"
            value={data.category || ''}
            onChange={(e) => handleChange('category', e.target.value)}
            disabled={categoriesLoading}
          >
            <option value="">Select category...</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="competency-form-row">
        <div className="competency-form-group">
          <label className="competency-form-label">Default Weight (%)</label>
          <input
            type="number"
            className="competency-form-input"
            value={data.default_weight || 10}
            onChange={(e) => handleChange('default_weight', Number(e.target.value))}
            min={0}
            max={100}
            disabled={isLocked}
            title={isLocked ? 'Locked because this competency is in use' : ''}
          />
        </div>
        <div className="competency-form-group">
          <label className="competency-form-label">Rating Scale Override</label>
          <select
            className="competency-form-select"
            value={data.rating_scale || ''}
            onChange={(e) => handleChange('rating_scale', e.target.value)}
            disabled={isLocked}
            title={isLocked ? 'Locked because this competency is in use' : ''}
          >
            <option value="">Use Cycle Default Rating Scale</option>
            {ratingScales?.map((scale) => (
              <option key={scale.id} value={scale.id}>
                {scale.name} ({scale.min_value} - {scale.max_value})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="competency-form-row">
        <div className="competency-form-group">
          <label className="competency-form-label">Display Order</label>
          <input
            type="number"
            className="competency-form-input"
            value={data.display_order || 0}
            onChange={(e) => handleChange('display_order', Number(e.target.value))}
            min={0}
          />
        </div>
        <div className="competency-form-group flex items-end">
          {/* Spacer */}
        </div>
      </div>

      <div className="competency-form-checkbox-group">
        <label className="competency-form-checkbox">
          <input
            type="checkbox"
            checked={data.is_active || false}
            disabled={isLocked}
            onChange={(e) => handleChange('is_active', e.target.checked)}
          />
          Active
        </label>
        <label className="competency-form-checkbox">
          <input
            type="checkbox"
            checked={data.is_required || false}
            onChange={(e) => handleChange('is_required', e.target.checked)}
          />
          Required
        </label>
      </div>

      <div className="competency-behaviors-section mt-4 p-3 bg-gray-50 border border-gray-200 rounded">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-semibold text-gray-700">Behavioral Indicators</h4>
          <button
            type="button"
            onClick={handleLoadTemplate}
            className="text-xs bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 px-2 py-1 rounded select-none cursor-pointer"
          >
            🪄 Load Behavior Template
          </button>
        </div>

        <div className="competency-form-group">
          <label className="competency-form-label text-xs">Excellent Behavior Indicators</label>
          <textarea
            className="competency-form-textarea"
            value={data.excellent_behavior || ''}
            onChange={(e) => handleChange('excellent_behavior', e.target.value)}
            placeholder="e.g. Inspires others, aligns strategy with output, proactively solves problems."
            rows={2}
          />
        </div>

        <div className="competency-form-group mt-2">
          <label className="competency-form-label text-xs">Needs Improvement Behavior Indicators</label>
          <textarea
            className="competency-form-textarea"
            value={data.needs_improvement_behavior || ''}
            onChange={(e) => handleChange('needs_improvement_behavior', e.target.value)}
            placeholder="e.g. Struggles to delegate, avoids strategic alignment, lacks customer focus."
            rows={2}
          />
        </div>
      </div>
    </div>
  );
};

export default CompetencyForm;