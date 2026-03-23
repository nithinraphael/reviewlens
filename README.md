# ReviewLens

## How It Works

```
INGEST  User → URL → Scraper (Firecrawl) → Embed → Store → Generate Brief
                                                   └── Zustand with persistence

QUERY   User → Query → Guardrail → Embed → VectorSearch → TopK + Query → Gemini → Response
```

---

## Features

### Design
Obsession-worthy UI.
<img width="2048" height="1280" alt="image" src="https://github.com/user-attachments/assets/c32a4887-73fc-4121-bf65-9e0c5d960ebe" />


### Executive Summary & Sentiment Chart
- Summary with insights
- Bar chart showing rating distribution (1–5 stars)
- Four switchable tab filters: All Ratings, Positive Only, Customer Service mentions, Risk flag language
- Insight line below the chart updates per tab

<img width="2048" height="1280" alt="image" src="https://github.com/user-attachments/assets/46223b80-9858-4d43-8f8e-ec85268b6ab2" />


### Theme Table & Risk Summary

**Theme Table**
- Combined view of praise themes and pain points
- Each row tagged Positive (green) or Watch (amber)
- Shows up to 6 themes (3 praise + 3 pain)

**Risk Summary**
- Average rating in large type
- Count of reviews in the strongest visible segment
- Urgent flag list — or "No urgent flags detected" if clean

<img width="2048" height="1280" alt="image" src="https://github.com/user-attachments/assets/18b8fd80-3dcf-45d5-8849-e4494af4ab47" />


### Chat
- Ask natural-language questions about the review dataset
- Query sent through guardrails before reaching the model
- Retrieves the top K most relevant reviews per question via cosine similarity — not brute-force full context
- Streamed output in real time
<img width="2048" height="1280" alt="image" src="https://github.com/user-attachments/assets/0f7aad2f-9d1f-4cbc-9fe2-0dfcf82c8257" />

### PDF Export
Export the full brief and chat transcript as a structured A4 PDF — one click, no server needed.

<img width="2048" height="1737" alt="image" src="https://github.com/user-attachments/assets/e7208ddb-9a26-4567-8397-5e810a83ac14" />


### Persistence
- Everything persists to `localStorage` under `review-analysis-store`
- Persisted: `url`, `reviews` (including embeddings), `brief`, `chatMessages`, `mode`
- On refresh: full data and chat history restored instantly — no re-fetch

---

## Decisions
- Pure client-side state — a backend DB would have slowed dev speed for a prototype
- Treated as an MVP, no security hardening
- Speed over perfection

---

## Enhancements
- Replace localStorage with Postgres + pgvector
- Durable cron jobs via DBOS
- More analytics and summaries
- More testing
- Tool-use pipeline — LLM generates SQL, executes against review data, passes results back as context

---

## RAG System Enhancement 

<img width="872" height="1182" alt="image" src="https://github.com/user-attachments/assets/ac298314-8698-43ee-8e35-86aa471ff07b" />

## Setup

```bash
bun install
cp .env.example .env
bun dev
```

Open http://localhost:3000
