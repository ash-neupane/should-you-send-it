import redis, json, logging
from typing import Optional

class RedisClient:
    def __init__(self, host: str = 'localhost', port: int = 6379, db: int = 0):
        self.redis_client = None
        self.host = host
        self.port = port
        self.db = db
        self.connect()
        self.logger = logging.getLogger("weather-backend").getChild("redis-client")

    def is_init(self):
        return self.redis_client is not None

    def connect(self):
        try:
            self.redis_client = redis.Redis(host=self.host, port=self.port, db=self.db, decode_responses=True)
            self.redis_client.ping()
            self.logger .info("Successfully connected to Redis")
        except redis.ConnectionError as e:
            self.logger .error(f"Could not connect to Redis: {str(e)}")
            self.logger .error("Please ensure Redis is installed and running.")
            self.logger .error("You can start Redis using 'redis-server' command or appropriate service manager.")
            self.redis_client = None

    def set_cache(self, key: str, value: str, expiry: Optional[int] = None) -> None:
        if self.redis_client:
            try:
                self.redis_client.set(key, value, ex=expiry)
            except redis.RedisError as e:
                self.logger .error(f"Error setting cache: {str(e)}")
        else:
            self.logger .warning("Redis client is not available. Cache operation skipped.")

    def get_cache(self, key: str) -> Optional[str]:
        if self.redis_client:
            try:
                return self.redis_client.get(key)
            except redis.RedisError as e:
                self.logger .error(f"Error getting cache: {str(e)}")
        else:
            self.logger .warning("Redis client is not available. Cache operation skipped.")
        return None

    def delete_cache(self, key: str) -> None:
        if self.redis_client:
            try:
                self.redis_client.delete(key)
            except redis.RedisError as e:
                self.logger .error(f"Error deleting cache: {str(e)}")
        else:
            self.logger .warning("Redis client is not available. Cache operation skipped.")

def view_redis_cache():
    r = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)
    print("Current Cache: ")
    keys = r.keys('*')    
    print(f"Total keys in Redis: {len(keys)}")    
    for key in keys:
        r_type = r.type(key)
        if r_type == 'string':
            value = r.get(key)
            try:
                parsed_value = json.loads(value)
                print(f"Key: {key}\nType: {r_type}\nValue (JSON): {json.dumps(parsed_value, indent=2)}\n")
            except json.JSONDecodeError:
                print(f"Key: {key}\nType: {r_type}\nValue: {value}\n")
        elif r_type == 'hash':
            value = r.hgetall(key)
            print(f"Key: {key}\nType: {r_type}\nValue: {value}\n")
        elif r_type == 'list':
            value = r.lrange(key, 0, -1)
            print(f"Key: {key}\nType: {r_type}\nValue: {value}\n")
        elif r_type == 'set':
            value = r.smembers(key)
            print(f"Key: {key}\nType: {r_type}\nValue: {value}\n")
        elif r_type == 'zset':
            value = r.zrange(key, 0, -1, withscores=True)
            print(f"Key: {key}\nType: {r_type}\nValue: {value}\n")
        else:
            print(f"Key: {key}\nType: {r_type}\nValue: Unable to retrieve\n")

default_redis_client = RedisClient()

if __name__ == "__main__":
    logging.root.setLevel(logging.INFO)
    redis_client = RedisClient()
    view_redis_cache()