// src/components/reviews/self-assessments/form/SelfAssessmentCompetencyRating.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronUp, Award, Info, UserCheck, Shield, BarChart3 } from 'lucide-react';
import { useCompetencies, useRatingScales, useReviewsPermissions } from '../../../../hooks/reviews';

// Default standard qualitative performance factors for Managers / Supervisors (Section III)
const DEFAULT_MANAGER_FACTORS = [
  {
    id: 'default_lead_1',
    category_name: 'Leadership',
    name: 'Inspire and motivate team members.',
    description: 'Inspires enthusiasm, shared vision, and commitment across the team.',
    default_weight: 8.33,
  },
  {
    id: 'default_lead_2',
    category_name: 'Leadership',
    name: 'Make strategic decisions under pressure.',
    description: 'Maintains composure and sound judgment in high-stakes or time-sensitive situations.',
    default_weight: 8.33,
  },
  {
    id: 'default_lead_3',
    category_name: 'Leadership',
    name: 'Delegation skills to effectively distribute tasks and responsibilities among team members.',
    description: 'Empowers team members by assigning tasks according to strengths and development needs.',
    default_weight: 8.33,
  },
  {
    id: 'default_lead_4',
    category_name: 'Leadership',
    name: 'Set goals and objectives for the department and inspire the team to achieve them.',
    description: 'Establishes clear departmental milestones and drives collective alignment towards achievement.',
    default_weight: 8.33,
  },
  {
    id: 'default_strat_1',
    category_name: 'Strategic thinking',
    name: 'Develop and implement strategic plans aligned with organizational goals.',
    description: 'Translates high-level organizational vision into actionable operational blueprints.',
    default_weight: 8.33,
  },
  {
    id: 'default_strat_2',
    category_name: 'Strategic thinking',
    name: 'Anticipate future trends and proactively plan for departmental needs.',
    description: 'Identifies emerging opportunities, market shifts, and risks before they impact operations.',
    default_weight: 8.33,
  },
  {
    id: 'default_prob_1',
    category_name: 'Problem Solving',
    name: 'Identify root causes of issues and develop effective solutions.',
    description: 'Applies critical inquiry to uncover underlying problems rather than treating symptoms.',
    default_weight: 8.33,
  },
  {
    id: 'default_prob_2',
    category_name: 'Problem Solving',
    name: 'Find new approaches to challenges.',
    description: 'Demonstrates creative and innovative problem resolution when standard methods fall short.',
    default_weight: 8.33,
  },
  {
    id: 'default_prob_3',
    category_name: 'Problem Solving',
    name: 'Make data-driven decisions and use analytical tools to solve complex problems.',
    description: 'Leverages objective metrics, performance indicators, and analytical logic in decision-making.',
    default_weight: 8.33,
  },
  {
    id: 'default_team_1',
    category_name: 'Team building and Collaboration',
    name: 'Build and foster a collaborative and inclusive team environment',
    description: 'Cultivates trust, psychological safety, and positive cooperation across all team members.',
    default_weight: 8.33,
  },
  {
    id: 'default_team_2',
    category_name: 'Team building and Collaboration',
    name: 'Address conflicts and promote harmonious working relationships.',
    description: 'Resolves interpersonal friction promptly and constructive mediation to maintain cohesion.',
    default_weight: 8.33,
  },
  {
    id: 'default_team_3',
    category_name: 'Team building and Collaboration',
    name: 'Empathise and use emotional intelligence to understand and support team members.',
    description: 'Demonstrates active listening, empathy, and emotional awareness in interpersonal dynamics.',
    default_weight: 8.33,
  },
];

