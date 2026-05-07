# OMIO Clone – Intercity Transport Application

![Vue 3](https://img.shields.io/badge/Vue-3.x-42b883?style=flat-square&logo=vue.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat-square&logo=typescript)
![Docker](https://img.shields.io/badge/Docker-ready-2496ed?style=flat-square&logo=docker)
![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=flat-square&logo=node.js)

## 📸 Preview

Search for bus routes departing from Skopje to any city in Macedonia and beyond - with real carrier names, departure times, and prices.

## ✨ Features

### 🚌 Search Bus Routes

- Select destination city
- Choose date of travel
- Select number of passengers
- Instantly fetch matching available routes
- View all available routes to selected destination
- Filter routes by carrier (transport company)

### ⭐ Route Recommendations

- Cheapest one-way route suggestion
- Next available departure (in X hours/minutes)
- Optimized return ticket suggestion

### 🗺️ Map Visualization

- Interactive route map (using Leaflet)
- Visual route display from Skopje to selected destination

### 🤖 AI Travel Assistant that can answer questions like:

- “What is the cheapest route to `destination`?”
- “When is the next bus to `destination`?”
- “Is there a return ticket option to `destination`?”
- “What is the earliest departure from Skopje to `destination`?”

## 🚀 Quick Start

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and **running**
- A terminal (Command Prompt, PowerShell, or Git Bash on Windows)

### 1. Clone the Repository

```bash
git clone https://github.com/mrkskq/OMIO-Clone-Intercity-Transport-App
cd OMIO-Clone-Intercity-Transport-App
```

### 2. Start the App with Docker

```bash
bash start.sh
```

That's it. The script will:

1. Build the backend and frontend Docker images
2. Start both containers via `docker-compose`
3. Run the scraper to fetch fresh schedule data
4. Serve the app

### 3. 🌐 Access the app

|   Service   |          URL          |
| :---------: | :-------------------: |
|  Frontend   | http://localhost:5173 |
| Backend API | http://localhost:3001 |

### 4. 🚫 Stop the app

```bash
docker-compose down
```

## 🔌 API Endpoints

The backend exposes a simple REST API:

| Method | Endpoint                                | Description                             |
| ------ | --------------------------------------- | --------------------------------------- |
| `GET`  | `/api/routes`                           | Get all routes (supports query filters) |
| `GET`  | `/api/routes?to=ОХРИД`                  | Filter routes by destination            |
| `GET`  | `/api/routes?carrier=КЛАСИК`            | Filter by carrier name                  |
| `GET`  | `/api/routes?minPrice=200&maxPrice=800` | Filter by price range (MKD)             |
| `GET`  | `/api/destinations`                     | List of all unique destinations         |
| `GET`  | `/api/carriers`                         | List of all unique carriers             |

## 📁 Project Structure

```
OMIO-Clone-Intercity-Transport-App/
│   ...
├── backend/
│   ├── scraped_data/
│   ├── src/
│   │   └── types/
│   ├── utils/
│   └── Dockerfile
│   ...
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── router/
│   │   ├── stores/
│   │   ├── types/
│   │   ├── utils/
│   │   └── views/
│   ├── public/
│   └── Dockerfile
│   ...
├── docker-compose.yaml
├── README.md
└── start.sh
    ...
```

## 👥 Team

Built as part of the AWD (Advanced Web Design) course project.
