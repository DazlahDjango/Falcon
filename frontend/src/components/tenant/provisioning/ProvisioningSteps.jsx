import React from 'react';
import { PIPELINE_STEPS, getStepStates } from '../../../services/tenant';

const ICONS = {
  completed: '✓',
  active: '↻',
  failed: '✕',
  pending: '○',
};

export const ProvisioningSteps = ({ provMeta = {}, orgStatus = 'PENDING' }) => {
  const stepStates = getStepStates(provMeta, orgStatus);

  return (
    <div className="provisioning-steps">
      {PIPELINE_STEPS.map((step, index) => {
        const stepStatus = stepStates[index] || 'pending';
        return (
          <div key={step.code} className={`provisioning-step provisioning-step-${stepStatus}`}>
            <div className={`provisioning-step-icon provisioning-step-icon-${stepStatus}`}>
              {ICONS[stepStatus]}
            </div>
            <div className="provisioning-step-content">
              <div className="provisioning-step-title">{step.title}</div>
              <div className="provisioning-step-description">{step.description}</div>
            </div>
            <div className={`provisioning-step-status provisioning-step-status-${stepStatus}`}>
              {stepStatus === 'completed' && 'Done'}
              {stepStatus === 'active' && 'In Progress'}
              {stepStatus === 'pending' && 'Pending'}
              {stepStatus === 'failed' && 'Failed'}
            </div>
          </div>
        );
      })}
    </div>
  );
};
