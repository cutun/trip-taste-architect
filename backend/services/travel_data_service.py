import os
import httpx
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timedelta, date
from geopy.geocoders import Nominatim
import asyncio
import math
import time

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

# --- Helper Functions ---

async def geocode_to_address(lat: float, lon: float) -> str:
    """
    Converts latitude and longitude coordinates to a formatted address string.

    This function takes geographic coordinates and uses the Nominatim geocoding
    service (based on OpenStreetMap data) to find the corresponding
    physical address. It then formats it into a clean, readable string.

    Args:
        lat: The latitude of the location.
        lon: The longitude of the location.

    Returns:
        A formatted address string in the format "Street, City, Post, Country".
        If a component is not available, it is omitted. Returns an error
        message if the address cannot be found.
    """
    # Initialize the geolocator with a unique user agent
    geolocator = Nominatim(user_agent="my_personal_address_converter")
    coordinates = f"{lat}, {lon}"

    try:
        # Perform the reverse geocoding lookup
        location = geolocator.reverse(coordinates, language='en')

        # Check if a location was found and has address data
        if location and 'address' in location.raw:
            address_parts = location.raw['address']

            # Safely extract address components using .get() to avoid errors
            # if a key does not exist.
            road = address_parts.get('road', '')
            house_number = address_parts.get('house_number', '')
            city = address_parts.get('city', address_parts.get('town', '')) # Fallback to 'town'
            postcode = address_parts.get('postcode', '')
            country = address_parts.get('country', '')

            # Combine house number and road to form a street address
            street_address = f"{house_number} {road}".strip()

            # Create a list of the parts that are not empty
            final_address_parts = [part for part in [street_address, city, postcode, country] if part]

            # Join the parts with a comma and space
            return ", ".join(final_address_parts)
        else:
            return "N/A"

    except Exception as e:
        # Handle potential network errors or other issues
        return f"An error occurred during geocoding: {e}"

# --- OpenWeather API Service Functions ---

async def get_weather_forecast(city_name: str) -> List[WeatherResult]:
    """
    Gets a 5-day weather forecast for a city directly by name.
    Note: The free OpenWeather plan often provides a 5-day forecast with 3-hour intervals.
    We will aggregate this to get a daily average.
    """
    print(f"\n🚀 [OpenWeather] Fetching 5-day forecast for '{city_name}'...")
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
    print("🚀 [Amadeus] Attempting to get access token...")
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
    print(f"🚀 [Amadeus] Fetching IATA city code for '{city_name}'...")
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
            print(f"❌ [Amadeus] ERROR getting city code: {e.response.status_code} - {e.response.text}")
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

    print(f"\n🚀 [Amadeus] Listing hotels for '{city_name}'")

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
    adults: int = 1,
    children: int = 1,
    rooms: int = 1
) -> List[HotelResult]:
    """Searches for hotels in a given city using the Amadeus API with concurrent geocoding."""
    
    print(f"\n🚀 [Amadeus] Starting hotel search for '{city_name}'")
    if (check_out_date - check_in_date).days <= 0:
        print("⚠️ [Amadeus] Invalid date range: Check-out date must be after check-in date.")
        return []

    if rooms <= 0:
        print("⚠️ [Amadeus] Invalid room number: Rooms must be a positive integer.")
        return []

    access_token = await get_amadeus_access_token()
    if not access_token: return []

    city_code = await get_city_code(city_name, access_token)
    if not city_code: return []

    hotelId_list = await list_hotels(city_name, access_token, city_code)
    if not hotelId_list: return []

    headers = {"Authorization": f"Bearer {access_token}"}
    url = f"{AMADEUS_API_BASE_URL}/v3/shopping/hotel-offers"
    api_results = []

    # Fetch all hotel offers first
    batch_size = 50
    async with httpx.AsyncClient(timeout=120.0) as client:
        for i in range(0, len(hotelId_list), batch_size):
            try:
                params = {
                    "hotelIds": hotelId_list[i:i+batch_size],
                    "adults": math.ceil((adults + children/2) / rooms), # adults per room
                    "checkInDate": check_in_date.strftime("%Y-%m-%d"),
                    "checkOutDate": check_out_date.strftime("%Y-%m-%d"),
                    "roomQuantity": rooms,
                    "includeClosed": "false",
                    "paymentPolicy": "NONE",
                    "bestRateOnly": "true",
                    "view": "FULL",
                    "sort": "PRICE",
                }
                response = await client.get(url, headers=headers, params=params)
                response.raise_for_status()
                api_results.extend(response.json().get("data", []))
            except httpx.HTTPStatusError as e:
                print(f"❌ [Amadeus] ERROR during hotel offers search: {e.response.status_code} - {e.response.text}")
                return []
            except Exception as e:
                # This is the new block that catches ALL other errors
                print(f"❌ [Amadeus] UNEXPECTED ERROR: {type(e).__name__} - {e}")
                return []
            time.sleep(1)
            
    print(f"🚀 [Amadeus] Processing {len(api_results)} hotel listings")

    # Prepare and run geocoding tasks concurrently
    geocoding_tasks = []
    valid_offers = []
    for offer in api_results:
        if offer.get('available') and 'hotel' in offer and 'offers' in offer:
            hotel_data = offer['hotel']
            lat = hotel_data.get('latitude')
            lon = hotel_data.get('longitude')
            # Create a task for each valid offer's geocoding lookup
            geocoding_tasks.append(geocode_to_address(lat, lon))
            valid_offers.append(offer)

    # Run all tasks at once
    print(f"🚀 [Geocoder] Starting {len(geocoding_tasks)} concurrent address lookups...")
    addresses = await asyncio.gather(*geocoding_tasks)
    print("✅ [Geocoder] All addresses retrieved.")

    # 4. Combine results
    standardized_results = []
    for i, offer in enumerate(valid_offers):
        hotel_data = offer['hotel']
        offer_data = offer['offers'][0]
        hotel = HotelResult(
            hotel_id=hotel_data.get('hotelId'),
            name=hotel_data.get('name'),
            latitude=hotel_data.get('latitude'),
            longitude=hotel_data.get('longitude'),
            address=addresses[i],  # Use the result from the gathered tasks
            total_price=float(offer_data.get('price', {}).get('total', 0)),
            currency=offer_data.get('price', {}).get('currency', 'EUR')
        )
        standardized_results.append(hotel)

    print(f"✅ [Amadeus] Standardized {len(standardized_results)} hotel results")
    return standardized_results
        

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
            print(f"❌ [Viator] ERROR getting destination ID: {e.response.status_code} - {e.response.text}")
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
            print(f"❌ [Viator] ERROR during activity search: {e.response.status_code} - {e.response.text}")
            return []
