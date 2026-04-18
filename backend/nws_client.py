import json
import logging

import requests

import config
from redis_config import default_redis_client


class NWSClient:
    def __init__(self):
        self.base_url = config.NWS_BASE_URL
        self.headers = {"User-Agent": config.USER_AGENT}
        self.logger = logging.getLogger("weather-backend").getChild("nws-client")

    def get_weather_data(self, lat: float, lon: float):
        cache_key = f"weather:{lat:.4f}_{lon:.4f}"

        cached_data = default_redis_client.get_cache(cache_key)
        if cached_data:
            self.logger.info("Cache hit for %s", cache_key)
            return json.loads(cached_data)

        self.logger.info("Cache miss for %s, calling NWS", cache_key)
        result = self._fetch_nws_data(lat, lon)
        if result is not None:
            default_redis_client.set_cache(cache_key, json.dumps(result), expiry=config.NWS_CACHE_EXPIRY_SEC)
        return result

    def _fetch_nws_data(self, lat: float, lon: float):
        try:
            points_response = requests.get(f"{self.base_url}/points/{lat},{lon}", headers=self.headers)
            points_response.raise_for_status()
            forecast_url = points_response.json()['properties']['forecast']

            forecast_response = requests.get(forecast_url, headers=self.headers)
            forecast_response.raise_for_status()
            return forecast_response.json()
        except requests.RequestException as e:
            self.logger.error("Error fetching NWS data: %s", e)
            return None


if __name__ == "__main__":
    logging.root.setLevel(logging.INFO)
    client = NWSClient()
    print(client.get_weather_data(40.7128, -74.0060))
