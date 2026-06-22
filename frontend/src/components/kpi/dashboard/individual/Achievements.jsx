import React from 'react';
import { FiAward, FiStar, FiZap} from 'react-icons/fi';

const Achievements = ({ achievements }) => {
    const getAchievementIcon = (type) => {
        switch (type) {
            case 'gold': return <FiZap size={20} color="#FFD700" />;
            case 'silver': return <FiAward size={20} color="#C0C0C0" />;
            default: return <FiStar size={20} color="#CD7F32" />;
        }
    };
    
    if (!achievements || achievements.length === 0) {
        return (
            <div className="dashboard-card">
                <div className="card-header">
                    <h3>Achievements</h3>
                </div>
                <div className="card-empty">No achievements yet</div>
            </div>
        );
    }
    
    return (
        <div className="dashboard-card">
            <div className="card-header">
                <h3>Achievements</h3>
                <span className="card-count">{achievements.length} earned</span>
            </div>
            <div className="achievements-list">
                {achievements.map((achievement, index) => (
                    <div key={index} className="achievement-item">
                        <div className="achievement-icon">
                            {getAchievementIcon(achievement.type)}
                        </div>
                        <div className="achievement-content">
                            <div className="achievement-title">{achievement.title}</div>
                            <div className="achievement-date">{achievement.date}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Achievements;