from datetime import datetime, timedelta

class WeatherProcessor:
    @staticmethod
    def get_time_of_day(hour):
        if 5 <= hour < 12:
            return "am"
        elif 12 <= hour < 18:
            return "pm"
        else:
            return "night"

    @staticmethod
    def convert_wind_direction(direction):
        direction_map = {
            'N': 0, 'NNE': 22.5, 'NE': 45, 'ENE': 67.5,
            'E': 90, 'ESE': 112.5, 'SE': 135, 'SSE': 157.5,
            'S': 180, 'SSW': 202.5, 'SW': 225, 'WSW': 247.5,
            'W': 270, 'WNW': 292.5, 'NW': 315, 'NNW': 337.5
        }
        return direction_map.get(direction, 0)

    def process_nws_data(self, raw_data):
        processed_data = {
            "name": "TO ADD: Mt Name",
            "summary1_3": "Weather summary for days 1-3",
            "summary4_6": "Weather summary for days 4-6",
            "days": []
        }
        periods = raw_data['properties']['periods']
        current_date = None
        day_data = {}
        previous_period = None

        for period in periods:
            period_date = datetime.fromisoformat(period['startTime']).date()
            period_time = datetime.fromisoformat(period['startTime'])
            
            if current_date != period_date:
                if day_data:
                    processed_data['days'].append(day_data)
                current_date = period_date
                day_data = {
                    "date": period_date.strftime("%A %d"),
                    "am": None, "pm": None, "night": None
                }
            
            time_of_day = self.get_time_of_day(period_time.hour)
            
            if previous_period and (period_time - datetime.fromisoformat(previous_period['startTime'])) > timedelta(hours=1):
                self._fill_missing_periods(day_data, previous_period, period)
            
            day_data[time_of_day] = {
                "condition": "clear" if "clear" in period['shortForecast'].lower() else "cloudy",
                "wind": {
                    "speed": int(period['windSpeed'].split()[0]),
                    "direction": self.convert_wind_direction(period['windDirection'])
                },
                "temp": period['temperature']
            }
            
            previous_period = period
        
        if day_data:
            processed_data['days'].append(day_data)
        
        return processed_data

    def _fill_missing_periods(self, day_data, prev_period, current_period):
        prev_time = datetime.fromisoformat(prev_period['startTime'])
        current_time = datetime.fromisoformat(current_period['startTime'])
        
        while prev_time + timedelta(hours=1) < current_time:
            prev_time += timedelta(hours=1)
            time_of_day = self.get_time_of_day(prev_time.hour)
            
            if day_data[time_of_day] is None:
                day_data[time_of_day] = {
                    "condition": "clear" if "clear" in prev_period['shortForecast'].lower() else "cloudy",
                    "wind": {
                        "speed": int(prev_period['windSpeed'].split()[0]),
                        "direction": self.convert_wind_direction(prev_period['windDirection'])
                    },
                    "temp": prev_period['temperature']
                }

if __name__ == "__main__":
    processor = WeatherProcessor()
    from nws_client import NWSClient
    client = NWSClient()
    data = client.get_weather_data(46.8523, -121.7603, mock=True)
    forecast = processor.process_nws_data(data)
    print(forecast)