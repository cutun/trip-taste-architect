import os
import httpx
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timedelta, date
import json

# Load environment variables from .env file
load_dotenv()

# --- API Credentials ---
AMADEUS_CLIENT_ID = os.getenv("AMADEUS_CLIENT_ID")
AMADEUS_CLIENT_SECRET = os.getenv("AMADEUS_CLIENT_SECRET")
AMADEUS_API_BASE_URL = "https://test.api.amadeus.com"

VIATOR_API_KEY = os.getenv("VIATOR_API_KEY")
VIATOR_API_BASE_URL = "https://api.viator.com/partner"

OPENWEATHER_KEY = os.getenv("OPENWEATHER_KEY")
OPENWEATHER_API_BASE_URL = "https://api.openweathermap.org"

# --- Pydantic Models for Standardized Data ---

class HotelResult(BaseModel):
    provider: str = "Amadeus"
    hotel_id: str
    name: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    total_price: float
    currency: str
    booking_link: Optional[str] = None

class ActivityResult(BaseModel):
    provider: str = "Viator"
    activity_id: str
    name: str
    description: Optional[str] = None
    price: float
    currency: str
    rating: Optional[float] = None
    image_url: Optional[str] = None
    booking_link: Optional[str] = None

class WeatherResult(BaseModel):
    """A standardized model for daily weather forecast data."""
    date: date
    temp_celsius: float
    main: str # e.g., "Rain", "Clouds", "Clear"
    description: str
    icon_code: str

# --- OpenWeather API Service Functions ---

async def get_weather_forecast(city_name: str) -> List[WeatherResult]:
    """
    Gets a 5-day weather forecast for a city directly by name.
    Note: The free OpenWeather plan often provides a 5-day forecast with 3-hour intervals.
    We will aggregate this to get a daily average.
    """
    print(f"\n--- [OpenWeather] Fetching 5-day forecast for '{city_name}'... ---")
    params = {
        "q": city_name,
        "appid": OPENWEATHER_KEY,
        "units": "metric"
    }
    # Using the /data/2.5/forecast endpoint which is commonly available on free plans
    url = f"{OPENWEATHER_API_BASE_URL}/data/2.5/forecast"
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, params=params)
            response.raise_for_status()
            forecast_data = response.json().get("list", [])
            
            # Aggregate 3-hour data into daily forecasts
            daily_forecasts = {}
            for item in forecast_data:
                item_date = date.fromtimestamp(item['dt'])
                if item_date not in daily_forecasts:
                    daily_forecasts[item_date] = {
                        "temps": [],
                        "weather": item['weather'][0] # Take first weather entry as representative
                    }
                daily_forecasts[item_date]["temps"].append(item['main']['temp'])

            standardized_results = []
            for d, data in daily_forecasts.items():
                avg_temp = sum(data['temps']) / len(data['temps'])
                weather = WeatherResult(
                    date=d,
                    temp_celsius=avg_temp,
                    main=data['weather']['main'],
                    description=data['weather']['description'],
                    icon_code=data['weather']['icon']
                )
                standardized_results.append(weather)
            
            print(f"✅ [OpenWeather] Successfully processed {len(standardized_results)}-day forecast.")
            return standardized_results

        except httpx.HTTPStatusError as e:
            print(f"❌ ERROR [OpenWeather] forecast: {e.response.status_code} - {e.response.text}")
            return []
        except Exception as e:
            print(f"❌ UNEXPECTED ERROR [OpenWeather] processing forecast: {e}")
            return []


# --- Amadeus API Service Functions ---

async def get_amadeus_access_token() -> Optional[str]:
    """Authenticates with Amadeus to get an API access token."""
    print("--- [Amadeus] Attempting to get access token... ---")
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    data = {
        "grant_type": "client_credentials",
        "client_id": AMADEUS_CLIENT_ID,
        "client_secret": AMADEUS_CLIENT_SECRET,
    }
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(f"{AMADEUS_API_BASE_URL}/v1/security/oauth2/token", headers=headers, data=data)
            response.raise_for_status()
            access_token = response.json().get("access_token")
            print("✅ [Amadeus] Successfully retrieved access token.")
            return access_token
        except httpx.HTTPStatusError as e:
            print(f"❌ ERROR [Amadeus] getting token: {e.response.status_code} - {e.response.text}")
            return None

async def get_city_code(city_name: str, access_token: str) -> Optional[str]:
    """Gets the IATA city code required for hotel searches."""
    print(f"--- [Amadeus] Fetching IATA city code for '{city_name}'... ---")
    headers = {"Authorization": f"Bearer {access_token}"}
    params = {"keyword": city_name, "subType": "CITY"}
    url = f"{AMADEUS_API_BASE_URL}/v1/reference-data/locations"
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, headers=headers, params=params)
            response.raise_for_status()
            data = response.json().get("data", [])
            data = [thing for thing in data if thing.get("iataCode")]
            if data:
                city_code = data[0].get("iataCode")
                print(f"✅ [Amadeus] Found IATA code for '{city_name}': {city_code}")
                return city_code
            else:
                print(f"⚠️ [Amadeus] No IATA code found for '{city_name}'.")
                return None
        except httpx.HTTPStatusError as e:
            print(f"❌ ERROR [Amadeus] getting city code: {e.response.status_code} - {e.response.text}")
            return None