// Default standard qualitative performance factors for Staff / Individual Contributors (ICs)
const DEFAULT_STAFF_FACTORS = [
  {
    id: 'default_staff_lead_1',
    category_name: 'Self-Leadership & Ownership',
    name: 'Takes full ownership of assigned tasks, works independently, and meets deadlines.',
    description: 'Demonstrates high dependability, minimal oversight requirements, and proactive task execution.',
    default_weight: 8.33,
  },
  {
    id: 'default_staff_lead_2',
    category_name: 'Self-Leadership & Ownership',
    name: 'Remains flexible and positive when priorities shift, handling pressure constructively.',
    description: 'Maintains composure and positive problem-solving mindset amid shifting operational demands.',
    default_weight: 8.33,
  },
  {
    id: 'default_staff_lead_3',
    category_name: 'Self-Leadership & Ownership',
    name: 'Actively seeks to expand skills, accepts feedback, and applies new knowledge.',
    description: 'Shows strong desire for personal growth, takes constructive criticism positively, and upskills.',
    default_weight: 8.33,
  },
  {
    id: 'default_staff_strat_1',
    category_name: 'Goal Alignment & Execution',
    name: 'Understands departmental objectives and aligns daily tasks to support team goals.',
    description: 'Connects individual output to larger unit targets, ensuring daily efforts drive team success.',
    default_weight: 8.33,
  },
  {
    id: 'default_staff_strat_2',
    category_name: 'Goal Alignment & Execution',
    name: 'Prioritizes tasks effectively, manages workload, and optimizes available resources.',
    description: 'Structures workday efficiently, meets milestone deadlines, and eliminates operational waste.',
    default_weight: 8.33,
  },
  {
    id: 'default_staff_strat_3',
    category_name: 'Goal Alignment & Execution',
    name: 'Consistently produces accurate, high-quality work meeting organizational standards.',
    description: 'Maintains rigorous quality controls and minimizes rework through sharp attention to detail.',
    default_weight: 8.33,
  },
  {
    id: 'default_staff_prob_1',
    category_name: 'Problem Solving & Analytical Thinking',
    name: 'Identifies issues promptly, investigates root causes, and proposes sound solutions.',
    description: 'Acts swiftly to flag operational roadblocks and formulates actionable remedies.',
    default_weight: 8.33,
  },
  {
    id: 'default_staff_prob_2',
    category_name: 'Problem Solving & Analytical Thinking',
    name: 'Applies logical reasoning and objective data to make sound daily decisions.',
    description: 'Bases task choices on factual evidence and verified procedures.',
    default_weight: 8.33,
  },
  {
    id: 'default_staff_prob_3',
    category_name: 'Problem Solving & Analytical Thinking',
    name: 'Suggests practical improvements to workflows, tools, or team processes.',
    description: 'Contributes innovative ideas to simplify daily routines and boost productivity.',
    default_weight: 8.33,
  },
  {
    id: 'default_staff_team_1',
    category_name: 'Teamwork & Communication',
    name: 'Cooperates smoothly across teams and actively supports colleagues to achieve goals.',
    description: 'Builds positive working relationships, offers help proactively, and shares credit.',
    default_weight: 8.33,
  },
  {
    id: 'default_staff_team_2',
    category_name: 'Teamwork & Communication',
    name: 'Communicates ideas, updates, and feedback clearly both verbally and in writing.',
    description: 'Keeps managers and teammates informed with concise, professional, and respectful communication.',
    default_weight: 8.33,
  },
  {
    id: 'default_staff_team_3',
    category_name: 'Teamwork & Communication',
    name: 'Maintains respectful relationships and handles differences with emotional maturity.',
    description: 'Treats all colleagues with dignity, de-escalates misunderstandings, and fosters harmony.',
    default_weight: 8.33,
  },
];

// Default standard qualitative performance factors for Dashboard Champions & HR Admins
const DEFAULT_CHAMPION_FACTORS = [
  {
    id: 'default_champ_gov_1',
    category_name: 'Performance Governance & Oversight',
    name: 'Monitors organization-wide performance cycles, ensuring on-time completion and compliance.',
    description: 'Tracks institutional review deadlines, completion velocity, and audit compliance across units.',
    default_weight: 12.50,
  },
  {
    id: 'default_champ_gov_2',
    category_name: 'Performance Governance & Oversight',
    name: 'Identifies bottlenecks in appraisal workflows and proactively engages stakeholders to resolve them.',
    description: 'Unblocks delayed appraisals, engages department leads, and accelerates workflow throughput.',
    default_weight: 12.50,
  },
  {
    id: 'default_champ_bi_1',
    category_name: 'Data Integrity & BI Analytics',
    name: 'Ensures high data accuracy, reliable KPI metrics, and consistent scoring standards across teams.',
    description: 'Maintains rigor in metric definitions, validation gates, and score aggregation integrity.',
    default_weight: 12.50,
  },
  {
    id: 'default_champ_bi_2',
    category_name: 'Data Integrity & BI Analytics',
    name: 'Transforms raw performance and review data into actionable dashboards and executive reports.',
    description: 'Produces high-value visual dashboards and analytics that inform strategic leadership.',
    default_weight: 12.50,
  },
  {
    id: 'default_champ_strat_1',
    category_name: 'Strategic Insights & Decision Support',
    name: 'Provides leadership with objective insights, cross-departmental trends, and early risk detection.',
    description: 'Synthesizes enterprise data to highlight emerging performance trends and organizational risks.',
    default_weight: 12.50,
  },
  {
    id: 'default_champ_strat_2',
    category_name: 'Strategic Insights & Decision Support',
    name: 'Identifies systemic performance gaps and recommends data-driven interventions and development plans.',
    description: 'Recommends targeted interventions, training, or PIPs based on empirical performance gaps.',
    default_weight: 12.50,
  },
  {
    id: 'default_champ_enable_1',
    category_name: 'Stakeholder Enablement & Calibration',
    name: 'Actively trains and supports managers and staff to drive high adoption of the performance system.',
    description: 'Builds institutional capability by empowering users through hands-on guidance and best practices.',
    default_weight: 12.50,
  },
  {
    id: 'default_champ_enable_2',
    category_name: 'Stakeholder Enablement & Calibration',
    name: 'Facilitates objective calibration and promotes fair, evidence-based evaluations across all teams.',
    description: 'Drives calibration sessions to eliminate rating bias, grade inflation, and appraisal skew.',
    default_weight: 12.50,
  },
];

