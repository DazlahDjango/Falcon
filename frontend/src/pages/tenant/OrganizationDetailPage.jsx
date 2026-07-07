// pages/tenant/OrganizationDetailPage.jsx
import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { OrganizationDetail, OrganizationForm } from '../../components/tenant';

const OrganizationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = location.pathname.includes('/edit');

  const handleBack = () => {
    navigate('/tenant/organizations');
  };

  const handleEdit = (orgId) => {
    navigate(`/tenant/organizations/${orgId}/edit`);
  };

  const handleEditSuccess = () => {
    navigate(`/tenant/organizations/${id}`);
  };

  if (isEditMode) {
    return (
      <div className="tenant-app">
        <div className="org-container org-mb-6">
          <div className="org-header org-mb-6">
            <button className="org-btn org-btn-secondary" onClick={handleBack}>
              ← Back
            </button>
            <h1 className="org-title" style={{ marginLeft: '16px' }}>Edit Organization</h1>
          </div>
          <OrganizationForm
            organizationId={id}
            onSuccess={handleEditSuccess}
            onCancel={handleBack}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="tenant-app">
      <OrganizationDetail
        organizationId={id}
        onBack={handleBack}
        onEdit={handleEdit}
      />
    </div>
  );
};

export default OrganizationDetailPage;