// frontend/src/components/tenant/provisioning/ProvisioningSteps.jsx
import React from 'react';
import './provisioning.css';

export const ProvisioningSteps = ({ currentStep = 0, steps = {}, status = 'idle' }) => {
    const getStepStatus = (stepIndex, stepName) => {
        // Guard against undefined steps or missing step
        if (!steps || !steps[stepName]) {
            return 'pending';
        }

        const step = steps[stepName];

        // Check if this step is completed
        if (step.completed) return 'completed';
        // Check if this step failed
        if (step.failed) return 'failed';
        // Check if this is the current step
        if (stepIndex === currentStep && status === 'provisioning') return 'active';
        // Otherwise pending
        return 'pending';
    };

    const getIcon = (stepStatus) => {
        switch (stepStatus) {
            case 'completed':
                return '✓';
            case 'active':
                return '⟳';
            case 'failed':
                return '✗';
            default:
                return '○';
        }
    };

    const stepList = [
        { key: 'schema', title: 'Creating Schema', description: 'Setting up database schema' },
        { key: 'migrations', title: 'Running Migrations', description: 'Applying database migrations' },
        { key: 'data', title: 'Seeding Data', description: 'Loading initial data' },
        { key: 'resources', title: 'Configuring Resources', description: 'Setting up resource limits' },
        { key: 'activation', title: 'Activating Tenant', description: 'Finalizing setup' },
    ];

    // If steps is empty or undefined, show loading state
    if (!steps || Object.keys(steps).length === 0) {
        return (
            <div className="provisioning-steps">
                {stepList.map((step) => (
                    <div key={step.key} className="provisioning-step provisioning-step-pending">
                        <div className="provisioning-step-icon provisioning-step-icon-pending">
                            ○
                        </div>
                        <div className="provisioning-step-content">
                            <div className="provisioning-step-title">{step.title}</div>
                            <div className="provisioning-step-description">{step.description}</div>
                        </div>
                        <div className="provisioning-step-status provisioning-step-status-pending">
                            Pending
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="provisioning-steps">
            {stepList.map((step, index) => {
                const stepStatus = getStepStatus(index, step.key);

                return (
                    <div key={step.key} className={`provisioning-step provisioning-step-${stepStatus}`}>
                        <div className={`provisioning-step-icon provisioning-step-icon-${stepStatus}`}>
                            {getIcon(stepStatus)}
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

// PropTypes for better type checking (optional but recommended)
ProvisioningSteps.propTypes = {
    currentStep: React.PropTypes.number,
    steps: React.PropTypes.shape({
        schema: React.PropTypes.shape({
            completed: React.PropTypes.bool,
            failed: React.PropTypes.bool
        }),
        migrations: React.PropTypes.shape({
            completed: React.PropTypes.bool,
            failed: React.PropTypes.bool
        }),
        data: React.PropTypes.shape({
            completed: React.PropTypes.bool,
            failed: React.PropTypes.bool
        }),
        resources: React.PropTypes.shape({
            completed: React.PropTypes.bool,
            failed: React.PropTypes.bool
        }),
        activation: React.PropTypes.shape({
            completed: React.PropTypes.bool,
            failed: React.PropTypes.bool
        })
    }),
    status: React.PropTypes.oneOf(['idle', 'provisioning', 'completed', 'failed'])
};

// Default props
ProvisioningSteps.defaultProps = {
    currentStep: 0,
    steps: {},
    status: 'idle'
};