import requests
import json, re, logging
from redis_config import default_redis_client


class OSMClient:
    def __init__(self):
        self.base_url = "https://nominatim.openstreetmap.org/search"
        self.logger = logging.getLogger("weather-backend").getChild("osm-client")

    def get_mountain_peak_coordinates(self, name):
        print(self.logger.root.level)
        key_name = re.sub(r'[^a-z0-9]+', '_', name.lower())
        cache_key = f"mountain:{key_name}"
        if default_redis_client:
            self.logger.info("Looking for cache...")
            cached_data = default_redis_client.get_cache(cache_key)            
            if cached_data:
                self.logger.info("Found cache, loading...")
                return json.loads(cached_data)
        
        self.logger.info("Making external API call...")
        result = self._get_coordinates_from_osm_api(name)
        default_redis_client.set_cache(cache_key, json.dumps(result))
        return result
    
    def _get_coordinates_from_osm_api(self, name):
        try:
            params = {
                "q": name,
                "format": "json",
                "limit": 1
            }
            response = requests.get(self.base_url, params=params, headers={"User-Agent": "(ashish-testing, contact: neupane.ashish@outlook.com)"})
            response.raise_for_status()
            data = response.json()            
            if data and len(data) > 0:
                result = {
                    "lat": float(data[0]["lat"]),
                    "lon": float(data[0]["lon"]),
                    "display_name": data[0]["display_name"]
                }
                return result
        except requests.RequestException as e:
            self.logger.error(f"Error fetching GPS coordinates: {str(e)}")
            return None

if __name__ == "__main__":
    logging.root.setLevel(logging.INFO)
    client = OSMClient()
    coords = client.get_mountain_peak_coordinates("Longs Peak")
    print(coords)