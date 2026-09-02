import React from 'react';
import { FiTarget, FiUser, FiCalendar, FiFolder, FiTag, FiHash, FiFileText, FiBriefcase } from 'react-icons/fi';
import KPIStatusBadge from '../../common/KPIStatusBadge';

const KPIInfo = ({ kpi }) => {
    const InfoRow = ({ icon, label, value }) => (
        <div className="info-row">
            <div className="info-icon">{icon}</div>
            <div className="info-content">
                <div className="info-label">{label}</div>
                <div className="info-value">{value || '—'}</div>
            </div>
        </div>
    );
    
    return (
        <div className="kpi-info-section">
            <div className="info-grid">
                <InfoRow icon={<FiTag size={16} />} label="Name" value={kpi.name} />
                <InfoRow icon={<FiTarget size={16} />} label="Type" value={kpi.kpi_type_display || kpi.kpi_type} />
                <InfoRow icon={<FiFolder size={16} />} label="Category" value={kpi.category_name || kpi.category_detail?.name || '—'} />
                <InfoRow icon={<FiUser size={16} />} label="Owner" value={kpi.owner_name || kpi.owner_email || '—'} />
                <InfoRow icon={<FiUser size={16} />} label="Department" value={kpi.department_name || '—'} />
                <InfoRow icon={<FiCalendar size={16} />} label="Created" value={new Date(kpi.created_at).toLocaleDateString()} />
                <InfoRow icon={<FiCalendar size={16} />} label="Last Updated" value={new Date(kpi.updated_at).toLocaleDateString()} />
                <InfoRow icon={<FiFileText size={16} />} label="Status" value={<KPIStatusBadge status={kpi.is_active ? 'active' : 'inactive'} />} />
            </div>
            
            <div className="info-description">
                <h4>Description</h4>
                <p>{kpi.description || 'No description provided'}</p>
            </div>
            
            {kpi.strategic_objective && (
                <div className="info-strategic">
                    <h4>Strategic Objective</h4>
                    <p>{kpi.strategic_objective}</p>
                </div>
            )}
            
            <div className="info-meta">
                <div className="meta-item">
                    <span className="meta-label">Calculation Logic:</span>
                    <span className="meta-value">{kpi.calculation_logic_display}</span>
                </div>
                <div className="meta-item">
                    <span className="meta-label">Measure Type:</span>
                    <span className="meta-value">{kpi.measure_type_display}</span>
                </div>
                {kpi.unit && (
                    <div className="meta-item">
                        <span className="meta-label">Unit:</span>
                        <span className="meta-value">{kpi.unit}</span>
                    </div>
                )}
                <div className="meta-item">
                    <span className="meta-label">Decimal Places:</span>
                    <span className="meta-value">{kpi.decimal_places}</span>
                </div>
            </div>
        </div>
    );
};

export default KPIInfo;