async def list_hotels(
        city_name: str,
        access_token: str,
        city_code: str
) -> List[str]:
    """Lists hotels in a given city using the Amadeus API and returns a list of hotels ID."""
    if not access_token or not city_code:
        return []

    headers = {"Authorization": f"Bearer {access_token}"}
    params = {"cityCode": city_code, "radius": 20, "radiusUnit": "KM"}
    url = f"{AMADEUS_API_BASE_URL}/v1/reference-data/locations/hotels/by-city"

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.get(url, headers=headers, params=params)
            response.raise_for_status()
            api_results = response.json().get("data", [])
            listings = [listing.get("hotelId") for listing in api_results if listing.get("hotelId")]
            print(f"✅ [Amadeus] Listed {len(listings)} hotel results")
            return listings
        except httpx.HTTPStatusError as e:
            print(f"❌ ERROR [Amadeus] during hotel listing: {e.response.status_code} - {e.response.text}")
            return []

async def google_hotels(
    city_name: str,
    check_in_date: date = None,
    check_out_date: date = None,
) -> List[HotelResult]:
    """Searches for hotels in a given city using the Amadeus API."""
    print(f"\n--- [Amadeus] Starting hotel search for '{city_name}' ---")
    access_token = await get_amadeus_access_token()
    if not access_token: return []

    city_code = await get_city_code(city_name, access_token)
    if not city_code: return []

    hotelId_list = (await list_hotels(city_name, access_token, city_code))
    if not hotelId_list: return []

    headers = {"Authorization": f"Bearer {access_token}"}
    url = f"{AMADEUS_API_BASE_URL}/v3/shopping/hotel-offers"

    standardized_results = []

    for i in range(0, len(hotelId_list), 50):
        params = {
            "hotelIds": hotelId_list[i:i+50],
            "adults": 1,
            "checkInDate": check_in_date.strftime("%Y-%m-%d"),
            "checkOutDate": check_out_date.strftime("%Y-%m-%d"),
            "paymentPolicy": "NONE",
            "bestRateOnly": "true",
            "view": "FULL",
            "sort": "PRICE",
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                response = await client.get(url, headers=headers, params=params)
                response.raise_for_status()
                api_results = response.json().get("data", [])
                

                for offer in api_results:
                    if offer.get('available') and 'hotel' in offer and 'offers' in offer:
                        hotel_data = offer['hotel']
                        offer_data = offer['offers'][0]
                        address_parts = [
                            hotel_data.get('address', {}).get('lines', [''])[0],
                            hotel_data.get('address', {}).get('cityName'),
                            hotel_data.get('address', {}).get('postalCode')
                        ]
                        full_address = ', '.join(filter(None, address_parts))
                        hotel = HotelResult(
                            hotel_id=hotel_data.get('hotelId'),
                            name=hotel_data.get('name'),
                            latitude=hotel_data.get('latitude'),
                            longitude=hotel_data.get('longitude'),
                            address=full_address,
                            total_price=float(offer_data.get('price', {}).get('total', 0)),
                            currency=offer_data.get('price', {}).get('currency', 'EUR')
                        )
                        standardized_results.append(hotel)
                print(f"✅ [Amadeus] Standardized {len(standardized_results)} hotel results")
                return standardized_results
            except httpx.HTTPStatusError as e:
                print(f"❌ ERROR [Amadeus] during hotel offers search: {e.response.status_code} - {e.response.text}")
                return []


# --- Viator API Service Functions ---

async def get_viator_destination_id(city_name: str) -> Optional[str]:
    """Gets Viator's internal destination ID for a given city name."""
    if not VIATOR_API_KEY: return None
    headers = {"exp-api-key": VIATOR_API_KEY, "Accept-Language": "en-US", "Accept": "application/json;version=2.0"}
    url = f"{VIATOR_API_BASE_URL}/destinations"
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            destinations = response.json().get("destinations", [])
            for dest in destinations:
                if dest.get("type") == "CITY" and city_name.lower() in dest.get("name", "").lower():
                    return dest["destinationId"]
            return None
        except httpx.HTTPStatusError as e:
            print(f"❌ ERROR [Viator] getting destination ID: {e.response.status_code} - {e.response.text}")
            return None

async def search_activities(city_name: str) -> List[ActivityResult]:
    """Searches for activities in a city using the Viator API."""
    destination_id = await get_viator_destination_id(city_name)
    if not destination_id: return []

    headers = {"exp-api-key": VIATOR_API_KEY, "Accept-Language": "en-US", "Accept": "application/json"}
    payload = {
        "filtering": {"destination": destination_id},
        "sorting": {"sort": "TRAVELER_RATING", "order": "DESCENDING"},
        "pagination": {"start": 1, "count": 20}
    }
    url = f"{VIATOR_API_BASE_URL}/products/search"
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(url, headers=headers, json=payload)
            response.raise_for_status()
            products = response.json().get('products', [])
            
            standardized_results = []
            for prod in products:
                price_info = prod.get('pricing', {}).get('summary', {}).get('fromPrice')
                activity = ActivityResult(
                    activity_id=prod.get('productCode'),
                    name=prod.get('title'),
                    description=prod.get('description'),
                    price=price_info if price_info is not None else 0.0,
                    currency=prod.get('pricing', {}).get('currency', 'USD'),
                    rating=prod.get('reviews', {}).get('combinedAverageRating'),
                    image_url=prod.get('images', [{}])[0].get('url'),
                    booking_link=prod.get('webURL')
                )
                standardized_results.append(activity)
            return standardized_results
        except httpx.HTTPStatusError as e:
            print(f"❌ ERROR [Viator] during activity search: {e.response.status_code} - {e.response.text}")
            return []
