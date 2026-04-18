import json
import logging
import re

import requests

import config
from redis_config import default_redis_client


class OSMClient:
    def __init__(self):
        self.base_url = config.OSM_BASE_URL
        self.headers = {"User-Agent": config.USER_AGENT}
        self.logger = logging.getLogger("weather-backend").getChild("osm-client")

    def get_mountain_peak_coordinates(self, name):
        key_name = re.sub(r'[^a-z0-9]+', '_', name.lower())
        cache_key = f"mountain:{key_name}"

        cached_data = default_redis_client.get_cache(cache_key)
        if cached_data:
            self.logger.info("Cache hit for %s", cache_key)
            return json.loads(cached_data)

        self.logger.info("Cache miss for %s, calling OSM", cache_key)
        result = self._get_coordinates_from_osm_api(name)
        if result is not None:
            default_redis_client.set_cache(cache_key, json.dumps(result))
        return result

    def _get_coordinates_from_osm_api(self, name):
        try:
            response = requests.get(
                self.base_url,
                params={"q": name, "format": "json", "limit": 1},
                headers=self.headers,
            )
            response.raise_for_status()
            data = response.json()
        except requests.RequestException as e:
            self.logger.error("Error fetching GPS coordinates: %s", e)
            return None

        if not data:
            return None

        return {
            "lat": float(data[0]["lat"]),
            "lon": float(data[0]["lon"]),
            "display_name": data[0]["display_name"],
        }


if __name__ == "__main__":
    logging.root.setLevel(logging.INFO)
    client = OSMClient()
    print(client.get_mountain_peak_coordinates("Longs Peak"))
