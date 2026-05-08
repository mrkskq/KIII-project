# Busly — OMIO-Clone-Intercity-Transport-App

![Vue 3](https://img.shields.io/badge/Vue-3.x-42b883?style=flat-square&logo=vue.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat-square&logo=typescript)
![Docker](https://img.shields.io/badge/Docker-ready-2496ed?style=flat-square&logo=docker)
![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=flat-square&logo=node.js)

## Table of Contents

1. [Preview](#preview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Architecture Overview](#architecture-overview)
5. [Search Flow](#search-flow)
6. [AI Assistant](#ai-assistant)
7. [Project Structure](#project-structure)
8. [Getting Started](#getting-started)
9. [Docker and Deployment](#docker-and-deployment)
10. [Challenges and Solutions](#challenges-and-solutions)
11. [API Reference](#api-reference)
12. [Advanced Web Design course project](#advanced-web-design-course-project)

## Preview

Search for bus routes departing from Skopje to any city in Macedonia and beyond - with real carrier names, departure times, and prices.

## Features

- **Bus route search** — search bus routes from Skopje to any city in Macedonia and beyond by destination, date, and number of passengers
- **Route recommendations** — each search surfaces three highlighted routes: the cheapest one-way fare, the next available departure, and the best return ticket option
- **Interactive map** — Leaflet-powered route visualization from Skopje to the selected destination, with OSRM routing
- **AI travel assistant** — a chat widget that understands natural language questions about routes, including:
  - Next departure to a destination
  - Cheapest available fare
  - Earliest morning departure
  - Best return ticket option
- **Carrier filtering** — filter results by transport company
- **Date slider** — quickly switch between days directly on the results page

## Tech Stack

| Layer            | Technology                                         |
| ---------------- | -------------------------------------------------- |
| Frontend         | Vue 3, TypeScript, Pinia, Vue Router, Tailwind CSS |
| Backend          | Node.js, Express, TypeScript                       |
| Map              | Leaflet + OSRM                                     |
| Data             | Scraped schedule data (Cheerio + Axios)            |
| Containerization | Docker + Docker Compose                            |

## Architecture Overview

The application follows a standard client-server architecture, with the Vue frontend and Express backend running as separate Docker containers that communicate over HTTP.

```
Browser
  └── Vue 3 Frontend (port 5173)
        ├── Pinia Store → GET /api/routes, /api/destinations, /api/carriers
        ├── AiChatWidget → POST /ai/ask
        └── RouteMap → OSRM (external, for road routing)

Express Backend (port 3001)
  ├── server.ts → /api/* routes
  ├── ai.routes.ts → /ai/ask
  ├── filterRoutes.ts → query filtering logic
  └── scraped_data/bus_routes.json → static data source
```

When the user performs a search, the Vue frontend sends an HTTP request via the Pinia store to the Express backend. The backend reads from a pre-scraped JSON file, applies the requested filters, and returns the results. No database is involved — all data lives in a static JSON file that is populated once by the scraper.

The AI assistant follows the same pattern: the frontend sends the user's question to `POST /ai/ask`, the backend processes it using intent detection logic, and returns both a natural language answer and the matching routes.

Map routing is handled client-side. Once the user selects a route, the `RouteMap` component uses Leaflet to render the map and queries the public OSRM API to draw the road path from Skopje to the destination.

## Search Flow

The following steps describe what happens from the moment a user enters a destination to seeing results on screen.

1. **Input** — the user types a destination in the search form, selects a date, and chooses the number of passengers. The destination field uses an autocomplete list fetched from `GET /api/destinations` on page load.
2. **Navigation** — on submit, Vue Router redirects to `/results` with the search parameters encoded as query strings (`?to=ОХРИД&date=2026-05-08&p=1`).
3. **Store request** — `ResultsView` mounts and the Pinia store calls `GET /api/routes?to=ОХРИД`. The store sets `loading: true` while waiting.
4. **Backend filtering** — the Express server passes the query parameters to `filterRoutes()`, which filters the JSON data by destination, carrier, and optionally price range.
5. **Response** — the backend returns a JSON object with a `count` and a `routes` array. The store saves the routes and sets `loading: false`.
6. **Badge calculation** — the `useRouteBadges` composable runs over the returned routes and identifies three special routes: the cheapest fare, the next upcoming departure relative to the current time, and the best return ticket option. Each of these receives a badge that is displayed on its `RouteCard`.
7. **Map render** — the first route is automatically selected, and `RouteMap` fetches the road path from OSRM and renders it on a Leaflet map alongside the results list.
8. **Date switching** — the `DateSlider` component above the results allows the user to move to the next or previous day, which triggers a new store request with the updated date.

## AI Assistant

The AI assistant is intentionally built without any external AI APIs. It runs entirely on the backend using a keyword-based intent detection system written in TypeScript.

### How it works

When a question is submitted to `POST /ai/ask`, the backend processes it in four steps:

**1. Normalization** — the input text is passed through `normalizeText()`, which converts it to lowercase and strips diacritics. This ensures that queries work regardless of how the user types them (e.g. `Охрид`, `ОХРИД`, and `ohrid` are all treated the same).

**2. Intent detection** — `detectIntent()` scans the normalized text for Macedonian keywords and returns one of five intents: `cheapest`, `next`, `earliest`, `return`, `general`

**3. Route search** — `searchRoutes()` filters the route data by destination (if the city name appears in the question) and by carrier (if a carrier name is mentioned). It then sorts or filters the results according to the detected intent — for example, sorting by price for `cheapest`, or filtering by departure time for `next`.

**4. Answer formatting** — `formatAnswer()` takes the intent and the top matching route and constructs a human-readable response in Macedonian. If no routes are found, a fallback message is returned.

## Project Structure

```
OMIO-Clone-Intercity-Transport-App/
├── backend/
│   ├── scraped_data/               # Scraped bus schedules and route data
│   ├── src/
│   │   ├── types/                  # Shared TypeScript interfaces/models
│   │   ├── ai/                     # AI assistant logic and endpoints
│   │   ├── scraper/                # Web scraping functionality
│   │   └── server/                 # Express server setup and API routes
│   │
│   ├── utils/                      # Backend helper and filtering utilities
│   └── Dockerfile                  # Backend Docker configuration
│
├── frontend/
│   ├── public/                     # Static assets and images
│   ├── src/
│   │   ├── components/             # Reusable Vue UI components
│   │   ├── composables/            # Vue composable logic/hooks
│   │   ├── router/                 # Vue Router configuration
│   │   ├── stores/                 # Pinia state management
│   │   ├── types/                  # Shared frontend TypeScript types
│   │   ├── utils/                  # Frontend utility/helper functions
│   │   └── views/                  # Main application pages
│   │
│   └── Dockerfile                  # Frontend Docker configuration
│
├── docker-compose.yaml             # Multi-container Docker setup
├── start.sh                        # Project startup script
└── README.md                       # Project documentation
```

## Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- A terminal (Command Prompt, PowerShell, or Git Bash on Windows)

### 1. Clone the repository

```bash
git clone https://github.com/mrkskq/OMIO-Clone-Intercity-Transport-App
cd OMIO-Clone-Intercity-Transport-App
```

### 2. Start the application

```bash
bash start.sh
```

This will build both Docker images, start the containers, and serve the application.

### 3. Open in your browser

| Service     | URL                   |
| ----------- | --------------------- |
| Frontend    | http://localhost:5173 |
| Backend API | http://localhost:3001 |

### 4. Stop the application

```bash
docker-compose down
```

### Full reset (clears all cached data)

```bash
docker compose down --volumes --rmi all
docker compose up --build
```

Use this if the application behaves unexpectedly after code changes.

## Docker and Deployment

The application is fully containerized using Docker Compose. Two separate containers are defined — one for the frontend (Vite dev server) and one for the backend (Node.js + Express) — and they communicate over Docker's internal network.

The frontend container runs the Vite development server and exposes port `5173`. The backend container runs the compiled TypeScript Express server and exposes port `3001`. Both ports are mapped to the host machine, which means the browser can reach both services via `localhost`.

Docker Compose also manages named volumes for `node_modules` in both containers. This prevents the host machine's `node_modules` from being mounted into the container, which avoids platform-specific binary conflicts (particularly relevant on Windows and Apple Silicon).

Using Docker means the application requires no local Node.js installation and runs identically across operating systems.

## Challenges and Solutions

### Handling Cyrillic text in search and filtering

Bus destinations in the scraped data are stored in Macedonian Cyrillic (`ОХРИД`, `БИТОЛА`). The AI assistant, however, needs to match user queries that may be typed in either Cyrillic or Latin script, in any casing, and with or without diacritics. The solution was a `normalizeText()` utility that lowercases the input and strips all diacritics before any comparison is made. This ensures that `Охрид`, `ОХРИД`, and `ohrid` all match the same routes.

### Inconsistent scraped data

Web scraping produces inconsistent results — some routes had missing prices, undefined carriers, or malformed departure times. A normalization pass was added to the scraper output to clean and validate each route before it is written to `bus_routes.json`. The backend also applies defensive checks (e.g. `r.returnPrice && r.returnPrice > 0`) before using optional fields.

### Badge conflicts in route recommendations

The `useRouteBadges` composable needed to assign three distinct badges without conflicts — the same route could theoretically qualify as both the cheapest and the next departure. The solution was to evaluate badges in priority order (`recommended` first, then `next`, then `cheapest`) and exclude already-assigned routes from subsequent checks using the `same()` comparator.

### Leaflet integration with Vue 3

Leaflet is not built for reactive frameworks and expects to control the DOM directly. Mounting a Leaflet map inside a Vue component required careful lifecycle management — the map is initialized inside `onMounted` and destroyed in `onUnmounted` to prevent memory leaks and duplicate map instances when the component re-renders.

## API Reference

| Method | Endpoint                                | Description                                   |
| ------ | --------------------------------------- | --------------------------------------------- |
| `GET`  | `/api/routes`                           | All routes (supports query filters)           |
| `GET`  | `/api/routes?to=ОХРИД`                  | Filter by destination                         |
| `GET`  | `/api/routes?carrier=КЛАСИК`            | Filter by carrier                             |
| `GET`  | `/api/routes?minPrice=200&maxPrice=800` | Filter by price range (MKD)                   |
| `GET`  | `/api/destinations`                     | All unique destinations                       |
| `GET`  | `/api/carriers`                         | All unique carriers                           |
| `POST` | `/ai/ask`                               | AI assistant — accepts `{ question: string }` |

## Advanced Web Design course project

The goal of Busly is to simulate a modern intercity transport platform similar to OMIO, focused on bus transportation in Macedonia and nearby regions. The project combines frontend development, backend APIs, web scraping, Docker containerization, map visualization, and lightweight AI-based route assistance into a single full-stack application.
