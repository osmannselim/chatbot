# Madlen Chat

A modern, local web-based chat application that serves as a gateway to AI models via [OpenRouter](https://openrouter.ai/), fully instrumented with OpenTelemetry for observability.

![Python](https://img.shields.io/badge/Python-3.10+-blue)
![Django](https://img.shields.io/badge/Django-4.2-green)
![React](https://img.shields.io/badge/React-19-61DAFB)
![OpenTelemetry](https://img.shields.io/badge/OpenTelemetry-Enabled-blueviolet)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Technical Decisions](#technical-decisions)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Usage](#usage)
- [Observability Guide](#observability-guide)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)

---

## Overview

Madlen Chat is a full-stack chat application that allows users to interact with various AI models through a clean, modern interface. Key features include:

- **Multi-Model Support**: Connect to free AI models (Llama 3.3, Mistral, Gemini, DeepSeek, etc.)
- **Session Management**: Create, switch, and persist chat sessions
- **Collapsible Sidebar**: Clean UI with session history
- **Full Observability**: OpenTelemetry traces exported to Jaeger
- **Robust Error Handling**: Graceful degradation with user-friendly error messages

---

## Technical Decisions

### Backend: Django + Django REST Framework

| Decision | Reasoning |
|----------|-----------|
| **Django** | Mature, secure framework with excellent ORM and admin interface |
| **Django REST Framework** | Industry-standard for building REST APIs with serialization, validation |
| **OpenTelemetry SDK** | Native Python support with automatic Django instrumentation |

### Frontend: React + Vite + Tailwind CSS

| Decision | Reasoning |
|----------|-----------|
| **React 19** | Component-based architecture, large ecosystem, excellent DX |
| **Vite** | 10x faster HMR than CRA, modern ES modules, proxy configuration |
| **Tailwind CSS v4** | Utility-first approach, rapid prototyping, no CSS bloat |
| **Lucide React** | Modern, consistent icon library with tree-shaking |

### Database: SQLite

| Decision | Reasoning |
|----------|-----------|
| **SQLite** | **Zero-configuration** - No database server installation required |
| | Runs on any local machine without complex setup |
| | File-based persistence sufficient for local development |
| | Focus on Developer Experience over production scalability |

### Observability: OpenTelemetry + Jaeger

| Decision | Reasoning |
|----------|-----------|
| **OpenTelemetry** | Vendor-neutral, industry-standard tracing |
| **Jaeger** | Powerful UI for exploring traces, Docker-ready |
| **Custom Spans** | `processing_chat_request` and `openrouter_api_call` for granular insights |

---

## Prerequisites

Ensure the following are installed on your machine:

| Requirement | Version | Check Command |
|-------------|---------|---------------|
| **Python** | 3.10+ | `python --version` |
| **Node.js** | 18+ | `node --version` |
| **npm** | 9+ | `npm --version` |
| **Docker** | 20+ | `docker --version` |

---

## Installation & Setup

### Step 1: Clone & Navigate

```bash
git clone <repository-url>
cd madlen-app
```

### Step 2: Start Infrastructure (Jaeger)

Start the Jaeger container for trace visualization:

```bash
docker compose up -d
```

Verify Jaeger is running:
- Open http://localhost:16686 in your browser

### Step 3: Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# macOS/Linux:
source venv/bin/activate
# Windows:
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env and add your OpenRouter API key:
# OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxx
```

Get your API key from: https://openrouter.ai/keys

```bash
# Run database migrations
python manage.py migrate

# Start the backend server
python manage.py runserver 8000
```

Backend running at: http://127.0.0.1:8000

### Step 4: Frontend Setup

Open a **new terminal**:

```bash
# Navigate to frontend
cd madlen-app/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend running at: http://localhost:5173

---

## Usage

1. **Open the App**: Navigate to http://localhost:5173
2. **Select a Model**: Use the dropdown in the header to choose an AI model
3. **Start Chatting**: Type a message or click a suggestion card
4. **Manage Sessions**: 
   - Click "New Chat" to start a new conversation
   - Click any session in the sidebar to switch
   - Collapse/expand sidebar with the toggle button

---

## Observability Guide

### Accessing Jaeger

1. Open http://localhost:16686 in your browser
2. Select **Service**: `chatbot-backend`
3. Click **Find Traces**

### Understanding Traces

Each chat request generates a trace with the following spans:

```
chatbot-backend: POST /api/chat/send/    (Root span - Django auto-instrumented)
└── processing_chat_request              (Custom span - View logic)
    └── openrouter_api_call              (Custom span - External API call)
        └── POST                         (Auto-instrumented HTTP request)
```

### Key Span Attributes

| Span | Attribute | Description |
|------|-----------|-------------|
| `processing_chat_request` | `chat.session_id` | Current conversation ID |
| | `chat.model` | Selected AI model |
| | `chat.message_length` | User message length |
| `openrouter_api_call` | `openrouter.model` | Model used for generation |
| | `http.status_code` | API response status |
| | `openrouter.response_time_ms` | External API latency |
| | `openrouter.tokens_used` | Total tokens consumed |

---

## Project Structure

```
madlen-app/
├── backend/                    # Django Backend
│   ├── core/                   # Django project settings
│   │   ├── settings.py         # Configuration
│   │   ├── telemetry.py        # OpenTelemetry setup
│   │   └── urls.py             # Root URL routing
│   ├── chat/                   # Chat application
│   │   ├── models.py           # ChatMessage model
│   │   ├── views.py            # API views
│   │   ├── services.py         # OpenRouter service
│   │   ├── serializers.py      # DRF serializers
│   │   ├── exceptions.py       # Custom exceptions
│   │   └── tests.py            # Unit tests
│   ├── requirements.txt        # Python dependencies
│   └── .env.example            # Environment template
├── frontend/                   # React Frontend
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── ChatInterface.jsx
│   │   │   ├── MessageBubble.jsx
│   │   │   ├── ModelSelector.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── services/
│   │   │   └── api.js          # Axios API client
│   │   ├── App.jsx             # Root component
│   │   └── index.css           # Tailwind imports
│   ├── vite.config.js          # Vite configuration + API proxy
│   └── package.json            # Node dependencies
├── docker-compose.yml          # Jaeger infrastructure
└── README.md                   # This file
```

---

## Troubleshooting

### "Model ID not found" or "No endpoints found"

**Cause**: The selected model may be temporarily unavailable on OpenRouter.

**Solution**: 
- Switch to a different model (Llama 3.3 70B and Mistral 7B are most stable)
- Check OpenRouter status: https://status.openrouter.ai

### "ECONNREFUSED 127.0.0.1:8000"

**Cause**: Backend server is not running.

**Solution**:
```bash
cd backend
source venv/bin/activate
python manage.py runserver 8000
```

### "Invalid API Key"

**Cause**: OpenRouter API key is missing or invalid.

**Solution**:
1. Get a key from https://openrouter.ai/keys
2. Add to `backend/.env`: `OPENROUTER_API_KEY=sk-or-v1-xxxxx`
3. Restart the backend server

### Traces not appearing in Jaeger

**Cause**: Jaeger container not running or wrong endpoint.

**Solution**:
```bash
# Check if Jaeger is running
docker ps | grep jaeger

# Restart if needed
docker compose down
docker compose up -d
```

### Port already in use

**Cause**: Another process is using port 5173 or 8000.

**Solution**:
```bash
# Find and kill the process (macOS/Linux)
lsof -i :5173
kill -9 <PID>

# Or use different ports
# Backend:
python manage.py runserver 8001

# Frontend (edit vite.config.js):
server: { port: 5174 }
```

---

## Running Tests

```bash
cd backend
source venv/bin/activate
python manage.py test chat --verbosity=2
```

Expected output: `Ran 13 tests in 0.0XXs - OK`

---

## License

This project was created as part of a technical assessment.

---

**Built with ❤️ using Django, React, and OpenTelemetry**
