# Deployment Guide

This guide covers production deployment for TheAltText.

## 1) Ship-to-Market Prerequisites

- Required docs present: `README.md`, `CHANGELOG.md`, `DEPLOYMENT_GUIDE.md`, `GO_TO_MARKET.md`, `BRAND_GUIDELINES.md`, `SECURITY.md`
- CI automation enabled: `.github/workflows/ci.yml`
- Environment template present: `.env.example`

## 2) Validate Before Deploy

From the repository root:

```bash
python validate.py
```

This checks revvel-standards files, automation wiring, backend/frontend directories, and confirms there are no git submodules.

## 3) Configure Environment

```bash
cp .env.example .env
```

Set secure production values for:
- `POSTGRES_PASSWORD`
- `SECRET_KEY`
- `OPENROUTER_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRO_PRICE_ID`

## 4) Deploy with Docker Compose

```bash
docker-compose up --build -d
```

Services:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- API docs: `http://localhost:8000/docs`

## 5) Post-Deploy Checks

- `GET /health` returns healthy status
- Test image analysis via `/api/images/analyze-url`
- Confirm billing endpoint access (`/api/billing/subscription`) with authenticated user

## 6) Project Scope Check (Sub-Repository Review)

The current repository has **no git submodules**. The `extension/` directory is part of this product (browser-extension companion), not a separate linked repository.
