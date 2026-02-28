# CityNet IoT Platform

Welcome to the **CityNet** IoT platform repository! This project provides a comprehensive solution for managing and monitoring city IoT devices. The architecture consists of a robust backend service, a responsive frontend application, and an MQTT worker for direct device telemetry ingestion.

---

## 🏗️ Project Architecture

The repository is structured into the following core microservices and components:

- **[`api-service/`](./api-service/)**: The central Node.js backend. Exposes RESTful APIs (including comprehensive CRUD operations and Swagger documentation) to interact with devices and system data.
- **[`frontend-app/`](./frontend-app/)**: The Angular-powered web application providing an intuitive and dynamic user interface to manage the platform.
- **[`mqtt-worker/`](./mqtt-worker/)**: A dedicated worker service for handling real-time MQTT message streams from deployed IoT devices and sensors.
- **[`db/`](./db/)**: Database initialization scripts and related configuration.
- **`docker-compose.yml`**: The Docker Compose configuration for orchestrating and spinning up the complete local development environment.

---

## 🚀 Getting Started

To get the application up and running on your local machine, follow these instructions.

### Prerequisites

You will need the following installed:
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)
- [Node.js](https://nodejs.org/) (if running services natively)

### Starting the Platform with Docker

The easiest way to boot up the entire stack—including the database, API, frontend, and MQTT worker—is using Docker Compose:

```bash
# Start all services in detached mode
docker-compose up -d
```

Once started, the services will be available at their respective ports (e.g., frontend on `http://localhost:4200` and API on `http://localhost:3000`).

To bring down the services and remove the containers:

```bash
docker-compose down
```

---

## 🛠️ Development

If you prefer to run services individually for active development:

1. Navigate to the desired service directory (e.g., `cd api-service`).
2. Install dependencies (e.g., `npm install`).
3. Run the development server (e.g., `npm run dev` or `ng serve`).

*Please check the `package.json` inside each specific directory for the exact development scripts available.*

---

## 📄 API Documentation

The REST API configuration is documented using Swagger. Once the `api-service` is running, navigate to the `/docs` or `/api-docs` endpoint to view and interact with the API endpoints.

