import redis
import uuid

class DistributedLock:
    def __init__(self, redis_client, lock_key, timeout=300):
        self.redis = redis_client
        self.lock_key = lock_key
        self.timeout = timeout
        self.lock_value = str(uuid.uuid4())
    
    def acquire(self):
        return self.redis.set(self.lock_key, self.lock_value, nx=True, ex=self.timeout)
    
    def release(self):
        script = """
        if redis.call("get", KEYS[1]) == ARGV[1] then
            return redis.call("del", KEYS[1])
        else
            return 0
        end
        """
        self.redis.eval(script, 1, self.lock_key, self.lock_value)