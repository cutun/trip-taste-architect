# Synapse Travel Plan  
**Travel that gets you.**

<p align="center">
  <img src="public/demo.gif" width="1000" />
</p>
---

## About The Project

Inspired by a shared frustration with modern travel planning, **Synapse Travel Plan** eliminates the digital chore of juggling a dozen browser tabs for hotels, reviews, and activities.  
We envisioned a single platform where a user's unique cultural vibe is the starting point for a truly personalized, budget-aware, and seamlessly planned adventure.

**Synapse Travel Plan** is an intelligent, privacy-first web application that crafts bespoke travel itineraries. Instead of just asking for a destination and dates, we start with a user's cultural DNA: their favorite music, movies, artists, and food.

Our AI-powered backend then translates these tastes into a coherent, day-by-day itinerary, complete with weather-appropriate activity suggestions and a detailed rationale for every choice.

---

## Technology Stack

- **Backend:** Python, FastAPI, Pydantic, Google Gemini  
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui  
- **APIs:** Qloo, Amadeus, OpenWeather

---

## Local Development Setup

To run this project locally for development and testing, you will need to run both the backend and frontend servers.

### Prerequisites

- Python (v3.9 or higher) & pip  
- Node.js (v18 or higher) & npm  
- A `.env` file in the backend root directory containing the following variables:
  - `QLOO_API_KEY`
  - `GEMINI_API_KEY`
  - `AMADEUS_CLIENT_ID`
  - `AMADEUS_CLIENT_SECRET`
  - `OPENWEATHER_KEY`

---

### Backend Setup

1. Navigate to the backend project directory.
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
4. Run the backend server:
   ```bash
   uvicorn main:app --reload
The backend API will run at: http://127.0.0.1:8000

---

### Frontend Setup
1. Navigate to the main directory.
2. Install dependencies:
   ```bash
   npm install
3. Start the frontend development server:
   ```bash
   npm run dev
The application will be accessible at: http://localhost:5173 (or the port shown in the terminal)

---

## License
This project is licensed under a custom “All Rights Reserved” license.  
See the [LICENSE](LICENSE) file for details.
