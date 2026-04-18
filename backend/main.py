from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

import config
from nws_client import NWSClient
from osm_client import OSMClient
from weather_processor import WeatherProcessor

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)

nws_client = NWSClient()
osm_client = OSMClient()
weather_processor = WeatherProcessor()


@app.get("/temperature/{lat}/{lon}")
async def get_weather(lat: float, lon: float):
    raw_data = nws_client.get_weather_data(lat, lon)
    if raw_data is None:
        raise HTTPException(status_code=502, detail="Weather provider is unavailable")

    processed_data = weather_processor.process_nws_data(raw_data)
    if not processed_data:
        raise HTTPException(status_code=404, detail="Failed to fetch weather data")
    return processed_data


@app.get("/gps_coordinates/{name}")
async def get_coordinates(name: str):
    coordinates = osm_client.get_mountain_peak_coordinates(name)
    if not coordinates:
        raise HTTPException(status_code=404, detail=f"{name} not found")
    return coordinates


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
