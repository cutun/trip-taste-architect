import json
import os
import google.generativeai as genai
from dotenv import load_dotenv
import asyncio
import re
from datetime import datetime, date
from typing import List, Dict, Any

# Import the new WeatherResult model
from .travel_data_service import HotelResult, ActivityResult, WeatherResult

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable not set.")
genai.configure(api_key=GEMINI_API_KEY)


async def allocate_budget(total_budget: float, trip_length: int, primary_interest: str) -> Dict[str, Any]:
    """Allocates the total budget across different categories using an LLM."""
    prompt = f"""
    You are a budget planning expert for vacations.
    Given a total budget of ${total_budget:.2f} for a {trip_length}-day trip with a primary interest in {primary_interest}, please allocate this budget across the following categories:
    - Accommodation
    - Food & Dining
    - Activities & Entertainment
    - Transportation (local)
    - Shopping & Souvenirs

    Provide the output as a JSON object with the following structure:
    {{
      "accommodation_budget": <amount>,
      "food_budget": <amount>,
      "activities_budget": <amount>,
      "transportation_budget": <amount>,
      "shopping_budget": <amount>
    }}

    Ensure the sum of all allocated amounts equals the total budget.
    The allocation should be reasonable for the trip details provided. For example, a trip with a primary interest in 'Fine Dining' should have a larger food budget.
    """

    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        print("Sending budget allocation prompt to Gemini...")
        response = await model.generate_content_async(prompt)

        generated_text = response.text
        json_match = re.search(r"```json\n(.*?)```", generated_text, re.DOTALL)
        if json_match:
            try:
                budget_json = json.loads(json_match.group(1))
                print("\n✅ Successfully extracted budget JSON from markdown block!")
                return budget_json
            except json.JSONDecodeError:
                print("❌ Failed to parse budget JSON even from markdown block.")
                return None
        else:
            print("❌ Gemini's budget response was not valid JSON.")
            return None
    except Exception as e:
        print(f"An error occurred during Gemini budget call: {e}")
        return None

def _normalize_poi_or_activity(item):
    """Normalizes a Qloo POI or a Viator-like activity into a consistent format for the LLM."""
    if hasattr(item, 'model_dump'):
        item_dict = item.model_dump()
    else:
        item_dict = item

    name = item_dict.get('name', 'Unknown')
    entity_id = item_dict.get('entity_id', item_dict.get('id', None))
    item_type = item_dict.get('type', 'place').replace("urn:entity:", "")
    if 'subtype' in item_dict:
        item_type = item_dict['subtype'].replace("urn:entity:", "")

    properties = item_dict.get('properties', {})
    
    description = properties.get('description', item_dict.get('description', 'No description available.'))
    address = properties.get('address', item_dict.get('address', 'Unknown address.'))
    website = properties.get('website', item_dict.get('website', 'N/A'))
    rating_val = properties.get('business_rating', item_dict.get('rating', 'N/A'))
    
    keywords_raw = properties.get('keywords', [])
    keywords = [k['name'] for k in keywords_raw] if isinstance(keywords_raw, list) else []

    hours_info = "Varies by event or seasonal. Check their website."
    if properties.get('hours'):
        hours_entries = properties['hours']
        if any(day_hours and day_hours[0].get('closed') for day_hours in hours_entries.values()):
            hours_info = "Hours vary significantly or may be closed on certain days. Check their website."
        else:
            first_day_key = next(iter(hours_entries.keys()), None)
            if first_day_key:
                first_day_hours_list = hours_entries[first_day_key]
                if first_day_hours_list and first_day_hours_list[0].get("opens") and first_day_hours_list[0].get("closes"):
                    open_time = first_day_hours_list[0]["opens"].replace("T", "")
                    close_time = first_day_hours_list[0]["closes"].replace("T", "")
                    hours_info = f"Typically {open_time} - {close_time} (daily hours may vary)"
                elif first_day_hours_list and first_day_hours_list[0].get('closed'):
                    hours_info = "Typically closed or by appointment"
    elif item_dict.get('hours_of_operation'):
        hours_info = item_dict['hours_of_operation']
    
    price_range_info = properties.get('price_range')
    price_level_value = properties.get('price_level')
    
    price_text = "unknown"
    if price_range_info:
        price_text = f"{price_range_info.get('from', '')}-{price_range_info.get('to', '')} {price_range_info.get('currency', 'USD').upper()} (Estimated)"
    elif price_level_value is not None:
        price_map = {1: "low", 2: "medium", 3: "high"}
        price_text = price_map.get(price_level_value, "unknown")
    elif item_dict.get('total_price') is not None:
        price_text = f"{item_dict['total_price']:.2f} {item_dict.get('currency', 'USD').upper()} (Estimated)"

    location_coords = item_dict.get('location', {})
    lat_lon_info = f"Lat: {location_coords.get('lat')}, Lon: {location_coords.get('lon')}" if location_coords else "No precise location."

    return {
        "name": name,
        "id": entity_id,
        "type": item_type,
        "description": description,
        "address": address,
        "website": website,
        "rating": rating_val,
        "keywords": keywords,
        "hours_of_operation": hours_info,
        "estimated_price_level_or_range": price_text,
        "location_coords": lat_lon_info
    }


