// frontend/src/pages/tenant/TenantDomainsPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { DomainListTable, DomainCreateForm, DomainVerifyModal, DomainDeleteModal } from '../../components/tenant/domains';
import { fetchDomains, addDomain, deleteDomain, verifyDomain, setPrimaryDomain, selectDomains, selectTenantLoading } from '../../store/tenant';

export const TenantDomainsPage = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const domains = useSelector(selectDomains);
    const loading = useSelector(selectTenantLoading);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [verifyingDomain, setVerifyingDomain] = useState(null);
    const [deletingDomain, setDeletingDomain] = useState(null);

    useEffect(() => {
        if (id) {
            dispatch(fetchDomains(id));
        }
    }, [dispatch, id]);

    const handleAddDomain = async (data) => {
        await dispatch(addDomain({ tenantId: id, data }));
        setShowCreateForm(false);
    };

    const handleDeleteDomain = async () => {
        if (deletingDomain) {
            await dispatch(deleteDomain({ tenantId: id, domainId: deletingDomain.id }));
            setDeletingDomain(null);
        }
    };

    const handleVerifyDomain = async () => {
        if (verifyingDomain) {
            await dispatch(verifyDomain({ tenantId: id, domainId: verifyingDomain.id }));
            setVerifyingDomain(null);
        }
    };

    const handleSetPrimary = async (domainId) => {
        await dispatch(setPrimaryDomain({ tenantId: id, domainId }));
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Custom Domains</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage custom domains for this tenant</p>
                </div>
                <button
                    onClick={() => setShowCreateForm(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    + Add Domain
                </button>
            </div>

            <DomainListTable
                domains={domains}
                onVerify={(domain) => setVerifyingDomain(domain)}
                onSetPrimary={handleSetPrimary}
                onDelete={(domain) => setDeletingDomain(domain)}
                loading={loading}
            />

            {showCreateForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">Add Custom Domain</h3>
                        <DomainCreateForm
                            onSubmit={handleAddDomain}
                            onCancel={() => setShowCreateForm(false)}
                        />
                    </div>
                </div>
            )}

            <DomainVerifyModal
                isOpen={!!verifyingDomain}
                onClose={() => setVerifyingDomain(null)}
                onConfirm={handleVerifyDomain}
                domain={verifyingDomain}
            />

            <DomainDeleteModal
                isOpen={!!deletingDomain}
                onClose={() => setDeletingDomain(null)}
                onConfirm={handleDeleteDomain}
                domainName={deletingDomain?.domain}
            />
        </div>
    );
};