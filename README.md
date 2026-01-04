# ForecastForge

**AI-powered ROI forecasting for SaaS feature ideas**

ForecastForge helps product teams make data-driven decisions about which features to build next by combining deterministic scoring with AI-powered analysis to predict return on investment before development begins.

---

## Features

### Core Functionality

- **Multi-tenant Organization System**: Automatic organization creation on first login with owner and member roles
- **Feature Idea Management**: Comprehensive feature tracking with type classification, effort estimation, constraints, pricing context, and baseline metrics
- **Evidence Collection**: Attach supporting data from tickets, sales calls, emails, analytics, and other sources
- **Deterministic Base Scoring**: Transparent scoring engine with five subscores (0-20 each):
  - **Value Potential**: Based on feature type, pricing context, baseline metrics, and success metric
  - **Reach**: Determined by target user breadth
  - **Evidence Strength**: Calculated from evidence count and analytics presence
  - **Effort Inverse**: Lower effort yields higher scores
  - **Risk Penalty**: Based on constraint keywords and missing baseline data
- **AI-Powered Forecasts**: Structured JSON output with:
  - ROI Score (0-100) with confidence level
  - Impact ranges (low/mid/high) tied to success metrics
  - Ranked assumptions with probabilities and validation strategies
  - Ranked risks with severity, likelihood, and mitigation plans
  - Cheaper alternatives with honest tradeoffs
  - Validation experiments ordered by cost and time
  - Executive decision memo in markdown
- **Forecast History**: Track and compare multiple forecasts for each feature
- **Row Level Security**: Application-level RLS policies ensure users only access their organization's data
- **Comprehensive Validation**: Zod schemas for all entities and AI outputs

### Technical Highlights

- **Retry Logic**: 2 automatic retries on AI generation failures
- **JSON Repair**: Fallback mechanism to extract and repair malformed AI responses
- **Timeout Handling**: 60-second timeout with graceful error handling
- **Raw Output Storage**: Always stores raw AI responses for debugging
- **Strict JSON Mode**: OpenAI structured output prevents hallucinated text outside schema

---

## Tech Stack

- **Frontend**: React 19 + TypeScript + Tailwind CSS 4
- **Backend**: Express 4 + tRPC 11
- **Database**: MySQL/TiDB via Drizzle ORM
- **Authentication**: Manus OAuth (email/password)
- **AI**: OpenAI API with strict JSON schema mode
- **Forms**: React Hook Form + Zod validation
- **UI Components**: shadcn/ui + Radix UI primitives

---

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm 10+
- MySQL/TiDB database (provided by Manus platform)

### Installation

1. Clone the repository and install dependencies:

```bash
pnpm install
```

2. Environment variables are automatically injected by the Manus platform:
   - `DATABASE_URL`: MySQL connection string
   - `JWT_SECRET`: Session signing secret
   - `VITE_APP_ID`: OAuth application ID
   - `OAUTH_SERVER_URL`: OAuth backend URL
   - `VITE_OAUTH_PORTAL_URL`: OAuth frontend URL
   - `BUILT_IN_FORGE_API_URL`: Manus AI API endpoint
   - `BUILT_IN_FORGE_API_KEY`: AI API authentication token

3. Push database schema:

```bash
pnpm db:push
```

4. Start development server:

```bash
pnpm dev
```

The application will be available at the provided development URL.

### Running Tests

```bash
pnpm test
```

Tests include comprehensive coverage of the deterministic scoring engine with 7 test cases covering:
- High-value feature scoring
- Effort and evidence penalties
- Risk constraint handling
- Baseline metrics rewards
- Reach differentiation
- Analytics keyword boosting
- Score clamping (0-100)

---

## Application Structure

### Key Files

```
server/
  scoring.ts          → Deterministic base scoring engine
  forecast.ts         → AI forecast generation with retry logic
  db.ts               → Database query helpers with RLS checks
  routers.ts          → tRPC procedures with authorization
  scoring.test.ts     → Unit tests for scoring engine

drizzle/
  schema.ts           → Database tables and types
  rls-policies.sql    → RLS policy documentation

shared/
  validation.ts       → Zod schemas for all entities

client/src/
  pages/
    Home.tsx          → Landing page
    Dashboard.tsx     → Feature list
    FeatureNew.tsx    → Feature creation form
    FeatureDetail.tsx → Feature detail with tabs (overview, evidence, forecasts)
    Settings.tsx      → Settings placeholder
```

### Database Schema

**Organizations**: Multi-tenant container with owner relationship

**Org Members**: Junction table with role enum (owner/member)

**Features**: Comprehensive feature tracking with:
- Basic info (title, type, problem, target users)
- Effort estimation (days)
- Success metric (locked to "Monthly MRR Delta")
- Optional constraints, pricing context, baseline metrics

**Evidence Items**: Supporting data with source type, content, and optional link

**Forecasts**: AI-generated predictions with:
- ROI score and confidence level
- Impact ranges (low/mid/high) as JSON
- Assumptions, risks, alternatives, validation plan as JSON arrays
- Decision memo as markdown text
- Raw model output for debugging

---

## How It Works

### Deterministic Scoring

The base score is calculated transparently using simple rules:

1. **Value Potential (0-20)**:
   - Feature type weight (monetization: 8, retention: 7, etc.)
   - +4 for pricing context present
   - +1-4 for baseline metrics (1 point per metric)
   - +4 for default success metric

2. **Reach (0-20)**:
   - 18 for broad keywords ("all users", "everyone")
   - 8 for niche keywords ("specific", "limited")
   - 13 for medium reach (default)

