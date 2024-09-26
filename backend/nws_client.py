from constants import NWS_API_BASE_URL
import requests, json
from fastapi import HTTPException

def get_mock_weather_data(lat, lon):
    ny_data_file = "ny_mock_data.json"
    ny_lat = 40.7128
    ny_lon = -74.0060
    rainier_data_file = "rainier_mock_data.json"
    rainier_lat = 46.8523
    rainier_lon = -121.7603
    if abs(lat-ny_lat) < 1e-3 and abs(lon-ny_lon) < 1e-3:
        data_file = ny_data_file
    elif abs(lat-rainier_lat) < 1e-3 and abs(lon-rainier_lon) < 1e-3:
        data_file = rainier_data_file
    else:
        fetch_nws_data(lat, lon, mock=False)

    with open(data_file, "r") as file:
        data = json.load(file)
    return data


def fetch_nws_data(lat: float, lon: float, mock=False):
    if mock:
        return get_mock_weather_data(lat, lon)
    
    # Fetch the nearest grid point
    points_url = f"{NWS_API_BASE_URL}/points/{lat},{lon}"
    response = requests.get(points_url)
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail="Failed to fetch NWS data")
    
    data = response.json()
    forecast_url = data['properties']['forecast']
    
    # Fetch the forecast data
    forecast_response = requests.get(forecast_url)
    if forecast_response.status_code != 200:
        raise HTTPException(status_code=forecast_response.status_code, detail="Failed to fetch forecast data")
    
    return forecast_response.json()
