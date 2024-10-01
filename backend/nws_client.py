import requests
import json
from redis_config import default_redis_client
import logging

class NWSClient:
    def __init__(self):
        self.base_url = "https://api.weather.gov"
        self.headers = {"User-Agent": "(ashish-testing, contact: neupane.ashish@outlook.com)"}
        self.logger = logging.getLogger("weather-backend").getChild("nws-client")
        self.expiry_sec = 1 * 24 * 60 * 60

    def get_weather_data(self, lat: float, lon: float):
        cache_key = f"weather:{lat:.4f}_{lon:.4f}"
        if default_redis_client:
            self.logger.info("Looking for cached data...")
            cached_data = default_redis_client.get_cache(cache_key)
            if cached_data:
                self.logger.info("Found cache, loading...")
                return json.loads(cached_data)
        
        self.logger.info("Making external API call...")
        result = self._fetch_nws_data(lat, lon)
        default_redis_client.set_cache(cache_key, json.dumps(result), expiry=self.expiry_sec)
        return result

    def _fetch_nws_data(self, lat: float, lon: float):
        try:
            points_url = f"{self.base_url}/points/{lat},{lon}"
            response = requests.get(points_url, headers=self.headers)
            response.raise_for_status()  # This will raise an HTTPError for bad responses
            data = response.json()
            forecast_url = data['properties']['forecast']
            forecast_response = requests.get(forecast_url, headers=self.headers)
            forecast_response.raise_for_status()            
            forecast_data = forecast_response.json()                        
            return forecast_data
        except requests.RequestException as e:
            self.logger.error(f"Error fetching NWS data: {str(e)}")
            return None

if __name__ == "__main__":
    logging.root.setLevel(logging.INFO)
    client = NWSClient()
    try:
        response = client.get_weather_data(40.7128, -74.0060)
        #print(json.dumps(response, indent=2))
    except Exception as e:
        print(f"An error occurred: {str(e)}")