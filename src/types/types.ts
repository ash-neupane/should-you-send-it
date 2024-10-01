export interface Location {
    lat: number;
    lon: number;
    displayName: string;
}

export interface LocationSearchProps {
    onLocationChange: (location: Location) => void;
    defaultLocation?: Location;
}

export interface WeatherPeriod {
    condition: string;
    wind: { speed: number; direction: number };
    temp: number;
}

export interface RawWeatherData {
    summary1_3: string;
    summary4_6: string;
    days: Array<{
        date: string;
        am: { condition: string; wind: { speed: number; direction: number }; temp: number };
        pm: { condition: string; wind: { speed: number; direction: number }; temp: number };
        night: { condition: string; wind: { speed: number; direction: number }; temp: number };
    }>;
}

export interface DayData {
    date: string;
    summary: string;
    am: WeatherPeriod | null;
    pm: WeatherPeriod | null;
    night: WeatherPeriod | null;
}

export interface RawDayData {
    date: string;
    am: WeatherPeriod | null;
    pm: WeatherPeriod | null;
    night: WeatherPeriod | null;
}

export interface WeatherData {
    days: DayData[];
}