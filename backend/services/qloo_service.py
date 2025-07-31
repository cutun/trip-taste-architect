# services/qloo_service.py
import os
import httpx
from dotenv import load_dotenv
import json

load_dotenv()
QLOO_API_KEY = os.getenv("QLOO_API_KEY")
QLOO_API_URL = os.getenv("QLOO_API_URL")

# Common headers for every request
# Using the X-Api-Key header as specified in your original file.
HEADERS = {
    "Content-Type": "application/json",
    "X-Api-Key": QLOO_API_KEY,
}


async def search_entities(query: str) -> list[dict]:
    """
    Searches for entities and returns a list of dictionaries, each
    containing the entity's ID and its primary entity type.

    It ignores results that do not have a valid 'urn:entity:' type.
    """
    # Assuming QLOO_API_URL and HEADERS are defined elsewhere in your file
    async with httpx.AsyncClient() as client:
        try:
            print(f"🚀 [Qloo] searching for '{query}'")
            resp = await client.get(
                f"{QLOO_API_URL}/search",
                params={"query": query},
                headers=HEADERS,
            )
            resp.raise_for_status()
            results = resp.json()["results"]

            processed_results = []
            for item in results:
                # Find the first type that starts with 'urn:entity:', which
                # identifies what the item actually is (artist, movie, etc.).
                primary_type = next(
                    (t for t in item.get("types", []) if t.startswith("urn:entity:")),
                    None  # Use None as the default if no match is found
                )

                # Only add the item to our list if we found a valid primary type
                if primary_type:
                    processed_results.append({
                        "id": item["entity_id"],
                        "type": primary_type
                    })

            return processed_results

        except httpx.HTTPStatusError as e:
            print(f"HTTP {e.response.status_code}: {e.response.text}")
            return []
        except Exception as e:
            print(f"search_entities() error: {e}")
            return []


# In services/qloo_service.py

async def get_recommendations(
    user_likes: list[dict],
    filter_type: str,
    destination_city: str | None = None,
    take: int = 10
) -> dict:
    """
    Gets recommendations from the Qloo Insights API using the correct POST
    payload structure as defined in the API documentation.
    """
    if not user_likes:
        return {}

    entities_payload = [
        {"entity": like["id"], "weight": 100} for like in user_likes
    ]

    # Correctly structure the main payload for a POST request
    payload = {
        "feature": {
            "explainability": True
        },
        "signal": {
            "interests": {
                "entities": entities_payload
            }
        },
        "filter": {
            "type": filter_type
        },
        "results": [
            {"take": take}
        ]
    }

    # Conditionally add the location filter
    if destination_city:
        payload["filter"]["location"] = {"query": destination_city}

    final_url = f"{QLOO_API_URL}/v2/insights"
    
    print("🚀 [Qloo] Sending Final Recommendations Request (POST)")
    # print(f"URL: {final_url}")
    # print(f"PAYLOAD: {payload}")
    # print("--------------------------------------------------")

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            resp = await client.post(final_url, json=payload, headers=HEADERS)
            resp.raise_for_status()
            print("✅ [Qloo] Sucessfully generated recommendations")
            return resp.json()
        except httpx.HTTPStatusError as e:
            print(f"❌ [Qloo] ERROR: Request failed. HTTP {e.response.status_code}: {e.response.text}")
            return {}
        except Exception as e:
            print(f"❌ [Qloo] An unexpected application error occurred: {e}")
            raise
