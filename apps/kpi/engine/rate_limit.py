import time
import logging
class RateLimitedBulkOperation:
    def __init__(self, rate_per_second=100):
        self.rate_per_second = rate_per_second
        self.last_call = time.time()
    
    def throttle(self):
        elapsed = time.time() - self.last_call
        sleep_time = (1.0 / self.rate_per_second) - elapsed
        if sleep_time > 0:
            time.sleep(sleep_time)
        self.last_call = time.time()