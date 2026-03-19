# 空き家トラッカー — Japan Akiya Property Tracker

A niche web application for tracking abandoned houses (空き家) and depopulated villages (限界集落) across Japan's rural prefectures.

## Features

- **15+ realistic akiya listings** across Shimane, Kochi, Akita, Nagano, Tokushima, Niigata, Tottori, Yamaguchi, and Gifu
- **Full CRUD API** with filtering by prefecture, status, price, condition, type
- **Dashboard** with stats, prefecture breakdown, property type/condition charts
- **Filterable property grid** with Japanese status badges, condition indicators, depopulation severity bars
- **Prefecture map** (SVG grid-based, no external APIs needed)
- **Watch list** (localStorage-based favorites)
- **Investment calculator** — enter renovation budget → estimated net cost after subsidies
- **Add property form** with Japanese prefecture selector and tag system
- **Cultural accuracy** — real place names, Japanese UI labels, akiya bank links, municipal subsidy data

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.11+, FastAPI, SQLModel, SQLite |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Database | SQLite (file: `backend/akiya.db`) |

## Quick Start

### Option A — All-in-one script

```bash
./start.sh
```

### Option B — Manual

**Backend:**
```bash
cd backend
pip install -r requirements.txt
python seed.py          # Seeds 15+ akiya properties into SQLite
uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev             # Runs on http://localhost:5173
```

**Access:**
- App: http://localhost:5173
- API: http://localhost:8000
- API Docs (Swagger): http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/properties` | List with filters |
| GET | `/api/properties/{id}` | Get single property |
| POST | `/api/properties` | Create new listing |
| PUT | `/api/properties/{id}` | Update listing |
| DELETE | `/api/properties/{id}` | Delete listing |
| GET | `/api/stats` | Dashboard statistics |
| GET | `/api/prefectures` | Prefecture counts |

### Filter Parameters

```
GET /api/properties?prefecture=島根県&status=available&free_only=true&has_subsidy=true
GET /api/properties?max_price=2000000&property_type=kominka&sort_by=price_jpy&sort_order=asc
```

## Property Types

| Code | Japanese | English |
|------|----------|---------|
| `akiya` | 空き家 | Abandoned house |
| `kominka` | 古民家 | Traditional old house |
| `noka` | 農家 | Farmhouse |
| `vacant_land` | 空き地 | Vacant land |

## Status Codes

| Code | Badge | Meaning |
|------|-------|---------|
| `available` | 空き (green) | Available for purchase/inquiry |
| `negotiating` | 交渉中 (yellow) | Under negotiation |
| `reserved` | 予約済 (blue) | Reserved |
| `sold` | 成約済 (gray) | Sold / completed |

## Seed Data Highlights

- **茅葺き屋根の古民家 in Shimane** — ¥500,000 thatched-roof kominka, 100+ years old, ¥1.5M subsidy
- **Free akiya in Kochi** — Population 89, ¥2M renovation subsidy, 無料
- **Sake Brewery in Tokushima** — ¥4.5M, 320m² former sake brewery near Yoshino River
- **Gassho-zukuri in Gifu** — ¥5M, 1880-built farmhouse near Shirakawa-go
- **Former Ryokan in Yamaguchi** — ¥8M, onsen source rights, river view
- **Iya Valley kominka in Tokushima** — near vine bridge (かずら橋), 72.4% population decline

## Project Structure

```
sandbox/
├── backend/
│   ├── main.py          # FastAPI app, routes, CORS
│   ├── models.py        # SQLModel ORM models + Pydantic schemas
│   ├── database.py      # SQLite engine setup
│   ├── seed.py          # 15+ realistic seed properties
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.tsx              # Root + navigation
│   │   ├── api.ts               # API client + watchlist localStorage
│   │   ├── types.ts             # TypeScript types + enum labels
│   │   └── components/
│   │       ├── Dashboard.tsx    # Stats overview
│   │       ├── PropertyList.tsx # Filterable grid
│   │       ├── PropertyCard.tsx # Property card with badges
│   │       ├── PropertyDetail.tsx # Modal + investment calculator
│   │       ├── AddPropertyForm.tsx # Create listing form
│   │       ├── WatchList.tsx    # Saved properties
│   │       └── MapView.tsx      # SVG prefecture map
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── package.json
├── start.sh             # One-command launch
└── README.md
```

## Cultural Notes

- **限界集落 (genkai shūraku)**: Villages where more than 50% of residents are over 65; at risk of complete abandonment
- **空き家バンク (akiya bank)**: Municipal registry systems for matching abandoned properties with prospective buyers/renovators
- **移住支援 (ijū shien)**: Migration support programs — many rural municipalities offer cash grants of ¥1-3M to attract new residents
- **古民家 (kominka)**: Traditional Japanese houses, often over 50 years old, featuring earthen floors (土間), irori hearths (囲炉裏), and engawa verandas (縁側)
