import React, { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiRefreshCw, FiArrowLeft, FiCheckCircle, FiAlertTriangle, FiList } from 'react-icons/fi';
import { useHierarchy } from '../../../hooks/structure';
import { StructureLoading, StructureEmptyState } from '../common';
import { STRUCTURE_ROUTES } from '../../../config/constants/structureRouteConstants';
import './hierarchy.css';

export const HierarchyValidate = () => {
  const navigate = useNavigate();
  const { validationResult, isLoading, error, validate, clearError } = useHierarchy({ autoFetch: false });

  useEffect(() => {
    validate();
  }, [validate]);

  const handleRefresh = useCallback(() => {
    validate();
  }, [validate]);

  const handleBack = useCallback(() => {
    navigate(STRUCTURE_ROUTES.HIERARCHY);
  }, [navigate]);

  const handleEditNode = useCallback((id, level) => {
    const targetLevel = level || 'department';
    if (targetLevel === 'division') {
      navigate(STRUCTURE_ROUTES.DIVISION_EDIT(id));
    } else if (targetLevel === 'department') {
      navigate(STRUCTURE_ROUTES.DEPARTMENT_EDIT(id));
    } else if (targetLevel === 'section') {
      navigate(STRUCTURE_ROUTES.SECTION_EDIT(id));
    } else if (targetLevel === 'unit') {
      navigate(STRUCTURE_ROUTES.UNIT_EDIT(id));
    }
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="hierarchy-detail-loading">
        <StructureLoading text="Validating organizational structure..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="hierarchy-detail-error">
        <p>{error}</p>
        <button onClick={clearError} className="btn btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  if (!validationResult) {
    return (
      <StructureEmptyState
        title="Validation Not Run"
        description="Could not load validation results."
        actionLabel="Run Validation"
        onAction={handleRefresh}
      />
    );
  }

  const { is_valid, integrity_issues = [], cycles = 0, cycle_details = [] } = validationResult;

  return (
    <div className="hierarchy-detail-container">
      <div className="hierarchy-detail-header">
        <div className="header-left">
          <button onClick={handleBack} className="back-btn">
            <FiArrowLeft size={18} />
            Back
          </button>
          <h1>Hierarchy Validation</h1>
          {is_valid ? (
            <span className="version-type-badge type-auto" style={{ backgroundColor: '#e6fffa', color: '#047857' }}>
              <FiCheckCircle className="inline mr-1" /> Valid
            </span>
          ) : (
            <span className="version-type-badge type-manual" style={{ backgroundColor: '#fef2f2', color: '#b91c1c' }}>
              <FiAlertTriangle className="inline mr-1" /> Issues Detected
            </span>
          )}
        </div>
        <div className="header-right">
          <button onClick={handleRefresh} className="btn btn-secondary" title="Re-Run Validation">
            <FiRefreshCw size={16} /> Re-run Validation
          </button>
        </div>
      </div>

      <div className="hierarchy-detail-body">
        
        {is_valid ? (
          <div className="detail-section" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <FiCheckCircle size={64} color="#10b981" style={{ margin: '0 auto', marginBottom: '20px' }} />
            <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Structure is perfectly healthy!</h3>
            <p style={{ color: '#6b7280', maxWidth: '500px', margin: '0 auto' }}>
              No circular reporting loops, missing levels, or structural integrity issues were found.
            </p>
          </div>
        ) : (
          <div className="validation-issues-container">
            {cycles > 0 && (
              <div className="detail-section" style={{ borderLeft: '4px solid #ef4444' }}>
                <h3 className="flex items-center text-red-600">
                  <FiAlertTriangle className="mr-2" /> Circular References Detected ({cycles})
                </h3>
                <p className="mb-4 text-sm text-gray-600">
                  A circular reference happens when a unit reports to another unit which eventually reports back to itself. This must be fixed to ensure proper reporting lines.
                </p>
                <ul className="divide-y divide-gray-100 space-y-2">
                  {cycle_details.map((cycle, idx) => (
                    <li key={idx} className="text-sm flex items-center justify-between py-2">
                      <div>
                        <span className="font-semibold text-gray-800">Unit:</span> {cycle.code || cycle.node_id} 
                        {cycle.description && <span className="text-gray-500 block text-xs mt-0.5">{cycle.description}</span>}
                      </div>
                      <button
                        onClick={() => handleEditNode(cycle.node_id, cycle.level)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-semibold px-2 py-1 bg-blue-50 rounded"
                      >
                        Fix Hierarchy
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {integrity_issues.length > 0 && (
              <div className="detail-section" style={{ borderLeft: '4px solid #f59e0b', marginTop: '20px' }}>
                <h3 className="flex items-center text-yellow-600">
                  <FiList className="mr-2" /> Integrity Issues ({integrity_issues.length})
                </h3>
                <p className="mb-4 text-sm text-gray-600">
                  These units are violating structural rules, such as reporting to the wrong parent level, exceeding maximum depth, or having duplicate paths/codes.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 bg-gray-50 uppercase">
                      <tr>
                        <th className="px-4 py-3 border-b">Unit / Code</th>
                        <th className="px-4 py-3 border-b">Error Description</th>
                        <th className="px-4 py-3 border-b text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {integrity_issues.map((issue, idx) => (
                        <tr key={idx} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {issue.code || issue.id}
                          </td>
                          <td className="px-4 py-3 text-red-500 font-medium">
                            {issue.error}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleEditNode(issue.id, issue.level)}
                              className="text-xs text-blue-600 hover:text-blue-800 font-semibold px-2 py-1 bg-blue-50 rounded"
                            >
                              Fix
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default HierarchyValidate;
