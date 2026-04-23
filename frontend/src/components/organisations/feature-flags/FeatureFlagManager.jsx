import React, { useState, useEffect } from 'react';
import { useFeatureFlags } from '../../../hooks/organisations';
import { Card, CardHeader, CardTitle, CardContent } from '../../common/UI';
import { Button } from '../../common/UI';
import { Badge } from '../../common/UI';
import { Input } from '../../common/UI';
import { Loader2, Settings, Plus, Edit, Save, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

const FeatureFlagManager = () => {
  const {
    featureFlags,
    loading,
    error,
    fetchFeatureFlags,
    createFeatureFlag,
    updateFeatureFlag,
    deleteFeatureFlag
  } = useFeatureFlags();

  const [editingFlag, setEditingFlag] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    feature_name: '',
    is_enabled: true,
    config: {}
  });

  useEffect(() => {
    fetchFeatureFlags();
  }, [fetchFeatureFlags]);

  const handleToggle = async (flag) => {
    try {
      await updateFeatureFlag(flag.id, { is_enabled: !flag.is_enabled });
      toast.success(`Feature ${flag.feature_name} ${!flag.is_enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error('Failed to update feature flag');
    }
  };

  const handleEdit = (flag) => {
    setEditingFlag(flag.id);
    setFormData({
      feature_name: flag.feature_name,
      is_enabled: flag.is_enabled,
      config: flag.config || {}
    });
  };

  const handleSave = async () => {
    try {
      await updateFeatureFlag(editingFlag, formData);
      setEditingFlag(null);
      toast.success('Feature flag updated successfully');
    } catch (error) {
      toast.error('Failed to update feature flag');
    }
  };

  const handleCreate = async () => {
    try {
      await createFeatureFlag(formData);
      setIsCreateDialogOpen(false);
      setFormData({ feature_name: '', is_enabled: true, config: {} });
      toast.success('Feature flag created successfully');
    } catch (error) {
      toast.error('Failed to create feature flag');
    }
  };

  const handleDelete = async (flagId) => {
    if (window.confirm('Are you sure you want to delete this feature flag?')) {
      try {
        await deleteFeatureFlag(flagId);
        toast.success('Feature flag deleted successfully');
      } catch (error) {
        toast.error('Failed to delete feature flag');
      }
    }
  };

  const handleConfigChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      config: { ...prev.config, [key]: value }
    }));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Loading feature flags...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-red-600">
            <p>Failed to load feature flags</p>
            <Button
              variant="outline"
              onClick={fetchFeatureFlags}
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Feature Flags
            </CardTitle>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Feature Flag
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Feature Flag</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="feature_name">Feature Name</Label>
                    <Input
                      id="feature_name"
                      value={formData.feature_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, feature_name: e.target.value }))}
                      placeholder="Enter feature name"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_enabled"
                      checked={formData.is_enabled}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_enabled: checked }))}
                    />
                    <Label htmlFor="is_enabled">Enabled</Label>
                  </div>
                  <div>
                    <Label htmlFor="config">Configuration (JSON)</Label>
                    <Textarea
                      id="config"
                      value={JSON.stringify(formData.config, null, 2)}
                      onChange={(e) => {
                        try {
                          const config = JSON.parse(e.target.value);
                          setFormData(prev => ({ ...prev, config }));
                        } catch (error) {
                          // Invalid JSON, keep as string for now
                        }
                      }}
                      placeholder="{}"
                      rows={4}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreate}>
                      Create
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {featureFlags && featureFlags.length > 0 ? (
              featureFlags.map(flag => (
                <div key={flag.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="font-medium">{flag.feature_name}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant={flag.is_enabled ? 'default' : 'secondary'}>
                            {flag.is_enabled ? 'Enabled' : 'Disabled'}
                          </Badge>
                          {flag.config && Object.keys(flag.config).length > 0 && (
                            <Badge variant="outline">Configured</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={flag.is_enabled}
                        onCheckedChange={() => handleToggle(flag)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(flag)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(flag.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {editingFlag === flag.id && (
                    <div className="mt-4 space-y-4 border-t pt-4">
                      <div>
                        <Label>Feature Name</Label>
                        <Input
                          value={formData.feature_name}
                          onChange={(e) => setFormData(prev => ({ ...prev, feature_name: e.target.value }))}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={formData.is_enabled}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_enabled: checked }))}
                        />
                        <Label>Enabled</Label>
                      </div>
                      <div>
                        <Label>Configuration (JSON)</Label>
                        <Textarea
                          value={JSON.stringify(formData.config, null, 2)}
                          onChange={(e) => {
                            try {
                              const config = JSON.parse(e.target.value);
                              setFormData(prev => ({ ...prev, config }));
                            } catch (error) {
                              // Invalid JSON
                            }
                          }}
                          rows={4}
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setEditingFlag(null)}>
                          Cancel
                        </Button>
                        <Button onClick={handleSave}>
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No feature flags configured
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeatureFlagManager;