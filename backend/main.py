# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from nws_client import fetch_nws_data
from processor import process_nws_data

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
async def get_weather(lat: float, lon: float, mock = True):
    raw_data = fetch_nws_data(lat, lon, mock=mock)
    processed_data = process_nws_data(raw_data)
    return processed_data

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)