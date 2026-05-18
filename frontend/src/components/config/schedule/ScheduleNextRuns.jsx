import { useState, useEffect } from 'react';
import { useSchedule } from '../../../hooks/config';
import { FiClock } from 'react-icons/fi';
import { format } from 'date-fns';

export const ScheduleNextRuns = ({ cronExpression }) => {
  const { validateCron } = useSchedule();
  const [nextRuns, setNextRuns] = useState([]);

  useEffect(() => {
    if (!cronExpression) return;
    const fetchNextRuns = async () => {
      try {
        const result = await validateCron.mutateAsync(cronExpression);
        if (result.data?.next_runs) {
          setNextRuns(result.data.next_runs.slice(0, 5));
        }
      } catch (error) {
        setNextRuns([]);
      }
    };
    fetchNextRuns();
  }, [cronExpression]);

  if (nextRuns.length === 0) return <p className="text-sm text-gray-500">Enter a valid cron expression</p>;

  return (
    <div className="space-y-1">
      {nextRuns.map((run, idx) => (
        <div key={idx} className="flex items-center gap-2 text-sm">
          <FiClock className="text-gray-400 text-xs" />
          <span className="font-mono">{format(new Date(run), 'MMM dd, yyyy HH:mm:ss')}</span>
        </div>
      ))}
    </div>
  );
};