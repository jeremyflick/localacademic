# LocalAcademic

LocalAcademic is a query-driven research web app. It accepts any search query, searches recent academic sources live across multiple repositories, extracts supported statements, and formats the results into the required plain-text citation structure.

## What it does

- Accepts arbitrary search queries
- Searches 2024-or-newer academic sources first
- Falls back to 2020-or-newer sources if there is not enough recent evidence
- Prioritizes stronger dataset and study-design signals before building entries
- Builds 3 to 7 supported items from retrieved source abstracts when enough relevant evidence is available; sample sizes and article counts are allowed
- Uses relevant summary-only entries only after statistic-backed entries when a source has no exact numeric finding in the abstract
- Uses a query-focused relevant summary instead of a generic rationale
- Produces output in this order for each entry:
  1. Brief rationale
  2. Statistics with source title, publication date, and inline URL
  3. Suggested wording

## Current live source mode

The app currently uses OpenAlex, Crossref, Europe PMC, and CORE for live academic-source discovery. CORE is accessed through the local backend when `CORE_API_KEY` is configured, so the API key does not live in browser-side JavaScript. That makes the tool more query-driven and broad, but it also means:

- it is strongest for academic and research-heavy queries
- it currently extracts exact numeric findings from source abstracts
- if no exact numeric finding is present for a relevant source, it can fall back to a concise paper summary
- it does not yet include a separate backend for broader web-article or industry-report crawling

## Run locally

Optionally export your CORE API key first:

```bash
export CORE_API_KEY="your-core-api-key-here"
```

Start the local app server:

```bash
python3 server.py
```

Then visit [http://127.0.0.1:8000](http://127.0.0.1:8000).

If `CORE_API_KEY` is not configured, the app will still work with OpenAlex, Crossref, and Europe PMC, and the UI will show a small note that CORE is unavailable on that server.

## Files

- `index.html`: app structure
- `styles.css`: visual design and responsive layout
- `app.js`: live query workflow, source fetching, extraction, and output formatting
- `server.py`: local backend for static serving and CORE API proxying
- `.env.example`: example environment variable setup for CORE

## Next upgrade path

If you want broader non-academic source coverage, the next step is adding a small backend that can:

- search reputable web sources
- fetch article text server-side
- extract direct quotes and precise statistics
- merge those with the current academic-source flow
