# AthletiCap — Recruitment Finance Intelligence

A personal finance and recruitment analytics platform for student-athletes and families. Track recruitment spending, analyze offer costs, and monitor brand growth with data-driven insights.

## Quick Start

### Prerequisites
- Node.js 20+
- pnpm (`npm install -g pnpm`)

### Installation

```bash
# Clone and install dependencies
cd athleticap
pnpm install

# Set up environment variables
cp .env.example .env

# Initialize database
pnpm db:push

# Seed demo data
pnpm db:seed
```

### Run Development Servers

In separate terminal windows:

```bash
# Terminal 1: Frontend (Vite)
cd apps/web
pnpm dev
# Opens at http://localhost:5173

# Terminal 2: Backend (Express)
cd apps/api
pnpm dev
# Runs at http://localhost:3000
```

Then open [http://localhost:5173](http://localhost:5173) and use demo login:
- **Demo Account**: Rodriguez Family
- **Email**: athlete@rodriguez.family
- **Password**: (any)

## Project Structure

```
athleticap/
├── apps/
│   ├── web/                    # React frontend (Vite)
│   │   ├── src/pages/         # Page components
│   │   ├── src/components/    # Reusable components
│   │   └── src/lib/           # Utilities and API client
│   │
│   └── api/                    # Express backend
│       ├── src/routes/        # API endpoints
│       ├── src/services/      # Business logic
│       └── src/middleware/    # Auth & eligibility checks
│
├── packages/
│   └── db/                     # Prisma ORM & schema
│       ├── prisma/schema.prisma
│       └── seed.ts            # Demo data seeding
│
└── README.md
```

## Core Features

### 1. Recruitment CapEx Tracker (`/tracker`)
- Log recruitment expenses (camps, travel, fees, etc.)
- Track coach contacts by division tier
- Calculate blended and quality-weighted Cost-per-Contact (CAC)
- Link expenses to coach contacts for attribution

**Key Metrics:**
- **Blended CAC**: Total spend ÷ total contacts
- **Quality-Weighted CAC**: Adjusts for division tier (Power 4 = 4.0, D3 = 1.0, etc.)

### 2. Financial Arbitrage Matrix (`/offers`)
- Compare college offers side-by-side
- 4-year net cost projections with sensitivity analysis
- Merit aid estimation from College Scorecard data
- Walk-on scenario builder

**Features:**
- Inflation rate slider (1%–6%)
- Family contribution input
- Verbal vs. written offer flags
- Visual allocation bar (athletic aid / merit / out-of-pocket)

### 3. Brand Analytics Dashboard (`/influence`)
- Social media metrics (followers, engagement rate, growth)
- Brand Readiness Score (0–100)
- Tier progression (Nano → Micro → Mid-Tier → Macro)
- State-based NIL eligibility display

**Compliance:**
- No dollar FMV estimates shown to minors
- State eligibility locked/unlocked messaging
- COPPA-compliant age gating

### 4. Home Dashboard (`/`)
- Recruitment spending gauge vs. budget goal
- Coach contact count and top division tier
- Lowest net-cost offer summary
- Brand readiness snapshot
- Quick action buttons to main features

## API Endpoints

### Expenses
- `GET /api/expenses` — List with pagination
- `POST /api/expenses` — Create new expense
- `GET /api/expenses/summary` — Totals + CAC calculation

### Coach Contacts
- `GET /api/contacts` — List all contacts
- `POST /api/contacts` — Create new contact
- `GET /api/contacts/cac` — Quality-weighted CAC report

### College Offers
- `GET /api/offers` — List offers
- `POST /api/offers` — Create offer
- `GET /api/offers/:id/projection` — 4-year projection
- `GET /api/offers/compare` — Side-by-side comparison

### Brand Analytics
- `GET /api/influence/brand-readiness` — Readiness score + checklist
- `GET /api/influence/eligibility` — State + age + consent status
- `POST /api/influence/social-profiles` — Connect platform

### Dashboard
- `GET /api/dashboard` — Full dashboard summary

## Database Schema

Key models:
- **User** — Clerk-integrated auth
- **Athlete** — Athlete profile + sport, GPA, scores
- **Expense** — CapEx ledger
- **CoachContact** — Coach replies, division tier, contact type
- **ExpenseContactLink** — Many-to-many expense ↔ contact
- **CollegeOffer** — Offers with scholarship %, COA, merit aid
- **SocialProfile** — Connected Instagram/TikTok/Twitter
- **BrandReadinessScore** — Calculated score + checklist
- **Milestone** — Achievement badges (first expense, first offer, etc.)
- **StreakLog** — Weekly activity streak tracking

## Tech Stack

**Frontend:**
- React 18 + Vite
- React Router v6
- TanStack Query (data fetching)
- React Hook Form (forms)
- Recharts (charts)
- Tailwind CSS (styling)
- Playfair Display / Syne / Fira Code (typography)

**Backend:**
- Express.js
- TypeScript (strict mode)
- Prisma ORM
- Clerk (auth)
- SQLite (dev) / PostgreSQL (production)

**Design System:**
- Dark theme: `#08090E` to `#1A1F2E`
- Gold accent: `#F0A500` (primary)
- Teal accent: `#0FB8A8` (social)
- Financial-grade color palette

## Features in Hackathon Demo

✅ **Core Tracker**
- Manual expense entry
- Coach contact log
- Quality-weighted CAC calculation
- Offline draft queue support

✅ **Arbitrage Matrix**
- School search from seeded IPEDS data
- Merit aid range estimation
- 4-year net cost projection
- Side-by-side comparison
- Sensitivity sliders

✅ **Brand Analytics**
- Mock Instagram metrics display
- Brand Readiness Score gauge
- Growth trend chart
- State eligibility messaging

✅ **Dashboard**
- Metric cards (spend, contacts, offers, brand score)
- Quick action buttons
- Recent offers preview
- Activity feed

✅ **Design**
- Dark fintech aesthetic
- Playfair Display numerals
- Fira Code data values
- Mobile-responsive layout

## Post-Hackathon Roadmap

- [ ] Live College Scorecard API
- [ ] Real Instagram Graph API (Creator accounts)
- [ ] TikTok via Phyllo API
- [ ] Weekly recap email (Resend)
- [ ] PDF export (@react-pdf/renderer)
- [ ] Multi-athlete household view
- [ ] Mobile app (React Native)
- [ ] Milestone unlock animations
- [ ] Browser push notifications
- [ ] COPPA parental consent flow (Clerk)
- [ ] NIL state rule change monitoring

## Q&A / Judging Notes

**Why remove dollar FMV estimates?**
- Instagram Basic Display API discontinued Dec 4, 2024
- Personal accounts no longer auto-sync
- Showing unverified estimates to minors creates COPPA/NCAA risk
- Brand Readiness Score provides actionable growth guidance instead

**How is this different from a spreadsheet?**
- Automatic COA lookup from 6,000+ schools
- Quality-weighted CAC adjusts for division tier
- Real-time sensitivity analysis across all offers
- Expense attribution network becomes a prediction engine over time

**What's the moat?**
- Expense-to-contact dataset (which showcases produce replies at each tier)
- Benchmarking layer that individual spreadsheets can't replicate
- After 10,000 athletes × multiple years, patterns become proprietary

## Deployment

**Frontend (Vercel):**
```bash
cd apps/web
pnpm build
vercel deploy
```

**Backend (Railway / Heroku / Render):**
```bash
cd apps/api
pnpm build
# Set DATABASE_URL to production PostgreSQL
npm start
```

## Support

For questions or issues:
- 📖 See [Product Specification v2.0](SPEC.md) for full details
- 🐛 Report bugs in GitHub Issues
- 💬 Discuss features in Discussions

---

**Built for the Hackathon** • **AthletiCap v1.0** • **May 2026**
