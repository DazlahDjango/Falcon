import { useState, useEffect } from 'react';
import { FiClock } from 'react-icons/fi';

export const MaintenanceTimer = ({ endTime, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(endTime) - new Date();
      if (difference <= 0) {
        setTimeLeft(null);
        onExpire?.();
        return;
      }
      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      setTimeLeft({ hours, minutes, seconds });
    };
    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [endTime, onExpire]);

  if (!timeLeft) return null;

  return (
    <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg px-4 py-2">
      <FiClock className="text-orange-600" />
      <span className="font-mono text-lg font-semibold text-orange-700">
        {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
      </span>
      <span className="text-sm text-orange-600">remaining</span>
    </div>
  );
};