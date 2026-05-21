import { FiShield, FiLock, FiActivity } from 'react-icons/fi';

const levelClass = (level) => {
  if (level === 'critical' || level === 'restricted') return `config-registry-cia-badge--${level}`;
  if (level === 'high') return 'config-registry-cia-badge--high';
  return 'config-registry-cia-badge--standard';
};

export const CIABadge = ({ classification }) => {
  if (!classification) return null;
  const { confidentiality, integrity, availability, is_critical } = classification;

  return (
    <div className="config-registry-cia-badges">
      {is_critical && (
        <span className="config-registry-cia-badge config-registry-cia-badge--critical">
          <FiActivity /> Critical
        </span>
      )}
      <span className={`config-registry-cia-badge ${levelClass(confidentiality)}`}>
        <FiLock /> C: {confidentiality}
      </span>
      <span className={`config-registry-cia-badge ${levelClass(integrity)}`}>
        <FiShield /> I: {integrity}
      </span>
      <span className={`config-registry-cia-badge ${levelClass(availability)}`}>
        <FiActivity /> A: {availability}
      </span>
    </div>
  );
};
