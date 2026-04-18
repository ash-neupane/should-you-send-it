from datetime import datetime, timedelta

WIND_DIRECTION_MAP = {
    'N': 0, 'NNE': 22.5, 'NE': 45, 'ENE': 67.5,
    'E': 90, 'ESE': 112.5, 'SE': 135, 'SSE': 157.5,
    'S': 180, 'SSW': 202.5, 'SW': 225, 'WSW': 247.5,
    'W': 270, 'WNW': 292.5, 'NW': 315, 'NNW': 337.5,
}


def get_time_of_day(hour: int) -> str:
    if 5 <= hour < 12:
        return "am"
    if 12 <= hour < 18:
        return "pm"
    return "night"


def convert_wind_direction(direction: str) -> float:
    return WIND_DIRECTION_MAP.get(direction, 0)


def _period_payload(period: dict) -> dict:
    return {
        "condition": "clear" if "clear" in period['shortForecast'].lower() else "cloudy",
        "wind": {
            "speed": int(period['windSpeed'].split()[0]),
            "direction": convert_wind_direction(period['windDirection']),
        },
        "temp": period['temperature'],
    }


class WeatherProcessor:
    @staticmethod
    def get_time_of_day(hour: int) -> str:
        return get_time_of_day(hour)

    @staticmethod
    def convert_wind_direction(direction: str) -> float:
        return convert_wind_direction(direction)

    def process_nws_data(self, raw_data):
        processed_data = {"days": []}
        current_date = None
        day_data = None
        previous_period = None

        for period in raw_data['properties']['periods']:
            period_time = datetime.fromisoformat(period['startTime'])
            period_date = period_time.date()

            if current_date != period_date:
                if day_data:
                    processed_data['days'].append(day_data)
                current_date = period_date
                day_data = {
                    "date": period_date.strftime("%A %d"),
                    "am": None, "pm": None, "night": None,
                }

            if previous_period is not None:
                prev_time = datetime.fromisoformat(previous_period['startTime'])
                if period_time - prev_time > timedelta(hours=1):
                    self._fill_missing_periods(day_data, previous_period, period_time)

            day_data[get_time_of_day(period_time.hour)] = _period_payload(period)
            previous_period = period

        if day_data:
            processed_data['days'].append(day_data)

        return processed_data

    @staticmethod
    def _fill_missing_periods(day_data, prev_period, current_time):
        prev_time = datetime.fromisoformat(prev_period['startTime'])
        payload = _period_payload(prev_period)
        while prev_time + timedelta(hours=1) < current_time:
            prev_time += timedelta(hours=1)
            slot = get_time_of_day(prev_time.hour)
            if day_data[slot] is None:
                day_data[slot] = payload


if __name__ == "__main__":
    from nws_client import NWSClient
    processor = WeatherProcessor()
    client = NWSClient()
    data = client.get_weather_data(46.8523, -121.7603)
    print(processor.process_nws_data(data))
