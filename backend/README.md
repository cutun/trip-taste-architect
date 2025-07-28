# TasteTrail

**Personalized travel itineraries powered by Qloo Taste AI & GPT**

## Table of Contents

* [Demo](#demo)
* [Features](#features)
* [How It Works](#how-it-works)
* [Tech Stack](#tech-stack)
* [Architecture](#architecture)
* [Getting Started](#getting-started)
* [Environment Variables](#environment-variables)
* [Scripts](#scripts)
* [Deployment](#deployment)
* [Roadmap](#roadmap)
* [Contributing](#contributing)
* [License](#license)
* [Acknowledgements](#acknowledgements)

## Demo

<!-- Add Loom/Youtube link and screenshots -->

<p align="center">
  <img src="docs/screenshot.png" alt="TasteTrail itinerary screenshot" width="700"/>
</p>

## Features

* **Taste‑aligned recommendations** – Uses Qloo’s Taste AI graph to match hotels, restaurants, and activities to the user’s cultural preferences.
* **Budget‑aware planning** – Real‑time price data and a constraint solver keep the trip under budget.
* **1‑click swaps & regenerate** – Instantly replace any item and rebalance the entire itinerary.
* **Privacy‑first** – No personal identifying data, only cultural signals.
* **Book‑ready output** – Every suggestion includes provider links, prices, and availability.

## How It Works

1. **Collect preferences** from the user (budget, dates, likes & dislikes).
2. **Taste Vectorization** – Map likes to Qloo entity IDs and fetch cross‑domain recommendations.
3. **Data Enrichment** – Pull live hotel and activity data from Amadeus and Viator APIs.
4. **LLM Orchestration** – GPT‑4o weaves everything into a day‑by‑day plan with explanations.
5. **Constraint Solver** – Python module filters and adjusts for budget & schedule conflicts.
6. **Frontend Delivery** – Next.js renders an interactive timeline with swap / regenerate actions.

<p align="center">
  <img src="docs/architecture.svg" alt="High‑level architecture" width="700"/>
</p>

## Tech Stack

| Layer     | Tech                                             |
| --------- | ------------------------------------------------ |
| Frontend  | Next.js 14, React, Tailwind CSS                  |
| Backend   | FastAPI, Postgres, SQLModel                      |
| AI / Data | OpenAI GPT‑4o, Qloo Taste AI™, LangChain         |
| DevOps    | Docker, GitHub Actions, Vercel (FE), Fly.io (BE) |

## Getting Started

### Prerequisites

* **Node.js** ≥ 20
* **Python** ≥ 3.11
* **Docker** & **Docker Compose** (optional)
* API keys (see below)

### 1. Clone the repo

```bash
git clone https://github.com/your-org/tastetrail.git && cd tastetrail
```

### 2. Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # add your keys
uvicorn app.main:app --reload
```

### 3. Frontend

```bash
cd ../frontend
pnpm install
cp .env.example .env   # add the same keys
pnpm dev
```

Visit **[http://localhost:3000](http://localhost:3000)** and start planning!

## Environment Variables

| Key                                     | Description                        |
| --------------------------------------- | ---------------------------------- |
| `QLOO_API_KEY`                          | Dev key from Qloo hackathon portal |
| `OPENAI_API_KEY`                        | GPT model key                      |
| `AMADEUS_API_KEY`, `AMADEUS_API_SECRET` | Hotel & flight pricing             |
| `VIATOR_API_KEY`                        | Activity data                      |
| `JWT_SECRET`                            | Used by FastAPI for session tokens |

See `.env.example` for the full list.

## Scripts

| Command             | Description                       |
| ------------------- | --------------------------------- |
| `pnpm lint`         | Run eslint & prettier             |
| `pytest`            | Run backend unit tests            |
| `docker compose up` | Start both services in containers |

## Deployment

1. **Backend** → Fly.io / Railway:

   ```bash
   fly launch
   ```
2. **Frontend** → Vercel:

   * Import repo, set env vars, click **Deploy**.

## Roadmap

* [ ] Multi‑city itineraries
* [ ] Off‑line mode (PWA)
* [ ] Group taste blending
* [ ] In‑app booking via Stripe

## Contributing

PRs are welcome! Please open an issue first to discuss major changes.

## License

MIT © 2025 TasteTrail Team

## Acknowledgements

* Qloo for the Taste AI™ graph
* OpenAI for GPT‑4o
* Amadeus Travel APIs
* Viator / Tripadvisor activities
