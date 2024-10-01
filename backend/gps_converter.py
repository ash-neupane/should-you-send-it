from osm_client import OSMClient

def get_gps_coordinates(name):
    client = OSMClient()
    result = client.get_mountain_peak_coordinates(name)
    
    if result:
        return {
            "latitude": result["lat"],
            "longitude": result["lon"],
            "display_name": result["display_name"]
        }
    else:
        return None