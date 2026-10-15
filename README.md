# Notification Service

A backend notification service built with **Node.js, TypeScript, Express, BullMQ, Redis, and Socket.IO**. It processes notifications asynchronously, supports scheduled delivery and automatic retries, and delivers in-app notification events to connected clients in real time.

The project demonstrates background job processing, queue management, event-driven communication, and real-time delivery using a modular TypeScript architecture.

## Features

- **REST API** — Create notifications, schedule future notifications, and check job processing status.
- **Background processing** — Process notifications asynchronously using BullMQ workers.
- **Multiple notification channels** — Route notifications through email and in-app delivery services.
- **Automatic retries** — Retry failed jobs up to three attempts using exponential backoff.
- **Scheduled notifications** — Queue notifications for delivery at a specified future time.
- **Failed-job inspection** — Retain and inspect failed jobs for troubleshooting.
- **Real-time notifications** — Deliver in-app notification events to connected clients using Socket.IO.
- **Recipient-specific rooms** — Route real-time events to clients that have joined the corresponding recipient room.
- **Redis Pub/Sub** — Decouple notification event publishing from real-time event delivery.
- **TypeScript** — Use static typing and shared notification payload definitions.

## Tech Stack

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| TypeScript | Type safety and maintainable code |
| Express | REST API |
| Redis | Queue infrastructure and event messaging |
| BullMQ | Background jobs, scheduling and retries |
| Socket.IO | Real-time client communication |
| Docker Compose | Local Redis environment |
| npm | Package and script management |

## Architecture

The service separates API requests, background processing, and real-time delivery.

```text
                 Client / Postman
                        |
                        v
                 Express REST API
                        |
                        v
                  BullMQ Queue
                        |
                        v
                Notification Worker
                        |
                 +------+------+
                 |             |
                 v             v
            Email Service   In-App Service
            (simulated)          |
                                 v
                          Redis Pub/Sub
                                 |
                                 v
                       Redis Subscriber
                                 |
                                 v
                            Socket.IO
                                 |
                                 v
                      Connected Recipient
```

### How it works

1. A client submits a notification through the REST API.
2. The API validates the request and adds a job to the BullMQ queue.
3. The worker processes the job independently of the HTTP request.
4. Failed jobs can be retried according to the configured retry policy.
5. For in-app notifications, the service publishes an event through Redis Pub/Sub.
6. The API server's Redis subscriber forwards the event through Socket.IO to the appropriate recipient room.

**Important:** Redis Pub/Sub provides real-time event delivery to active subscribers. Notifications are not currently persisted in a database, so offline recipients cannot retrieve previously published notifications.

## Prerequisites

Install the following before running the project:

