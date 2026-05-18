from croniter import croniter
from datetime import datetime
from apps.configs.exceptions import InvalidCronExpressionError

class CronParser:
    def validate(self, cron_expression):
        if not cron_expression or not cron_expression.strip():
            raise InvalidCronExpressionError("Cron expression cannot be empty")
        try:
            croniter(cron_expression, datetime.now())
            return True
        except Exception as e:
            raise InvalidCronExpressionError(f"Invalid cron expression: {str(e)}")
    def get_next_run(self, cron_expression, base_time=None):
        if base_time is None:
            base_time = datetime.now()
        cron = croniter(cron_expression, base_time)
        return cron.get_next(datetime)
    def get_previous_run(self, cron_expression, base_time=None):
        if base_time is None:
            base_time = datetime.now()
        cron = croniter(cron_expression, base_time)
        return cron.get_prev(datetime)
    def get_multiple_runs(self, cron_expression, count=5, base_time=None):
        if base_time is None:
            base_time = datetime.now()
        cron = croniter(cron_expression, base_time)
        return [cron.get_next(datetime) for _ in range(count)]