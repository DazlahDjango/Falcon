import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiChevronRight, FiUser, FiArrowUp } from 'react-icons/fi';
import { fetchReportingChain } from '../../../store/slices/teamSlice';
import { SkeletonLoader } from '../../../common/Feedback/LoadingScreen';

const ReportingChain = ({ userId }) => {
    const dispatch = useDispatch();
    const { reportingChain, isLoading } = useSelector((state) => state.team);
    const { user: currentUser } = useSelector((state) => state.auth);
    const targetId = userId || currentUser?.id;
    useEffect(() => {
        if (targetId) {
            dispatch(fetchReportingChain(targetId));
        }
    }, [dispatch, targetId]);
    if (isLoading) {
        return <SkeletonLoader type='list' count={3} />
    }
    if (!reportingChain || reportingChain.length === 0) {
        return (
            <div className="reporting-chain empty">
                <p>No repoting available</p>
            </div>
        );
    }
    return (
        <div className="reporting-chain">
            <h3 className="chain-title">
                <FiArrowUp size={16} />
                Reporting Chain
            </h3>
            <div className="chain-items">
                {reportingChain.map((manager, index) => (
                    <div key={manager.id} className="chain-item">
                        <div className="chain-avatar">
                            <img 
                                src={manager.avatar_url || '/static/accounts/img/default-avatar.png'} 
                                alt={manager.name}
                            />
                        </div>
                        <div className="chain-info">
                            <div className="chain-name">{manager.name}</div>
                            <div className="chain-role">{manager.role_display}</div>
                            {manager.title && <div className="chain-title-text">{manager.title}</div>}
                        </div>
                        {index < reportingChain.length - 1 && (
                            <div className="chain-arrow">
                                <FiChevronRight size={20} />
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <div className="chain-current">
                <div className="chain-avatar">
                    <img 
                        src={currentUser?.avatar_url || '/static/accounts/img/default-avatar.png'} 
                        alt={currentUser?.name}
                    />
                </div>
                <div className="chain-info">
                    <div className="chain-name">{currentUser?.name} (You)</div>
                    <div className="chain-role">{currentUser?.role_display}</div>
                </div>
            </div>
        </div>
    );
};
export default ReportingChain;
