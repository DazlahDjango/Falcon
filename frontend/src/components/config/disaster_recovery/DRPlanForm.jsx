import { useState, useEffect } from 'react';
import { useDisasterRecovery, useRegistry } from '../../../hooks/config';
import { FiX, FiLoader, FiPlus, FiTrash2 } from 'react-icons/fi';

export const DRPlanForm = ({ plan, onClose, onSuccess }) => {
  const { createPlan, updatePlan } = useDisasterRecovery();
  const { useRegisteredApps } = useRegistry();
  const { data: appsData } = useRegisteredApps();
  const apps = appsData?.data?.results || [];
  
  const [formData, setFormData] = useState({
    name: '',
    app: '',
    rpo_target_minutes: 60,
    rto_target_minutes: 240,
    recovery_steps: [''],
    validation_steps: [''],
    test_frequency_days: 30,
    standby_endpoint: '',
    approval_required: true
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (plan) {
      setFormData({
        name: plan.name,
        app: plan.app,
        rpo_target_minutes: plan.rpo_target_minutes,
        rto_target_minutes: plan.rto_target_minutes,
        recovery_steps: plan.recovery_steps || [''],
        validation_steps: plan.validation_steps || [''],
        test_frequency_days: plan.test_frequency_days,
        standby_endpoint: plan.standby_endpoint || '',
        approval_required: plan.approval_required
      });
    }
  }, [plan]);

  const handleStepChange = (type, index, value) => {
    const steps = [...formData[type]];
    steps[index] = value;
    setFormData({ ...formData, [type]: steps });
  };

  const addStep = (type) => {
    setFormData({ ...formData, [type]: [...formData[type], ''] });
  };

  const removeStep = (type, index) => {
    const steps = formData[type].filter((_, i) => i !== index);
    setFormData({ ...formData, [type]: steps.length ? steps : [''] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const dataToSend = {
        ...formData,
        recovery_steps: formData.recovery_steps.filter(s => s.trim()),
        validation_steps: formData.validation_steps.filter(s => s.trim())
      };
      if (plan) {
        await updatePlan.mutateAsync({ planId: plan.id, data: dataToSend });
      } else {
        await createPlan.mutateAsync(dataToSend);
      }
      onSuccess();
    } catch (error) {
      console.error('Failed to save DR plan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">{plan ? 'Edit DR Plan' : 'Create DR Plan'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><FiX /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Plan Name *</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Application *</label>
            <select value={formData.app} onChange={(e) => setFormData({ ...formData, app: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required>
              <option value="">Select an app...</option>
              {apps.map(app => <option key={app.id} value={app.id}>{app.display_name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">RTO Target (minutes)</label>
              <input type="number" value={formData.rto_target_minutes} onChange={(e) => setFormData({ ...formData, rto_target_minutes: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" min="5" max="1440" />
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">RPO Target (minutes)</label>
              <input type="number" value={formData.rpo_target_minutes} onChange={(e) => setFormData({ ...formData, rpo_target_minutes: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" min="5" max="10080" />
            </div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Recovery Steps</label>
            {formData.recovery_steps.map((step, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <input type="text" value={step} onChange={(e) => handleStepChange('recovery_steps', idx, e.target.value)} placeholder={`Step ${idx + 1}`} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg" />
                <button type="button" onClick={() => removeStep('recovery_steps', idx)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><FiTrash2 /></button>
              </div>
            ))}
            <button type="button" onClick={() => addStep('recovery_steps')} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"><FiPlus /> Add Step</button>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Validation Steps</label>
            {formData.validation_steps.map((step, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <input type="text" value={step} onChange={(e) => handleStepChange('validation_steps', idx, e.target.value)} placeholder={`Step ${idx + 1}`} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg" />
                <button type="button" onClick={() => removeStep('validation_steps', idx)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><FiTrash2 /></button>
              </div>
            ))}
            <button type="button" onClick={() => addStep('validation_steps')} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"><FiPlus /> Add Step</button>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Standby Endpoint</label>
            <input type="url" value={formData.standby_endpoint} onChange={(e) => setFormData({ ...formData, standby_endpoint: e.target.value })} placeholder="https://standby.example.com" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div><label className="flex items-center gap-2"><input type="checkbox" checked={formData.approval_required} onChange={(e) => setFormData({ ...formData, approval_required: e.target.checked })} className="w-4 h-4" /> Require Super Admin approval before execution</label></div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit" disabled={isLoading} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {isLoading ? <FiLoader className="animate-spin" /> : null}
              {plan ? 'Update Plan' : 'Create Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};