# Maharashtra Engineering College Fees & Admission 2026–27

Production-ready Next.js 16 website for **Maharashtra Engineering College Admission 2026–27**. Extracts fee structures, document checklists, and admission steps from the provided ZIP `ALL COLLEGES PDF OF FEES & DOCUMENTS LIST.zip` (55 colleges, 105 PDFs) and displays them in a clean, searchable, mobile-first dashboard.

## Features
- 🔍 Search by name / acronym / city (instant client filter)
- 🏷️ Filters: city, fees-available, docs-available
- 💰 Category-wise fee display (Open/OBC/SC/ST/VJNT/EWS/TFWS...) + fallback to extracted table + original PDF
- ✅ Document checklist with checkboxes
- 📄 Source PDF viewer + download + extracted-text accordion
- ➕ **Add / Import College** — admin login protected (`ame2026` / `ame@2026`) — login opens import form; stores in localStorage + export merged JSON
- 📱 Fully responsive (320→1440px), no horizontal scroll, tables → cards on mobile
- ⚡ Static JSON (`data/colleges.json`) — fast, no DB, Vercel-ready
- 🖨️ Print-friendly college pages, SEO metadata, accessibility

## Quick Start (Double-click)

**Windows:** Double-click `RUN_APP.bat` (or `START.bat`) — it installs deps, starts dev server and opens `http://localhost:3000`.

Admin import: Click **Add College** → login `ame2026` / `ame@2026` → form unlocks → upload PDFs → Save.

## Manual Dev

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build check
npm start        # serve build
```

## Project Structure

```
data/colleges.json          # structured data (generated)
data/colleges/<slug>.json   # per-college
public/documents/<slug>/    # copied original PDFs/images per college
src/app/page.tsx            # homepage + hero + stats + search
src/app/colleges/page.tsx   # all colleges (merged with localStorage)
src/app/college/[slug]/     # detail with tabs: overview/fees/docs/admission/pdfs
src/app/add-college/        # admin login gate + import form
src/components/Header.tsx   # includes Add College button
scripts: extract_colleges.py
```

## Data Pipeline

ZIP → `downloads_extract/` → `extract_colleges.py` → `data/colleges.json` + `public/documents/`

```bash
python extract_colleges.py
```

- Classifies PDFs by filename (fees / documents / admission / forms)
- Extracts text via PyMuPDF (handles scanned/image PDFs as "SCANNED_DOCUMENT")
- Parses fee categories, document checklists, admission steps
- Copies PDFs to `public/documents/<slug>/`

To add bulk colleges: drop folders into `downloads_extract/ALL COLLEGES PDF...` and rerun script.

To add single college: use **Add College** UI (requires login) or manually edit `data/colleges.json`.

## Add / Import Credentials

- **ID:** `ame2026`
- **Password:** `ame@2026`

Click **Add College** / **Import** button → login modal appears → on correct credentials, import form opens. Without verification, add is blocked. Auth stored in `localStorage` (`ame_admin_auth_2026`) until logout.

## Deployment to Vercel

1. Push project to GitHub
2. Import repo in Vercel → Framework: **Next.js** → Deploy (no env vars needed)
3. Static files in `public/documents` are served automatically.

Build command: `npm run build`  Output: `.next`

## Disclaimer

Organizes information from provided college documents. Verify fees/dates/documents with college & official CAP authorities before payment. Not an official government site.

