import asyncio
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field, model_validator
from typing import List, Optional, Dict, Any
from datetime import date, timedelta
import json

# Import all the service modules
from services import qloo_service, travel_data_service, llm_orchestrator

# Initialize the FastAPI app
app = FastAPI(
    title="TasteTrail API",
    description="Backend for the TasteTrail travel planning application.",
    version="1.1.0" # Version updated for new feature
)

# --- Pydantic Models for Request and Response ---

class ItineraryRequest(BaseModel):
    """Defines the shape of the request to generate an itinerary."""
    budget: float = Field(..., example=3000.0, description="Total trip budget.")
    trip_length: int = Field(7, example=7, ge=1, le=14, description="Duration of the trip in days. This is auto-calculated from dates.")
    destination_city: str = Field(..., example="Tokyo", description="The target city.")
    destination_country: str = Field(..., example="Japan", description="The target country.")
    likes: List[str] = Field(..., min_length=1, example=["Anime", "Street Food", "J-Pop"], description="List of user's likes.")
    dislikes: Optional[List[str]] = Field(None, example=["Museums"], description="Optional list of user's dislikes.")
    
    check_in_date: date = Field(default_factory=lambda: date.today() + timedelta(days=30))
    check_out_date: date = Field(default_factory=lambda: date.today() + timedelta(days=37))

    @model_validator(mode='after')
    def validate_dates(self) -> 'ItineraryRequest':
        if self.check_in_date and self.check_out_date:
            if self.check_in_date >= self.check_out_date:
                raise ValueError("check_out_date must be after check_in_date")
            self.trip_length = (self.check_out_date - self.check_in_date).days
        return self


# --- API Endpoints ---

@app.get("/")
def read_root():
    """A simple root endpoint to confirm the API is running."""
    return {"message": "Welcome to the TasteTrail API v1.1 (Weather-Aware)"}


@app.post("/api/v1/itinerary", response_model=Dict[str, Any])
async def create_itinerary(request: ItineraryRequest):
    """
    The main endpoint to generate a full travel itinerary, now with weather awareness.
    """
    print("--- Received New Itinerary Request ---")
    print(request.model_dump_json(indent=2))
    print("------------------------------------")

    # Step 1: Fetch all external data in parallel
    print("\n--- Step 1: Fetching Data from External APIs (Qloo, Amadeus, Viator, OpenWeather) ---")
    
    async def get_qloo_data():
        like_entities_tasks = [qloo_service.search_entities(like) for like in request.likes]
        like_entities_results = await asyncio.gather(*like_entities_tasks)
        valid_like_entities = [entity for sublist in like_entities_results for entity in sublist]
        if not valid_like_entities:
            raise HTTPException(status_code=404, detail="Could not find any matching cultural entities for the provided 'likes'.")
        print(f"Found {len(valid_like_entities)} Qloo entities for likes.")
        return await qloo_service.get_recommendations(
            user_likes=valid_like_entities,
            filter_type="urn:entity:place",
            destination_city=request.destination_city
        )

    # Define all API call tasks, including the new weather forecast
    qloo_task = get_qloo_data()
    hotel_task = travel_data_service.google_hotels(
        city_name=request.destination_city,
        check_in_date=request.check_in_date,
        check_out_date=request.check_out_date,
    )
    activity_task = travel_data_service.search_activities(request.destination_city)
    weather_task = travel_data_service.get_weather_forecast(request.destination_city)

    results = await asyncio.gather(qloo_task, hotel_task, activity_task, weather_task, return_exceptions=True)
    
    qloo_pois, hotel_options, activity_options, weather_forecast = results
    
    # Handle potential errors from API calls
    if isinstance(qloo_pois, Exception): raise HTTPException(status_code=500, detail=f"Qloo API Error: {qloo_pois}")
    if isinstance(hotel_options, Exception): raise HTTPException(status_code=500, detail=f"Amadeus API Error: {hotel_options}")
    if isinstance(weather_forecast, Exception): raise HTTPException(status_code=500, detail=f"OpenWeather API Error: {weather_forecast}")
    
    if isinstance(activity_options, Exception):
        print(f"⚠️ Warning: Could not get activity data from Viator: {activity_options}")
        activity_options = []
    
    if not hotel_options: raise HTTPException(status_code=404, detail="Could not find any available hotels.")
    if not weather_forecast: print("⚠️ Warning: Could not retrieve weather forecast. Proceeding without it.")

    print("\n--- Step 2: Orchestrating LLM Itinerary Generation (Weather-Aware) ---")
    
    request_data_dict = request.model_dump(mode='json')

    final_itinerary = await llm_orchestrator.generate_itinerary(
        input_request=request_data_dict,
        qloo_recommendations=qloo_pois,
        hotel_options=hotel_options,
        activity_options=activity_options,
        weather_forecast=weather_forecast, # Pass the new weather data
        # budget_allocation=budget_allocation,
    )

    if not final_itinerary or "error" in final_itinerary or "days" not in final_itinerary:
        raise HTTPException(status_code=500, detail="Failed to generate itinerary from the LLM.")

    print("\n--- Step 3: Successfully Generated Weather-Aware Itinerary ---")
    
    return final_itinerary
