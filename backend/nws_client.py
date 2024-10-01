import requests
import json
from fastapi import HTTPException
from constants import NWS_API_BASE_URL

class NWSClient:
    def __init__(self):
        self.base_url = NWS_API_BASE_URL
        self.headers = {"User-Agent": "(ashish-testing, contact: neupane.ashish@outlook.com)"}

    def get_weather_data(self, lat: float, lon: float, mock: bool = False):
        if mock:
            return self._get_mock_weather_data(lat, lon)
        return self._fetch_nws_data(lat, lon)

    def _get_mock_weather_data(self, lat: float, lon: float):
        ny_data_file = "ny_mock_data.json"
        ny_lat, ny_lon = 40.7128, -74.0060
        rainier_data_file = "rainier_mock_data.json"
        rainier_lat, rainier_lon = 46.8523, -121.7603

        if abs(lat - ny_lat) < 1e-3 and abs(lon - ny_lon) < 1e-3:
            data_file = ny_data_file
        elif abs(lat - rainier_lat) < 1e-3 and abs(lon - rainier_lon) < 1e-3:
            data_file = rainier_data_file
        else:
            return self._fetch_nws_data(lat, lon)

        with open(data_file, "r") as file:
            return json.load(file)

    def _fetch_nws_data(self, lat: float, lon: float):
        points_url = f"{self.base_url}/points/{lat},{lon}"
        
        response = requests.get(points_url, headers=self.headers)
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Failed to fetch NWS data")
        
        data = response.json()
        forecast_url = data['properties']['forecast']
        
        forecast_response = requests.get(forecast_url, headers=self.headers)
        if forecast_response.status_code != 200:
            raise HTTPException(status_code=forecast_response.status_code, detail="Failed to fetch forecast data")
        
        return forecast_response.json()
    
if __name__ == "__main__":
    client = NWSClient()
    response = client.get_weather_data(40.7128, -74.0060, mock=True)
    print(response)