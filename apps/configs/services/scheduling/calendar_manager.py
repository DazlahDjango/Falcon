from datetime import datetime, timedelta

class CalendarManager:
    def is_weekday(self, date=None):
        if date is None:
            date = datetime.now()
        return date.weekday() < 5
    def is_weekend(self, date=None):
        return not self.is_weekday(date)
    def next_weekday(self, date=None):
        if date is None:
            date = datetime.now()
        while not self.is_weekday(date):
            date += timedelta(days=1)
        return date
    def get_business_days_between(self, start_date, end_date):
        business_days = 0
        current = start_date
        while current <= end_date:
            if self.is_weekday(current):
                business_days += 1
            current += timedelta(days=1)
        return business_days
    def add_business_days(self, start_date, days):
        result = start_date
        added = 0
        while added < days:
            result += timedelta(days=1)
            if self.is_weekday(result):
                added += 1
        return result