const STAFF_CATEGORY_NAMES = [
  'Self-Leadership & Ownership',
  'Goal Alignment & Execution',
  'Problem Solving & Analytical Thinking',
  'Teamwork & Communication'
];

const MANAGER_CATEGORY_NAMES = [
  'Leadership',
  'Strategic thinking',
  'Problem Solving',
  'Team building and Collaboration'
];

const CHAMPION_CATEGORY_NAMES = [
  'Performance Governance & Oversight',
  'Data Integrity & BI Analytics',
  'Strategic Insights & Decision Support',
  'Stakeholder Enablement & Calibration'
];

const LIKERT_LEVELS = [
  { value: 1, shortLabel: 'Strongly Disagree', label: '1 - Strongly Disagree', color: '#ef4444', bg: '#fef2f2', border: '#fca5a5' },
  { value: 2, shortLabel: 'Disagree', label: '2 - Disagree', color: '#f97316', bg: '#fff7ed', border: '#fdba74' },
  { value: 3, shortLabel: 'Neither Agree nor Disagree', label: '3 - Neither Agree nor Disagree', color: '#64748b', bg: '#f8fafc', border: '#cbd5e1' },
  { value: 4, shortLabel: 'Agree', label: '4 - Agree', color: '#3b82f6', bg: '#eff6ff', border: '#93c5fd' },
  { value: 5, shortLabel: 'Strongly Agree', label: '5 - Strongly Agree', color: '#10b981', bg: '#ecfdf5', border: '#6ee7b7' },
];

