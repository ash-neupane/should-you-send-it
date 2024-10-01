import requests
import json
from pathlib import Path

class OSMClient:
    def __init__(self, cache_file='osm_cache.json'):
        self.base_url = "https://nominatim.openstreetmap.org/search"
        self.cache_file = Path(cache_file)
        self.cache = self._load_cache()

    def _load_cache(self):
        if self.cache_file.exists():
            with open(self.cache_file, 'r') as f:
                return json.load(f)
        return {}

    def _save_cache(self):
        with open(self.cache_file, 'w') as f:
            json.dump(self.cache, f)

    def get_mountain_peak_coordinates(self, name, save_to_cache=False):
        if name in self.cache:
            data = self.cache[name]
        else:
            params = {
                "q": name,
                "format": "json",
                "limit": 1
            }

            response = requests.get(self.base_url, params=params, headers={"User-Agent": "(ashish-testing, contact: neupane.ashish@outlook.com)"})
            response.raise_for_status()


            data = response.json()
            if save_to_cache and data and len(data) > 0:
                self.cache[name] = data
                self._save_cache()
        
        if data and len(data) > 0:
            result = {
                "lat": float(data[0]["lat"]),
                "lon": float(data[0]["lon"]),
                "display_name": data[0]["display_name"]
            }
            return result
        
        return None

if __name__ == "__main__":
    # Initialize the client and cache some mountain peaks
    client = OSMClient()
    #client.get_mountain_peak_coordinates("Mt Rainier", save_to_cache=True)
    #client.get_mountain_peak_coordinates("Denali", save_to_cache=True)
    client.get_mountain_peak_coordinates("Sagarmatha", save_to_cache=True)