def _prepare_data_for_prompt(
        user_req_data, 
        hotel_options_list, 
        qloo_recs_raw, 
        activities_raw, 
        weather_forecast: List[WeatherResult], 
    ):
    """Prepares and formats the input data for the Gemini prompt."""
    destination_city = user_req_data.get('destination_city', 'Unknown City')
    destination_country = user_req_data.get('destination_country', 'Unknown Country')
    trip_length = user_req_data.get('trip_length', 1)
    budget = user_req_data.get('budget', 0.0)
    primary_interest = user_req_data.get('likes', ['general interest'])[0] if user_req_data.get('likes') else "general interest"
    dislikes_list = user_req_data.get('dislikes', [])
    dislikes_string = ', '.join(dislikes_list) if dislikes_list else "None specified"
    dislikes_string_for_llm = f"and strictly avoid anything related to {dislikes_string}" if dislikes_list else "No specific dislikes mentioned."

    check_in_date_obj = user_req_data.get('check_in_date')
    check_out_date_obj = user_req_data.get('check_out_date')

    check_in_date_str = check_in_date_obj.strftime('%Y-%m-%d') if isinstance(check_in_date_obj, date) else "Unknown Date"
    check_out_date_str = check_out_date_obj.strftime('%Y-%m-%d') if isinstance(check_out_date_obj, date) else "Unknown Date"

    serializable_hotel_list = [h.model_dump() for h in hotel_options_list]
    all_hotel_options_string = json.dumps(serializable_hotel_list, indent=2)

    combined_activities = []
    qloo_entities = qloo_recs_raw.get('results', {}).get('entities', [])
    for poi in qloo_entities:
        combined_activities.append(_normalize_poi_or_activity(poi))
    for activity in activities_raw:
        combined_activities.append(_normalize_poi_or_activity(activity))
    all_activities_for_llm_string = json.dumps(combined_activities, indent=2)

    # Format the weather forecast for the prompt
    weather_forecast_string = "No forecast available."
    if weather_forecast:
        weather_lines = [f"- {wf.date.strftime('%Y-%m-%d')}: {wf.main} ({wf.description}), {wf.temp_celsius:.0f}°C" for wf in weather_forecast]
        weather_forecast_string = "\n".join(weather_lines)

    # budget_allocation_string = json.dumps(budget_allocation, indent=2)

    return {
        "destination_city": destination_city,
        "destination_country": destination_country,
        "trip_length": trip_length,
        "budget": budget,
        "primary_interest": primary_interest,
        "dislikes_string": dislikes_string,
        "dislikes_string_for_llm": dislikes_string_for_llm,
        "check_in_date": check_in_date_str,
        "check_out_date": check_out_date_str,
        "all_hotel_options_string": all_hotel_options_string,
        "all_activities_for_llm_string": all_activities_for_llm_string,
        "weather_forecast_string": weather_forecast_string, # Add weather data
        # "budget_allocation_string": budget_allocation_string,
    }

async def generate_itinerary(
        input_request: dict, 
        qloo_recommendations: dict, 
        hotel_options: list, 
        activity_options: list, 
        weather_forecast: list,
        # budget_allocation: str
    ):
    """Main function to generate a travel itinerary using Gemini."""
    prepared_data = _prepare_data_for_prompt(
        input_request,
        hotel_options,
        qloo_recommendations,
        activity_options,
        weather_forecast, # Pass weather data
        # budget_allocation, # Pass budget allocation
    )

    try:
        script_dir = os.path.dirname(__file__)
        prompt_path = os.path.join(script_dir, '..', 'prompt.txt')
        if not os.path.exists(prompt_path):
            prompt_path = os.path.join(script_dir, 'prompt.txt')
        with open(prompt_path, 'r', encoding='utf-8') as f:
            prompt_template = f.read()
    except FileNotFoundError:
        raise FileNotFoundError(f"prompt.txt not found.")
    
    prompt_content = prompt_template.format(**prepared_data)

    try:
        model = genai.GenerativeModel('gemini-2.5-flash') # Using 1.5 Flash 
        print("Sending weather-aware itinerary prompt to Gemini...")
        response = await model.generate_content_async(prompt_content)
        
        generated_text = response.text
        json_match = re.search(r"```json\n(.*?)```", generated_text, re.DOTALL)
        if json_match:
            try:
                itinerary_json = json.loads(json_match.group(1))
                print("\n✅ Successfully extracted JSON from markdown block!")
                return itinerary_json
            except json.JSONDecodeError:
                print("❌ Failed to parse JSON even from markdown block.")
                return None
        else:
            print("❌ Gemini's response was not valid JSON.")
            return None
    except Exception as e:
        print(f"An error occurred during Gemini call: {e}")
        return None