# Busly — Intercity Bus Transport App

![Vue 3](https://img.shields.io/badge/Vue-3.x-42b883?style=flat-square&logo=vue.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat-square&logo=typescript)
![Docker](https://img.shields.io/badge/Docker-ready-2496ed?style=flat-square&logo=docker)
![MongoDB](https://img.shields.io/badge/MongoDB-7.x-47a248?style=flat-square&logo=mongodb)
![Kubernetes](https://img.shields.io/badge/Kubernetes-k3d-326ce5?style=flat-square&logo=kubernetes)

Busly is a web application for searching intercity bus routes from Skopje to cities across Macedonia and the region. The app is fully containerized, orchestrated with Docker Compose and Kubernetes, and has a CI pipeline via GitHub Actions.

## Table of Contents

1. [Architecture](#architecture)
2. [Tech Stack](#tech-stack)
3. [Local Setup](#local-setup)
4. [Docker and Docker Compose](#docker-and-docker-compose)
5. [Environment Variables](#environment-variables)
6. [CI — GitHub Actions](#ci--github-actions)
7. [Kubernetes](#kubernetes)

---

## Architecture

The application consists of three services:

```
Browser
  └── Vue 3 Frontend (port 5173)
        └── Pinia Store → GET /api/routes, /api/destinations, /api/carriers

Express Backend (port 3001)
  ├── /api/* routes → filterRoutes logic
  └── MongoDB connection (mongoose)

MongoDB (port 27017)
  └── busly database → bus_routes collection (817 routes)
```

---

## Tech Stack

| Layer            | Technology                                         |
| ---------------- | -------------------------------------------------- |
| Frontend         | Vue 3, TypeScript, Pinia, Vue Router, Tailwind CSS |
| Backend          | Node.js, Express, TypeScript, Mongoose             |
| Database         | MongoDB 7                                          |
| Map              | Leaflet + OSRM                                     |
| Containerization | Docker + Docker Compose                            |
| CI               | GitHub Actions → DockerHub                         |
| Orchestration    | Kubernetes (k3d), Ingress (Traefik)                |

---

## Local Setup

### Requirements

- Docker Desktop (running)
- Git

### Steps

```bash
git clone https://github.com/mrkskq/KIII-project
cd KIII-project
cp .env.example .env
docker compose up --build
```

Then seed the database:

```bash
docker exec busly-backend-v2 npm run seed
```

| Service     | URL                       |
| ----------- | ------------------------- |
| Frontend    | http://localhost:5173     |
| Backend API | http://localhost:3001     |
| MongoDB     | mongodb://localhost:27017 |

### Stop

```bash
docker compose down
```

---

## Docker and Docker Compose

Each service has its own `Dockerfile`. The `docker-compose.yaml` orchestrates all three:

- **mongo** — official MongoDB 7 image with a persistent volume for `/data/db`
- **backend** — Node.js/Express, connects to MongoDB via the `MONGO_URI` environment variable
- **frontend** — Vue 3 Vite dev server

MongoDB data is stored in the named volume `mongo_data` and survives container restarts.

---

## Environment Variables

All configuration values are stored in a `.env` file at the project root, loaded automatically by Docker Compose. A template is provided as `.env.example`:

```env
# MongoDB
MONGO_INITDB_DATABASE=busly
MONGO_PORT=27017

# Backend
NODE_ENV=development
MONGO_URI=mongodb://mongo:27017/busly
FRONTEND_URL=http://localhost:5173
BACKEND_PORT=3001

# Frontend
VITE_API_URL=http://localhost:3001
FRONTEND_PORT=5173
```

Copy it before running the project:

```bash
cp .env.example .env
```

The actual `.env` file is excluded from version control via `.gitignore`.

---

## CI — GitHub Actions

On every push to the `master` branch, GitHub Actions automatically:

1. Checks out the code
2. Logs in to DockerHub using secrets (`DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`)
3. Builds and pushes `busly-backend:latest` to DockerHub
4. Builds and pushes `busly-frontend:latest` to DockerHub

The pipeline is defined in `.github/workflows/ci.yml`.

```
git push → GitHub Actions → DockerHub
                            ├── mrkskq44/busly-backend:latest
                            └── mrkskq44/busly-frontend:latest
```

---

## Kubernetes

The application is deployed on a local k3d cluster in a dedicated `busly` namespace.

### Create the cluster

```bash
k3d cluster create busly-cluster
kubectl apply -f k8s/namespace.yaml
```

### Apply all manifests

```bash
kubectl apply -f k8s/mongo-statefulset.yaml
kubectl apply -f k8s/mongo-service.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml
kubectl apply -f k8s/ingress.yaml
```

### Seed the database

```bash
kubectl exec -it -n busly deployment/backend -- npm run seed
```

### Manifest overview

| File                       | Description                                |
| -------------------------- | ------------------------------------------ |
| `namespace.yaml`           | Namespace `busly`                          |
| `mongo-statefulset.yaml`   | StatefulSet + ConfigMap for MongoDB        |
| `mongo-service.yaml`       | Headless Service for MongoDB               |
| `backend-deployment.yaml`  | Deployment + ConfigMap for backend         |
| `backend-service.yaml`     | ClusterIP Service for backend (port 3001)  |
| `frontend-deployment.yaml` | Deployment + ConfigMap for frontend        |
| `frontend-service.yaml`    | ClusterIP Service for frontend (port 5173) |
| `ingress.yaml`             | Ingress with host `busly.local`            |

### Accessing the app via Ingress

Add to `C:\Windows\System32\drivers\etc\hosts`:

```
127.0.0.1 busly.local
```

Then open in your browser: **http://busly.local**

Ingress routing:

- `/` → frontend (5173)
- `/api` → backend (3001)

### Cluster status

```bash
kubectl get all -n busly
```

```
NAME                            READY   STATUS    RESTARTS
pod/backend-xxx                 1/1     Running   0
pod/frontend-xxx                1/1     Running   0
pod/mongo-0                     1/1     Running   0

NAME               TYPE        CLUSTER-IP    PORT(S)
service/backend    ClusterIP   10.43.x.x     3001/TCP
service/frontend   ClusterIP   10.43.x.x     5173/TCP
service/mongo      ClusterIP   None          27017/TCP

NAME                       READY
deployment.apps/backend    1/1
deployment.apps/frontend   1/1
statefulset.apps/mongo     1/1
```
