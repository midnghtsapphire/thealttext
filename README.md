# TheAltText

**AI-Powered Alt Text Generator for ADA/WCAG Compliance**

A [GlowStarLabs](https://glowstarlabs.com) product by [Audrey Evans](https://meetaudreyevans.com)

---

## What is TheAltText?

TheAltText is a production-ready, full-stack application that automatically generates descriptive, accessible alt text for images using AI vision models. It helps businesses, developers, and content creators meet ADA, Section 508, and WCAG 2.1 AAA compliance standards.

### Key Features

| Feature | Description |
|---|---|
| **AI Alt Text Generation** | Generate descriptive alt text using OpenRouter vision models with free-first model stacking |
| **Bulk Processing** | Upload up to 100 images at once for batch processing |
| **Website Scanner** | Crawl entire websites to audit image accessibility compliance |
| **Multi-Language** | 14+ languages including English, Spanish, French, Japanese, Hawaiian, and more |
| **Tone Customization** | Formal, casual, technical, or simple (6th-grade reading level) |
| **Developer API** | RESTful API with key-based authentication for integration |
| **Compliance Reports** | Export detailed reports in JSON, CSV, or PDF format |
| **Carbon Tracking** | Monitor the environmental impact of AI usage |
| **Stripe Billing** | Free tier (50 images/month) and Pro tier (unlimited) |
| **WCAG AAA UI** | The app itself is fully WCAG AAA compliant — we practice what we preach |

---

## Target Market

TheAltText serves an underserved blue ocean market:

- **Small businesses** that need ADA compliance but cannot afford consultants
- **Web developers** who need to add alt text to thousands of images
- **Content creators and bloggers** managing image-heavy sites
- **Government and education sites** (legally required to be accessible)
- **E-commerce sites** with large product catalogs

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Tailwind CSS + Vite |
| Backend | FastAPI (Python 3.11) |
| Database | PostgreSQL 16 |
| AI | OpenRouter API (free-first model stack) |
| Billing | Stripe (subscriptions + webhooks) |
| Containerization | Docker Compose |
| CI/CD | GitHub Actions |
| Testing | pytest + TypeScript type checking |

---

## Design Philosophy

TheAltText follows a warm, earthy dark theme with glassmorphism UI — **no blue light**. The design is:

1. **Neurodivergent-friendly** — Clean layout, no sensory overload, clear visual hierarchy
2. **WCAG AAA compliant** — Alt text on every element, keyboard navigable, screen reader compatible
3. **Mobile-first responsive** — Works beautifully on all screen sizes
4. **Carbon-efficient** — Built-in eco tracking for AI usage

Color palette: deep reds, forest greens, warm golds, earthy charcoal.

---

## Quick Start

### Prerequisites

- Docker and Docker Compose
- An [OpenRouter API key](https://openrouter.ai/keys)
- (Optional) A [Stripe account](https://dashboard.stripe.com) for billing

### 1. Clone the Repository

```bash
git clone https://github.com/MIDNGHTSAPPHIRE/thealttext.git
cd thealttext
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your API keys
```

### 3. Start with Docker Compose

```bash
docker-compose up --build -d
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### 4. (Optional) Run Without Docker

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## API Reference

### Authentication

All API endpoints require a JWT token (obtained via `/api/auth/login`) or an API key (for developer endpoints).

### Core Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create a new account |
| `POST` | `/api/auth/login` | Log in and receive JWT |
| `POST` | `/api/images/analyze` | Analyze a single image (file upload) |
| `POST` | `/api/images/analyze-url` | Analyze an image by URL |
| `POST` | `/api/images/bulk-upload` | Bulk process up to 100 images |
| `POST` | `/api/scanner/scan` | Scan a website for compliance |
| `GET` | `/api/reports/` | List compliance reports |
| `GET` | `/api/reports/{id}/export/{format}` | Export report (json/csv) |
| `POST` | `/api/developer/keys` | Create an API key |
| `POST` | `/api/developer/v1/alt-text` | Developer API: generate alt text |

### Developer API Example

```bash
curl -X POST https://your-domain.com/api/developer/v1/alt-text \
  -H "X-API-Key: tat_your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "image_url": "https://example.com/photo.jpg",
    "language": "en",
    "tone": "formal",
    "wcag_level": "AAA"
  }'
```

Full interactive API documentation is available at `/docs` (Swagger UI) when the backend is running.

---

## Database Schema

The PostgreSQL database includes the following tables:

| Table | Purpose |
|---|---|
| `users` | User accounts with auth and preferences |
| `images` | Uploaded/analyzed image records |
| `alt_texts` | Generated alt text with metadata |
| `reports` | Compliance scan reports |
| `subscriptions` | Stripe subscription tracking |
| `api_keys` | Developer API key management |
| `scan_jobs` | Website scan job tracking |

---

## Subscription Tiers

| Feature | Free | Pro ($29/mo) |
|---|---|---|
| Images per month | 50 | Unlimited |
| Bulk upload | — | Up to 100/batch |
| Website scan depth | 1 page | 5 levels |
| PDF reports | — | ✓ |
| Developer API | — | ✓ |
| Priority AI models | — | ✓ |
| Priority support | — | ✓ |

---

## AI Model Strategy

TheAltText uses a **free-first model stack** via OpenRouter:

1. **First attempt**: Free/low-cost vision models (e.g., `google/gemini-2.0-flash-exp:free`)
2. **Fallback**: Mid-tier models (e.g., `google/gemini-2.0-flash-001`)
3. **Final fallback**: Premium models (e.g., `openai/gpt-4o-mini`)

This approach minimizes costs while maintaining high-quality output.

---

## Running Tests

```bash
cd backend
pip install pytest pytest-asyncio httpx
python -m pytest tests/ -v
```

---

## Project Structure

```
thealttext/
├── backend/
│   ├── app/
│   │   ├── api/routes/       # FastAPI route handlers
│   │   ├── core/             # Config, database, security
│   │   ├── models/           # SQLAlchemy ORM models
│   │   ├── schemas/          # Pydantic validation schemas
│   │   ├── services/         # AI vision, scanner, billing
│   │   ├── utils/            # Carbon tracking utilities
│   │   └── main.py           # FastAPI application entry
│   ├── alembic/              # Database migrations
│   ├── tests/                # pytest test suite
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── pages/            # Page components
│   │   ├── services/         # API service layer
│   │   ├── styles/           # Global CSS + Tailwind
│   │   ├── types/            # TypeScript type definitions
│   │   ├── App.tsx           # Main app with routing
│   │   └── main.tsx          # Entry point
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── .github/workflows/        # CI/CD pipeline
├── docker-compose.yml        # Full stack orchestration
├── .env.example              # Environment template
└── README.md
```

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

All PRs are reviewed with [CodeRabbit](https://coderabbit.ai/) for automated code review.

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

## Links

- **GlowStarLabs Hub**: [meetaudreyevans.com](https://meetaudreyevans.com)
- **GlowStarLabs**: [glowstarlabs.com](https://glowstarlabs.com)
- **OpenRouter**: [openrouter.ai](https://openrouter.ai)
- **WCAG Guidelines**: [w3.org/WAI/WCAG21](https://www.w3.org/WAI/WCAG21/quickref/)

---

*Built with care for accessibility, sustainability, and the open web.*
*© 2026 Audrey Evans / GlowStarLabs. All rights reserved.*
