// src/components/reviews/cycles/detail/CycleParticipants.jsx
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectCycleParticipants } from '../../../../store/reviews/selectors';
import { Users, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { ReviewLoading, ReviewSearchBar } from '../../common';

const CycleParticipants = ({ cycleId }) => {
  const participants = useSelector((state) => selectCycleParticipants(state));
  const [searchTerm, setSearchTerm] = useState('');
  const [expanded, setExpanded] = useState(false);

  if (!participants) return <ReviewLoading size="sm" text="Loading participants..." />;

  const filtered = participants.employees?.filter((emp) =>
    emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const displayCount = expanded ? filtered.length : Math.min(filtered.length, 5);

  return (
    <div className="cycle-participants">
      <div className="cycle-participants-header">
        <div className="cycle-participants-title-section">
          <Users size={20} />
          <h3 className="cycle-participants-title">Participants</h3>
          <span className="cycle-participants-count">{participants.total || 0}</span>
        </div>
        <ReviewSearchBar
          placeholder="Search participants..."
          onSearch={setSearchTerm}
          className="cycle-participants-search"
          size="sm"
        />
      </div>

      <div className="cycle-participants-list">
        {filtered.length === 0 ? (
          <div className="cycle-participants-empty">
            {searchTerm ? 'No participants found' : 'No participants yet'}
          </div>
        ) : (
          <>
            {filtered.slice(0, displayCount).map((employee) => (
              <div key={employee.id} className="cycle-participants-item">
                <div className="cycle-participants-avatar">
                  {employee.name?.charAt(0) || 'U'}
                </div>
                <div className="cycle-participants-info">
                  <span className="cycle-participants-name">{employee.name}</span>
                  <span className="cycle-participants-email">{employee.email}</span>
                </div>
              </div>
            ))}
            {filtered.length > 5 && (
              <button
                className="cycle-participants-toggle"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? (
                  <>
                    <ChevronUp size={16} />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown size={16} />
                    Show {filtered.length - 5} more
                  </>
                )}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CycleParticipants;