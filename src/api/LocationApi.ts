import { Location } from '../types/types';

export const fetchLocationCoordinates = async (query: string): Promise<Location> => {
    console.group("Location Search");
    const response = await fetch(`http://localhost:8000/gps_coordinates/${encodeURIComponent(query)}`);
    if (!response.ok) {
        console.log("Failed to get GPS coordinates: ", response.status, response.statusText)
        throw new Error('Failed to fetch location coordinates');
    }
    const data = await response.json();
    console.log("Search query:", query);
    console.log("Result:", data);
    console.groupEnd();
    return {
        lat: data.latitude,
        lon: data.longitude,
        displayName: data.display_name
    };
};