# Nuvodo Property Ledger

Production-grade web application for the Firestore-backed Nuvodo property portfolio.

## Tech Stack

- **Frontend:** Next.js (App Router), TypeScript, React, Tailwind CSS, shadcn/ui
- **Authentication:** Google SSO via Firebase Auth
- **Database:** Firestore (Google Cloud Project: `nuvodo`)
- **Deployment:** Netlify

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and fill in your Firebase credentials
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Features

- **Portfolio Dashboard:** Browse and select properties from your portfolio.
- **Ledger Browser:** Filter and manage transactions with a user-friendly GUI.
- **Source Review:** Review and import document candidates from OCR/extractions.
- **Financial Reporting:** Generate P&L, Tax, and Cashflow summaries.
- **Export:** Export data to CSV or JSON for accountants.

## Security

- Role-based access control (RBAC).
- Firestore Security Rules enforced.
- Server-side validation with Zod.
- Sensitive operations run in Next.js Server Actions/Routes.

## Deployment

Deploy to Netlify using the Netlify CLI:

```bash
netlify login
netlify link
netlify deploy --build --prod
```
