# main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from nws_client import NWSClient
from osm_client import OSMClient
from weather_processor import WeatherProcessor
from gps_converter import get_gps_coordinates

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

@app.get("/temperature/{lat}/{lon}")
async def get_weather(lat: float, lon: float):
    nws_client = NWSClient()
    weather_processor = WeatherProcessor()
    raw_data = nws_client.get_weather_data(lat, lon)
    processed_data = weather_processor.process_nws_data(raw_data)
    if processed_data:
        return processed_data
    else:
        raise HTTPException(status_code=404, detail="Failed to fetch weather data")

@app.get("/gps_coordinates/{name}")
async def get_coordinates(name: str):
    osm_client = OSMClient()
    coordinates = osm_client.get_mountain_peak_coordinates(name)
    if coordinates:
        return coordinates
    else:
        raise HTTPException(status_code=404, detail=f"{name} not found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)