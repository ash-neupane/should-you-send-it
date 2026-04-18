import json
import logging
from typing import Optional

import redis

import config

REDIS_START_HINT = (
    "Redis is unreachable at %s:%s. Start it with `redis-server --daemonize yes` "
    "or `brew services start redis`."
)


class RedisClient:
    def __init__(self, host: str = config.REDIS_HOST, port: int = config.REDIS_PORT, db: int = config.REDIS_DB):
        self.logger = logging.getLogger("weather-backend").getChild("redis-client")
        self.host = host
        self.port = port
        self.db = db
        self.redis_client = self._connect()

    def _connect(self) -> redis.Redis:
        client = redis.Redis(host=self.host, port=self.port, db=self.db, decode_responses=True)
        try:
            client.ping()
        except redis.ConnectionError as e:
            raise RuntimeError(REDIS_START_HINT % (self.host, self.port)) from e
        self.logger.info("Connected to Redis at %s:%s", self.host, self.port)
        return client

    def set_cache(self, key: str, value: str, expiry: Optional[int] = None) -> None:
        try:
            self.redis_client.set(key, value, ex=expiry)
        except redis.RedisError as e:
            self.logger.error("Error setting cache: %s", e)

    def get_cache(self, key: str) -> Optional[str]:
        try:
            return self.redis_client.get(key)
        except redis.RedisError as e:
            self.logger.error("Error getting cache: %s", e)
            return None

    def delete_cache(self, key: str) -> None:
        try:
            self.redis_client.delete(key)
        except redis.RedisError as e:
            self.logger.error("Error deleting cache: %s", e)


def view_redis_cache():
    r = redis.Redis(host=config.REDIS_HOST, port=config.REDIS_PORT, db=config.REDIS_DB, decode_responses=True)
    keys = r.keys('*')
    print(f"Total keys in Redis: {len(keys)}")
    for key in keys:
        r_type = r.type(key)
        if r_type == 'string':
            value = r.get(key)
            try:
                parsed = json.loads(value)
                print(f"Key: {key}\nType: {r_type}\nValue (JSON): {json.dumps(parsed, indent=2)}\n")
            except json.JSONDecodeError:
                print(f"Key: {key}\nType: {r_type}\nValue: {value}\n")
        else:
            print(f"Key: {key}\nType: {r_type}\n")


default_redis_client = RedisClient()


if __name__ == "__main__":
    logging.root.setLevel(logging.INFO)
    view_redis_cache()
