import { useState } from 'react';
import { useSchedule } from '../../../hooks/config';
import { FiToggleLeft, FiToggleRight } from 'react-icons/fi';

export const ScheduleToggle = ({ schedule, onToggle }) => {
  const { updateSchedule } = useSchedule();
  const [isUpdating, setIsUpdating] = useState(false);
  const isActive = schedule.status === 'active';

  const handleToggle = async () => {
    setIsUpdating(true);
    try {
      await updateSchedule.mutateAsync({
        scheduleId: schedule.id,
        data: { status: isActive ? 'paused' : 'active' }
      });
      onToggle?.();
    } catch (error) {
      console.error('Failed to toggle schedule:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <button onClick={handleToggle} disabled={isUpdating} className="focus:outline-none">
      {isActive ? (
        <FiToggleRight className="text-green-600 text-2xl hover:text-green-700" />
      ) : (
        <FiToggleLeft className="text-gray-400 text-2xl hover:text-gray-500" />
      )}
    </button>
  );
};