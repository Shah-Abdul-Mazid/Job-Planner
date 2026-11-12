# CareerTrack BD — AI-Powered Bangladesh Recruitment Intelligence Platform

**CareerTrack BD** is an enterprise career and recruitment management platform designed specifically for Bangladesh job seekers, government recruitment candidates (Bangladesh Bank, BPSC, Combined Banks/BSCS, Ministries), and IT professionals.

---

## Architecture Overview (Phase 1)

```
Job Planner/
├── Backend/                    # FastAPI REST API & SQLAlchemy 2.0 ORM
│   ├── app/
│   │   ├── core/               # Configuration, security, database engine
│   │   ├── models/             # SQLAlchemy recruitment domain models
│   │   ├── schemas/            # Pydantic v2 schemas for validation & serialization
│   │   ├── modules/
│   │   │   └── applications/   # Repository & Service pattern for application CRUD
│   │   ├── api/v1/endpoints/   # REST endpoints (/applications, /stats, etc.)
│   │   ├── seed_data.py        # Bangladesh recruitment initial seed records
│   │   └── main.py             # FastAPI entry point & CORS configuration
│   ├── migrations/             # Alembic migration versions
│   ├── tests/                  # Pytest test suite for application CRUD
│   ├── requirements.txt
│   └── Dockerfile
│
├── Frontend/                   # React 18+ + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/         # Reusable UI (StatCards, StatusBadge, Modal, Forms)
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx   # SaaS KPIs, pipeline chart, recent activities
│   │   │   ├── Applications.tsx# Full CRUD, search, filter, pagination table
│   │   │   └── PhasePreviews.tsx # Calendar, Documents, AI Assistant preview tabs
│   │   ├── services/api.ts     # Type-safe API client connecting to FastAPI
│   │   ├── types/index.ts      # TypeScript models
│   │   ├── App.tsx             # Collapsible sidebar, header, global modals
│   │   └── index.css           # Tailwind design tokens
│   ├── package.json
│   ├── vite.config.ts
│   └── Dockerfile
│
├── packages/
│   └── bdjobtracker/           # Standalone Python recruitment toolkit (ready for PyPI)
│
├── docker-compose.yml          # Containerized deployment (PostgreSQL, Backend, Frontend)
├── .env.example
└── README.md
```

---

## Initial Bangladesh Recruitment Records Seeded

The platform comes pre-seeded with 4 real recruitment records:
1. **Bangladesh Bank — Senior Officer** (Job ID: `26101`, Roll: `116683`, Status: `Admit Card Available`, Exam schedule awaiting confirmation notice)
2. **Sonali Bank PLC — Assistant Database Administrator, Grade 9** (Job ID: `26109`, Tracking ID: `2052062-838456`, Roll: `338528`, Status: `Submitted`)
3. **Combined 10 Banks / BSCS — Officer (IT) / MIS & ICT Officer, Grade 10** (Job ID: `26105`, Tracking ID: `2052062-932886`, Status: `Submitted`, 7-bank preference choices)
4. **Combined 8 Banks / BSCS — Senior Officer (IT), Grade 9** (Job ID: `26104`, Tracking ID: `2052062-394651`, Status: `Submitted`, 4-bank preference choices)

---

## How to Run Locally

### 1. Backend (FastAPI)

```bash
cd Backend
# Activate virtual environment
.\venv\Scripts\Activate.ps1    # On Windows PowerShell
# source venv/bin/activate      # On Linux/macOS

# Run database migrations
alembic upgrade head

# Start FastAPI server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

- API Base URL: `http://127.0.0.1:8000`
- Interactive OpenAPI Docs: `http://127.0.0.1:8000/docs`
- Alternative ReDoc: `http://127.0.0.1:8000/redoc`

### 2. Frontend (React + Vite)

In a separate terminal:

```bash
cd Frontend
npm install
npm run dev
```

- Frontend App: `http://localhost:5173`

### 3. Running Backend Tests

```bash
cd Backend
.\venv\Scripts\python -m pytest tests/test_applications.py -v
```

### 4. Running with Docker Compose

```bash
docker-compose up --build
```
