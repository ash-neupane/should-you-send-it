import { Location } from '../types/types';

export const fetchLocationCoordinates = async (query: string): Promise<Location> => {
    const response = await fetch(`http://localhost:8000/gps_coordinates/${encodeURIComponent(query)}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch location coordinates (${response.status})`);
    }
    const data = await response.json();
    return {
        lat: data.lat,
        lon: data.lon,
        displayName: data.display_name,
    };
};
