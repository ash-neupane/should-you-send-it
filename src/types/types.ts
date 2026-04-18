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

export interface RawDayData {
    date: string;
    am: WeatherPeriod | null;
    pm: WeatherPeriod | null;
    night: WeatherPeriod | null;
}

export interface RawWeatherData {
    days: RawDayData[];
}

export interface DayData extends RawDayData {
    summary: string;
}

export interface WeatherData {
    days: DayData[];
}