3. **Evidence Strength (0-20)**:
   - 0-12 based on evidence count (0: 0pts, 1: 4pts, 2: 7pts, 3: 10pts, 4+: 12pts)
   - +8 for analytics presence (source type or keywords)

4. **Effort Inverse (0-20)**:
   - ≤3 days: 20pts
   - 4-7 days: 15pts
   - 8-14 days: 9pts
   - 15-30 days: 4pts
   - 30+ days: 0pts

5. **Risk Penalty (0-20)**:
   - +3 per high-risk keyword (security, compliance, migration, payment, etc.)
   - +5 for no baseline metrics
   - +3 for <2 baseline metrics

**Final Score**: `clamp(value + reach + evidence + effort - risk, 0, 100)`

### AI Forecast Generation

1. Assemble context (feature details, evidence, base score, org name)
2. Call OpenAI API with strict JSON schema mode
3. Validate response with Zod
4. On failure: retry up to 2 times with exponential backoff
5. On validation error: attempt JSON repair once
6. Store raw output regardless of success/failure
7. Return structured forecast or error

The AI is instructed to:
- Keep ROI score within ±15 of base score (explain if deviating)
- Rank assumptions by importance with realistic probabilities
- Rank risks by severity × likelihood
- Provide 2-4 cheaper alternatives with honest tradeoffs
- Order validation experiments by cost/time
- Suggest missing information that would increase confidence

---

## Row Level Security (RLS)

Since MySQL/TiDB doesn't support native RLS like PostgreSQL, security is enforced at the application level in tRPC procedures:

### Access Rules

- **Organizations**: Users can only access organizations they're members of
- **Features**: Users can only CRUD features in their organizations
- **Evidence**: Users can only manage evidence for features in their organizations
- **Forecasts**: Users can only view/generate forecasts for features in their organizations

### Implementation

All procedures verify access using helper functions:
- `isUserInOrg(userId, orgId)`: Check membership
- `isUserOrgOwner(userId, orgId)`: Check owner status

Unauthorized access throws `FORBIDDEN` error.

---

## Authentication Flow

1. User clicks "Sign In" → redirected to Manus OAuth portal
2. OAuth callback creates/updates user record
3. Session cookie set with JWT
4. On first login: organization auto-created with user as owner
5. Frontend reads auth state via `trpc.auth.me.useQuery()`
6. Protected pages redirect to login if unauthenticated

---

## API Usage

### Organizations

```typescript
// Get or create organization (auto-creates on first call)
const { orgId } = await trpc.organizations.getOrCreate.mutate();

// List user's organizations
const orgs = await trpc.organizations.list.query();
```

### Features

```typescript
// Create feature
const { featureId } = await trpc.features.create.mutate({
  orgId: 1,
  title: "Advanced Analytics",
  type: "monetization",
  problem: "Users need better insights",
  targetUsers: "All paying customers",
  effortDays: 14,
  // ... optional fields
});

// List features
const features = await trpc.features.list.query({ orgId: 1 });

// Get feature detail
const feature = await trpc.features.getById.query({ featureId: 1 });
```

### Evidence

```typescript
// Add evidence
const { evidenceId } = await trpc.evidence.create.mutate({
  featureId: 1,
  sourceType: "analytics",
  content: "Conversion data shows 30% increase potential",
  link: "https://analytics.example.com/report",
});

// List evidence
const evidence = await trpc.evidence.list.query({ featureId: 1 });
```

### Forecasts

```typescript
// Generate forecast (may take 10-60 seconds)
const { forecastId } = await trpc.forecasts.generate.mutate({ featureId: 1 });

// List forecasts
const forecasts = await trpc.forecasts.list.query({ featureId: 1 });

// Get forecast detail
const forecast = await trpc.forecasts.getById.query({ forecastId: 1 });
```

---

## Deployment

This application is designed to run on the Manus platform:

1. Create a checkpoint:
   - All changes are automatically tracked
   - Checkpoints enable rollback and version history

2. Click "Publish" in the Manus UI:
   - Application is deployed to production
   - Custom domain support available
   - SSL/TLS automatically configured

3. Monitor via Dashboard:
   - View analytics (UV/PV)
   - Manage database via CRUD UI
   - Configure environment variables

---

## Development Tips

### Adding New Features

1. Update `drizzle/schema.ts` with new tables
2. Run `pnpm db:push` to apply migrations
3. Add query helpers to `server/db.ts`
4. Create tRPC procedures in `server/routers.ts` with RLS checks
5. Add Zod validation schemas to `shared/validation.ts`
6. Build UI components in `client/src/pages/`
7. Write tests for business logic
8. Update `todo.md` to track progress

### Debugging AI Forecasts

- Check `rawModelOutput` field in forecasts table
- Review retry attempts in server logs
- Validate JSON schema matches OpenAI response format
- Test with different feature types and evidence combinations

### Testing Scoring Engine

Run `pnpm test` to verify scoring logic. Add new test cases to `server/scoring.test.ts` when modifying scoring rules.

---

## Limitations & Future Work

### Current Limitations

- Success metric locked to "Monthly MRR Delta" (other metrics hidden for MVP)
- No team invite system (manual database updates required for multi-user orgs)
- No billing integration (placeholder settings page)
- Application-level RLS (not database-native)

### Potential Enhancements

- Advanced success metrics (CAC, LTV, activation rate, etc.)
- Team management UI with invite system
- Billing and subscription tiers
- Forecast comparison view (side-by-side)
- Export forecasts to PDF/CSV
- Slack/email notifications for forecast completion
- Historical trend analysis across forecasts
- Integration with project management tools (Jira, Linear, etc.)

---

## License

MIT

---

## Support

For questions or issues, please contact the development team or submit feedback through the Manus platform.
