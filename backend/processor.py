from datetime import datetime, timedelta

def get_time_of_day(hour):
    """
    Determine time of day from raw datetime
    """
    if 5 <= hour < 12:
        time_of_day = "am"
    elif 12 <= hour < 18:
        time_of_day = "pm"
    else:
        time_of_day = "night"
    return time_of_day

def process_nws_data(raw_data):
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
        
        time_of_day = get_time_of_day(period_time.hour)
        
        # If data is missing, use the previous period's data
        if previous_period and (period_time - datetime.fromisoformat(previous_period['startTime'])) > timedelta(hours=1):
            fill_missing_periods(day_data, previous_period, period)
        
        day_data[time_of_day] = {
            "condition": "clear" if "clear" in period['shortForecast'].lower() else "cloudy",
            "wind": {
                "speed": int(period['windSpeed'].split()[0]),
                "direction": convert_wind_direction(period['windDirection'])
            },
            "temp": period['temperature']
        }
        
        previous_period = period
    
    if day_data:
        processed_data['days'].append(day_data)
    
    return processed_data

def fill_missing_periods(day_data, prev_period, current_period):
    prev_time = datetime.fromisoformat(prev_period['startTime'])
    current_time = datetime.fromisoformat(current_period['startTime'])
    
    while prev_time + timedelta(hours=1) < current_time:
        prev_time += timedelta(hours=1)
        hour = prev_time.hour
        
        if 5 <= hour < 12:
            time_of_day = "am"
        elif 12 <= hour < 18:
            time_of_day = "pm"
        else:
            time_of_day = "night"
        
        if day_data[time_of_day] is None:
            day_data[time_of_day] = {
                "condition": "clear" if "clear" in prev_period['shortForecast'].lower() else "cloudy",
                "wind": {
                    "speed": int(prev_period['windSpeed'].split()[0]),
                    "direction": convert_wind_direction(prev_period['windDirection'])
                },
                "temp": prev_period['temperature']
            }

def convert_wind_direction(direction):
    direction_map = {
        'N': 0, 'NNE': 22.5, 'NE': 45, 'ENE': 67.5,
        'E': 90, 'ESE': 112.5, 'SE': 135, 'SSE': 157.5,
        'S': 180, 'SSW': 202.5, 'SW': 225, 'WSW': 247.5,
        'W': 270, 'WNW': 292.5, 'NW': 315, 'NNW': 337.5
    }
    return direction_map.get(direction, 0)  # Default to 0 if direction is not found