const SelfAssessmentCompetencyRating = ({ 
  ratings = [], 
  onChange, 
  disabled = false, 
  supervisorMode = false,
  supervisorRatings = [],
  targetRole = null, // Optional explicit override: 'staff' | 'manager' | 'champion'
}) => {
  const { data: serverCompetencies = [], fetchAll: fetchCompetencies } = useCompetencies();
  const { defaultScale, activeScales = [], fetchAll: fetchScales } = useRatingScales();
  const { user, isStaff, isSupervisor, isExecutive, isSuperAdmin, isDashboardChampion, isHrAdmin } = useReviewsPermissions();
  const [expanded, setExpanded] = useState(true);
  const [localRatings, setLocalRatings] = useState({});

  // Determine user appraisal tier: 'champion' | 'staff' | 'manager'
  const appraisalTier = useMemo(() => {
    if (targetRole) {
      const tr = targetRole.toLowerCase();
      if (tr === 'champion' || tr === 'dashboard_champion' || tr === 'hr_admin' || tr === 'hr') return 'champion';
      if (tr === 'staff') return 'staff';
      return 'manager';
    }

    const role = user?.role ? user.role.toLowerCase() : 'staff';
    
    // Check if user is a Dashboard Champion / HR Admin
    if (role === 'dashboard_champion' || role === 'hr_admin' || role === 'hr') {
      return 'champion';
    }
    
    // Check if user is regular staff
    if (role === 'staff' || (isStaff && !isSupervisor && !isExecutive && !isSuperAdmin)) {
      return 'staff';
    }

    // Default to Managerial tier for managers, supervisors, executives
    return 'manager';
  }, [targetRole, user?.role, isStaff, isSupervisor, isExecutive, isSuperAdmin, isDashboardChampion, isHrAdmin]);

  useEffect(() => {
    if (fetchCompetencies && (!serverCompetencies || serverCompetencies.length === 0)) {
      fetchCompetencies().catch(() => {});
    }
  }, [fetchCompetencies, serverCompetencies]);

  useEffect(() => {
    if (fetchScales && (!activeScales || activeScales.length === 0)) {
      fetchScales().catch(() => {});
    }
  }, [fetchScales, activeScales]);

  // Filter competencies based on appraisal tier
  const effectiveCompetencies = useMemo(() => {
    if (Array.isArray(serverCompetencies) && serverCompetencies.length > 0) {
      if (appraisalTier === 'champion') {
        const champComps = serverCompetencies.filter((c) => {
          const cat = c.category_name || (typeof c.category === 'object' ? c.category?.name : '') || '';
          const desc = c.description || '';
          return CHAMPION_CATEGORY_NAMES.includes(cat) || desc.toLowerCase().includes('champion') || desc.toLowerCase().includes('hr admin');
        });
        if (champComps.length > 0) return champComps;
        return DEFAULT_CHAMPION_FACTORS;
      } else if (appraisalTier === 'staff') {
        const staffComps = serverCompetencies.filter((c) => {
          const cat = c.category_name || (typeof c.category === 'object' ? c.category?.name : '') || '';
          const desc = c.description || '';
          return STAFF_CATEGORY_NAMES.includes(cat) || desc.toLowerCase().includes('staff');
        });
        if (staffComps.length > 0) return staffComps;
        return DEFAULT_STAFF_FACTORS;
      } else {
        const mgrComps = serverCompetencies.filter((c) => {
          const cat = c.category_name || (typeof c.category === 'object' ? c.category?.name : '') || '';
          const desc = c.description || '';
          return MANAGER_CATEGORY_NAMES.includes(cat) || desc.toLowerCase().includes('manager');
        });
        if (mgrComps.length > 0) return mgrComps;
        return DEFAULT_MANAGER_FACTORS;
      }
    }

    if (appraisalTier === 'champion') return DEFAULT_CHAMPION_FACTORS;
    if (appraisalTier === 'staff') return DEFAULT_STAFF_FACTORS;
    return DEFAULT_MANAGER_FACTORS;
  }, [serverCompetencies, appraisalTier]);

  // Sync ratings to local state
  useEffect(() => {
    setLocalRatings((prevMap) => {
      const nextMap = { ...prevMap };
      // Ensure each effective competency is present in local ratings map
      effectiveCompetencies.forEach((c) => {
        const idKey = String(c.id);
        if (!nextMap[idKey]) {
          nextMap[idKey] = { score: null, comment: '', name: c.name, category: c.category_name || '' };
        } else {
          nextMap[idKey] = {
            ...nextMap[idKey],
            name: c.name,
            category: c.category_name || nextMap[idKey].category || '',
          };
        }
      });

      // Merge server/parent ratings without clobbering active local ratings
      if (Array.isArray(ratings) && ratings.length > 0) {
        ratings.forEach((r) => {
          const id = r.competency_id || r.competency;
          const idKey = id !== undefined && id !== null ? String(id) : null;
          if (idKey && nextMap[idKey]) {
            const raw = r.raw_score !== undefined ? r.raw_score : (r.score !== undefined ? r.score : null);
            if (raw !== null && raw !== undefined) {
              nextMap[idKey].score = Number(raw);
            }
            if (r.comment !== undefined && r.comment !== null) {
              nextMap[idKey].comment = r.comment;
            }
          }
        });
      }
      return nextMap;
    });
  }, [ratings, effectiveCompetencies]);

  const handleRatingChange = (competencyId, score) => {
    const idKey = String(competencyId);
    const compObj = effectiveCompetencies.find(c => String(c.id) === idKey);
    const numScore = Number(score);
    const current = localRatings[idKey] || { comment: '', name: compObj?.name || '' };
    const updated = { 
      ...localRatings, 
      [idKey]: { ...current, score: numScore, name: compObj?.name || current.name } 
    };
    setLocalRatings(updated);
    
    if (onChange) {
      const ratingsArray = Object.entries(updated).map(([key, value]) => ({
        competency_id: isNaN(key) ? key : Number(key),
        competency_name: value.name,
        raw_score: value.score,
        comment: value.comment || '',
      }));
      onChange(ratingsArray);
    }
  };

  const handleCommentChange = (competencyId, comment) => {
    const idKey = String(competencyId);
    const compObj = effectiveCompetencies.find(c => String(c.id) === idKey);
    const current = localRatings[idKey] || { score: null, name: compObj?.name || '' };
    const updated = { 
      ...localRatings, 
      [idKey]: { ...current, comment, name: compObj?.name || current.name } 
    };
    setLocalRatings(updated);

    if (onChange) {
      const ratingsArray = Object.entries(updated).map(([key, value]) => ({
        competency_id: isNaN(key) ? key : Number(key),
        competency_name: value.name,
        raw_score: value.score,
        comment: value.comment || '',
      }));
      onChange(ratingsArray);
    }
  };

  // Group competencies by category
  const groupedCompetencies = useMemo(() => {
    const groups = {};
    effectiveCompetencies.forEach((comp) => {
      const catName = comp.category_name || (typeof comp.category === 'object' ? comp.category?.name : null) || 'General Performance Factors';
      if (!groups[catName]) {
        groups[catName] = [];
      }
      groups[catName].push(comp);
    });
    return groups;
  }, [effectiveCompetencies]);

  // Calculate completion stats
  const totalFactors = effectiveCompetencies.length;
  const completedFactors = effectiveCompetencies.filter(c => {
    const r = localRatings[String(c.id)];
    return r && r.score !== null && r.score !== undefined && r.score !== '';
  }).length;
  const completionPercentage = totalFactors > 0 ? Math.round((completedFactors / totalFactors) * 100) : 0;

  // Build supervisor rating lookup
  const supervisorRatingMap = useMemo(() => {
    const map = {};
    if (Array.isArray(supervisorRatings)) {
      supervisorRatings.forEach(r => {
        const id = r.competency_id || r.competency;
        if (id !== undefined && id !== null) {
          const raw = r.raw_score !== undefined ? r.raw_score : (r.score || null);
          map[String(id)] = raw;
        }
      });
    }
    return map;
  }, [supervisorRatings]);

  const badgeConfig = {
    champion: {
      label: 'Dashboard Champion & HR Governance Appraisal',
      bg: '#fef3c7',
      color: '#92400e',
      icon: <BarChart3 size={12} />,
      desc: 'Evaluate cycle governance, BI analytics, data integrity, and strategic enablement.'
    },
    staff: {
      label: 'Staff Appraisal (Individual Contributor)',
      bg: '#eff6ff',
      color: '#1d4ed8',
      icon: <UserCheck size={12} />,
      desc: 'Evaluate self-leadership, goal alignment, practical problem solving, and teamwork.'
    },
    manager: {
      label: 'Managerial & Leadership Appraisal',
      bg: '#f5f3ff',
      color: '#6d28d9',
      icon: <Shield size={12} />,
      desc: 'Evaluate leadership, strategic thinking, decision making, and team guidance.'
    }
  }[appraisalTier];

  return (
    <div className="self-assessment-competency-rating" style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', marginBottom: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
      {/* Top Bar with Completion Counter & Audience Badge */}
      <div 
        className="self-assessment-rating-header" 
        onClick={() => setExpanded(!expanded)}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', paddingBottom: expanded ? '14px' : '0', borderBottom: expanded ? '1px solid #e2e8f0' : 'none' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Award size={20} color="#2563eb" />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                Qualitative Performance Factors
              </h3>
              <span style={{ 
                fontSize: '11px', 
                fontWeight: 600, 
                padding: '2px 8px', 
                borderRadius: '12px', 
                background: badgeConfig.bg, 
                color: badgeConfig.color,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                {badgeConfig.icon}
                {badgeConfig.label}
              </span>
            </div>
            <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#64748b' }}>
              {badgeConfig.desc}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: completionPercentage === 100 ? '#16a34a' : '#2563eb' }}>
              {completedFactors} / {totalFactors} Rated ({completionPercentage}%)
            </span>
            <div style={{ width: '100px', height: '5px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden', marginTop: '3px' }}>
              <div style={{ width: `${completionPercentage}%`, height: '100%', background: completionPercentage === 100 ? '#10b981' : '#2563eb', transition: 'width 0.3s ease' }} />
            </div>
          </div>

          <button 
            type="button" 
            className="self-assessment-rating-toggle" 
            style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '5px', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Likert Scale Legend */}
      {expanded && (
        <div style={{ marginTop: '16px', marginBottom: '20px', padding: '12px 16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <Info size={14} color="#64748b" />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Standard 5-Point Evaluation Scale:</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
            {LIKERT_LEVELS.map((lvl) => (
              <div 
                key={lvl.value} 
                style={{ 
                  background: lvl.bg, 
                  border: `1px solid ${lvl.border}`, 
                  padding: '4px 8px', 
                  borderRadius: '6px', 
                  fontSize: '11px', 
                  fontWeight: 600, 
                  color: lvl.color,
                  textAlign: 'center'
                }}
              >
                {lvl.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grouped Category Sections */}
      {expanded && (
        <div className="competencies-category-groups" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {Object.entries(groupedCompetencies).map(([categoryName, items], catIdx) => (
            <div key={categoryName} style={{ border: '1px solid #f1f5f9', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ background: '#f8fafc', padding: '10px 14px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {catIdx + 1}. {categoryName}
                </span>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', background: '#ffffff', padding: '2px 8px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  {items.length} Factors
                </span>
              </div>

              <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {items.map((competency, idx) => {
                  const idKey = String(competency.id);
                  const entry = localRatings[idKey] || localRatings[competency.id];
                  const currentRating = entry && entry.score !== null && entry.score !== undefined ? Number(entry.score) : null;
                  const currentComment = entry?.comment || '';
                  const supervisorScore = supervisorRatingMap[idKey] || supervisorRatingMap[competency.id];

                  return (
                    <div 
                      key={competency.id} 
                      style={{ 
                        padding: '14px', 
                        background: currentRating !== null ? '#fbfcfe' : '#ffffff', 
                        border: currentRating !== null ? '1px solid #bfdbfe' : '1px solid #e2e8f0', 
                        borderRadius: '8px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <div style={{ flex: 1, paddingRight: '12px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', display: 'block', lineHeight: 1.4 }}>
                            {idx + 1}. {competency.name}
                          </span>
                          {competency.description && (
                            <span style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', display: 'block' }}>
                              {competency.description}
                            </span>
                          )}
                        </div>

                        {supervisorMode && supervisorScore && (
                          <div style={{ textAlign: 'right', minWidth: '100px' }}>
                            <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>Supervisor Score:</span>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#16a34a' }}>
                              {supervisorScore} / 5
                            </span>
                          </div>
                        )}
                      </div>

                      {/* 1-5 Radio Buttons Bar */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', marginBottom: '8px' }}>
                        {LIKERT_LEVELS.map((lvl) => {
                          const isSelected = currentRating !== null && Math.round(currentRating) === Number(lvl.value);
                          return (
                            <button
                              key={lvl.value}
                              type="button"
                              disabled={disabled}
                              onClick={() => handleRatingChange(competency.id, lvl.value)}
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '8px 4px',
                                borderRadius: '6px',
                                border: isSelected ? `2px solid ${lvl.color}` : '1px solid #e2e8f0',
                                background: isSelected ? lvl.bg : '#ffffff',
                                cursor: disabled ? 'not-allowed' : 'pointer',
                                transition: 'all 0.15s ease',
                                opacity: disabled ? 0.7 : 1,
                              }}
                            >
                              <span style={{ fontSize: '13px', fontWeight: 700, color: isSelected ? lvl.color : '#334155' }}>
                                {lvl.value}
                              </span>
                              <span style={{ fontSize: '10px', fontWeight: 600, color: isSelected ? lvl.color : '#64748b', marginTop: '2px', textAlign: 'center', lineHeight: 1.1 }}>
                                {lvl.shortLabel}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Optional Evidence / Specific Examples */}
                      <input
                        type="text"
                        disabled={disabled}
                        placeholder="Optional: Provide evidence, context, or specific examples..."
                        value={currentComment}
                        onChange={(e) => handleCommentChange(competency.id, e.target.value)}
                        style={{
                          width: '100%',
                          fontSize: '11px',
                          padding: '6px 10px',
                          borderRadius: '5px',
                          border: '1px solid #e2e8f0',
                          background: '#ffffff',
                          color: '#334155',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SelfAssessmentCompetencyRating;