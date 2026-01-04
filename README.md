# ForecastForge

**ForecastForge is an AI-powered SaaS that helps product teams decide which features are worth building — before writing code.**

Instead of relying on intuition or post-launch analytics, ForecastForge combines deterministic scoring with structured AI reasoning to forecast ROI, risks, and validation strategies upfront.

---

## Why This Exists

Most product teams ask:
> “What should we build next?”

Very few ask:
> **“Should we build this at all?”**

ForecastForge answers that question with:
- Transparent scoring
- Evidence-based reasoning
- Explicit assumptions and risks
- Testable validation plans

---

## What It Does

For each feature idea, ForecastForge generates:

- **ROI Score (0–100)** with confidence level  
- **Impact ranges** (Low / Mid / High) tied to real business metrics  
- **Ranked assumptions** with probabilities and validation methods  
- **Ranked risks** with mitigation strategies  
- **Cheaper alternatives** and honest tradeoffs  
- **Validation experiments** ordered by cost and time  
- A **1-page decision memo** suitable for stakeholders  

All outputs are **strictly structured JSON** and validated before storage.

---

## Example Output (Real Forecast)

**Feature:** AI Churn Risk Alerts  
**Effort:** 12 days  
**ARPA:** $120  
**Current churn:** 3.2%  

**Result:**
- ROI Score: **58**
- Confidence: **Medium**
- Mid impact: **$1,440 MRR saved**
- ARR impact: **$17,280**

**Key Risk:**  
High false positives could lead to CSM alert fatigue.

**Validation:**  
Backtest against 6 months of historical data and run a controlled pilot with 5 CSMs.

---

## Why This Is Not “Just a Chatbot”

- Deterministic scoring before AI reasoning  
- Requires structured evidence inputs  
- Produces testable assumptions and experiments  
- Enforces strict JSON schemas  
- Stores forecasts for learning over time  

This is a **decision system**, not a text generator.

---

## Tech Stack (High Level)

- React + TypeScript
- Express + tRPC
- MySQL/TiDB (via Drizzle ORM)
- OpenAI API (structured JSON mode)
- Zod validation
- Manus OAuth

---

## Status

MVP complete and deployed on the Manus platform.

Planned:
- Forecast accuracy tracking
- Historical decision learning
- SaaS integrations (Jira, Linear)