- [Node.js](https://nodejs.org/) — compatible with Node.js 22 or later
- npm
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) with Docker Compose
- [Postman](https://www.postman.com/) or another HTTP client for API testing

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Teddy-Ndonga/notification-service.git
cd notification-service
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start Redis

Start the Redis container using Docker Compose:

```bash
docker compose up -d
```

Verify that Redis is running:

```bash
docker exec notification-service-redis redis-cli ping
```

Expected output:

```text
PONG
```

The current local configuration uses `127.0.0.1:6379` for Redis connections.

### 4. Start the API server

```bash
npm run dev
```

The server runs on port `3000` by default.

### 5. Start the notification worker

Open a separate terminal and run:

```bash
npm run worker
```

The worker must be running to process queued notification jobs.

### 6. Build the project

To check the TypeScript compilation:

```bash
npm run build
```

To run the compiled server after building:

```bash
npm start
```

Run the API server and worker in separate terminals during local development.

## API Documentation

The API currently exposes the following endpoints.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Check API availability |
| `POST` | `/notifications` | Create a notification job |
| `GET` | `/notifications/:id` | Retrieve the processing status of a job |
| `POST` | `/notifications/schedule` | Schedule a notification for a future time |

### 1. Health check

**Request**

```http
GET http://localhost:3000/health
```

Example response:

```json
{
  "status": "ok"
}
```

### 2. Create a notification

**Request**

```http
POST http://localhost:3000/notifications
Content-Type: application/json
```

Example body:

```json
{
  "recipient": "teddy@example.com",
  "message": "Your order has been processed.",
  "channel": "email"
}
```

Supported channel values:

- `email`
- `in-app`

A successful request returns `202 Accepted` with a job identifier. This means the notification was accepted for asynchronous processing; it does not by itself confirm successful delivery.

Example response shape:

```json
{
  "message": "Notification queued successfully.",
  "jobId": "123"
}
```

The actual response fields and wording are determined by the API implementation.

### 3. Check notification status

**Request**

```http
GET http://localhost:3000/notifications/123
```

Replace `123` with the job ID returned when creating the notification.

This endpoint checks the queue job's processing state, allowing clients to distinguish between queued, active, completed, delayed, and failed jobs where applicable.

A job's status is not the same as a persistent notification's read/unread status.

### 4. Schedule a notification

**Request**

```http
POST http://localhost:3000/notifications/schedule
Content-Type: application/json
```

Example body:

```json
{
  "recipient": "teddy@example.com",
  "message": "Your appointment is coming up.",
  "channel": "in-app",
  "scheduledAt": "2027-01-15T09:00:00.000Z"
}
```

Provide a future timestamp in ISO 8601 format. The API calculates the delay and schedules the job through BullMQ.

The example timestamp is illustrative; use an appropriate future time when testing.

### 5. Inspect failed jobs

Run the included script:

```bash
npm run jobs:failed
```

This inspects retained failed jobs, making it easier to investigate processing errors.

## Real-Time In-App Notifications

The service uses Socket.IO for real-time delivery and Redis Pub/Sub to communicate notification events between the worker and the API server.

### Connect a client

Connect to:

```text
http://localhost:3000
```

Once connected, emit the `join-recipient` event with the recipient identifier:

```javascript
socket.emit("join-recipient", "teddy@example.com");
```

The server normalizes the recipient and joins the corresponding room:

```text
recipient:teddy@example.com
```

After joining, the client can listen for notification events:

```javascript
socket.on("in-app-notification", (notification) => {
  console.log("Received notification:", notification);
});
```

The event contains the recipient and notification message.

### Test the Socket.IO client

The repository includes a test client:

```bash
npm run socket:test
```

Keep the test client running, then submit an in-app notification using the REST API. The client waits for and prints the real-time notification event.

For the test to work, Redis, the API server, and the notification worker must all be running.

## Retry and Failure Handling

Notification jobs are configured with:

- A maximum of three processing attempts.
- Exponential backoff starting at 1,000 milliseconds.
- Retention of completed jobs, capped at 1,000 jobs.
- Retention of failed jobs for up to 24 hours, capped at 5,000 jobs.

These settings help demonstrate asynchronous failure recovery and operational inspection.

For development and testing, a message containing `[FAIL]` triggers a simulated worker failure. This is useful for observing retries and failed-job handling; it is not a production delivery mechanism.

## Available npm Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development API server |
| `npm run build` | Compile TypeScript |
| `npm start` | Start the compiled API server |
| `npm run worker` | Start the BullMQ worker |
| `npm run redis:test` | Run the Redis playground script |
| `npm run notification:test` | Add a test notification to the queue |
| `npm run jobs:failed` | Inspect failed notification jobs |
| `npm run socket:test` | Run the Socket.IO test client |

## Project Structure

```text
notification-service/
├── src/
│   ├── queues/
│   │   └── notification.queue.ts
│   ├── workers/
│   │   └── notification.worker.ts
│   ├── services/
│   │   ├── email.service.ts
│   │   └── in-app.service.ts
│   ├── types/
│   │   └── notification.ts
│   ├── app.ts
│   ├── server.ts
│   ├── redis.ts
│   ├── redis-publisher.ts
│   └── redis-subscriber.ts
├── scripts/
│   ├── redis-playground.ts
│   ├── add-notification.ts
│   ├── inspect-failed-jobs.ts
│   └── test-socket.ts
├── compose.yaml
├── package.json
├── package-lock.json
├── tsconfig.json
├── .gitignore
└── README.md
```

### Main components

- **`app.ts`** — Defines the HTTP routes and notification API.
- **`server.ts`** — Creates the HTTP server and initializes Socket.IO.
- **`notification.queue.ts`** — Configures the BullMQ notification queue.
- **`notification.worker.ts`** — Processes queued jobs and routes them to the correct service.
- **`email.service.ts`** — Simulates email notification delivery.
- **`in-app.service.ts`** — Publishes in-app notification events through Redis.
- **`redis-publisher.ts`** — Provides the Redis publishing connection.
- **`redis-subscriber.ts`** — Receives notification events and forwards them to Socket.IO rooms.
- **`notification.ts`** — Defines shared notification payload types.

## Current Limitations

This project focuses on backend architecture and asynchronous notification processing. The following are not yet implemented:

- Actual email delivery through an email provider.
- Database-backed notification persistence and history.
- Offline notification retrieval.
- User authentication and authorization.
- Persistent read/unread status.
- Comprehensive automated API and worker test coverage.
- Production deployment and monitoring.

The current Socket.IO recipient-room mechanism is intended for local development and demonstration. In production, room membership must be authorized so clients cannot subscribe to another user's notifications simply by supplying an email address.

## Future Improvements

Potential extensions include:

- PostgreSQL persistence with Prisma.
- Notification history, pagination, and read/unread management.
- Real email delivery and delivery-result tracking.
- Authentication and recipient-level authorization.
- Idempotency and duplicate-delivery protection.
- Automated integration and failure-recovery tests.
- Structured logging, health checks, and queue monitoring.
- Dockerized API and worker services with production configuration.

