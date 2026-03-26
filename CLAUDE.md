# CLAUDE.md — SymptomNest

> Read this file at the start of every session before doing anything else.  
> Check `tasks.md` second. Present a plan. Wait for approval before touching any code.

---

## 🪺 Project Overview

**SymptomNest** (formerly Health Family) is a warm, family-first symptom tracker React SPA.  
Families share a join code, track symptoms per member, schedule follow-ups, log checkups, and export reports for doctor visits.

- **Live URL:** https://health-family.vercel.app/
- **Repo:** https://github.com/katzanat/health-family
- **Branch:** `master` — auto-deploys to Vercel on push

**Tech stack:** React 19, Vite 7, Firebase 12 (Auth + Realtime Database), CSS3 with custom properties, ESLint 9.

---

## 📋 Session Protocol (follow every time)

1. **Read `tasks.md`** — understand what's pending and what's done
2. **Prioritize pending tasks** using 🔴 High / 🟡 Medium / 🟢 Low with a one-line reason each
3. **Recommend a starting point** with rationale
4. **Wait for explicit approval** before touching any code
5. **Work one task at a time** — complete, test mentally, get approval
6. **Mark task done** in `tasks.md` once approved
7. **Move to next task** only after confirmation

---

## 🚫 Hard Rules

- Never write or change code without explicit user approval
- Never push to git — user handles all git commands
- Never change Firebase config or authentication method without discussion
- Never replace `signInWithRedirect` with popup — the redirect flow is intentional for mobile
- Never exceed localStorage photo limits — always resize before storing (max 1200px / JPEG 80%)
- Never make the UI feel clinical or cold — preserve the warm brand aesthetic
- Always think mobile-first before suggesting any UI change

---

## 🎨 Brand & Design

- **Name:** SymptomNest
- **Icon:** 🪺
- **Vibe:** Warm, friendly, family-first — not clinical
- **Palette:** Terracotta, sage, blush, cream
- **Typography:** Cormorant Garamond (headings) + DM Sans (body)
- **Tone:** Caring, approachable, reassuring

When making UI changes, always preserve this aesthetic. Avoid cold, sterile, or overly technical design decisions. Do not introduce new color palettes, fonts, or visual frameworks without discussion.

---

## 📱 Mobile Considerations

The app is actively used on mobile. Always verify:
- Touch targets minimum 44px
- No horizontal scroll
- Font sizes minimum 14px body, 16px on inputs (prevents iOS auto-zoom)
- Thumb-friendly placement of primary actions
- Adequate tap spacing between interactive elements
- Test mentally on 375px width before proposing UI changes

---

## ✅ Working Features — Do Not Regress

- Google sign-in with `signInWithRedirect` on mobile (critical)
- Photo upload: resized to max 1200px / JPEG 80% before localStorage; `QuotaExceededError` handled gracefully
- Up to 5 photos per symptom entry; backward compatible with single-image entries
- Overdue items sorted first throughout all lists
- "Needs Attention" panel on dashboard linking to overdue items per member
- Hamburger menu: user name, family code copy, Manage Family, Leave Family, Sign Out
- Google Calendar link on upcoming appointments
- Export to doctor: HTML format with SymptomNest branding
- Filter bar on symptoms: All / Overdue / Follow-up tabs
- Forgot family code help screen
- After entering family code, auto-redirect to dashboard when members exist

---

## 🔮 Future Work — Do Not Start Without Discussion

These require external services and should be scoped separately:
- Email notifications for follow-ups due → SendGrid or Firebase Cloud Functions
- Email share of family join code → same dependency
- AI symptom analysis (opt-in, photo + text) → Anthropic API integration

---

## 🛠 Development Commands

```bash
npm run dev       # Start Vite dev server with HMR
npm run build     # Production build (outputs to dist/)
npm run preview   # Preview production build locally
npm run lint      # Run ESLint — run before committing
```

No test runner is configured. There are no test files in the repository.

---

## Environment Setup

Copy `.env.example` to `.env` and fill in Firebase credentials:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_DATABASE_URL=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

All env variables must be prefixed with `VITE_` to be accessible in browser code.

---

## Repository Structure

```
health-family/
├── src/
│   ├── components/
│   │   ├── body-selector/         # Interactive SVG body location selector
│   │   │   └── BodySelector.jsx
│   │   ├── checkups/              # Checkup tracking UI
│   │   │   ├── CheckupList.jsx
│   │   │   └── CheckupCard.jsx
│   │   ├── dashboard/             # Main views
│   │   │   ├── DashboardPage.jsx  # Family member grid + Needs Attention panel
│   │   │   ├── MemberDashboard.jsx
│   │   │   ├── HealthEntryModal.jsx
│   │   │   ├── HealthEntryList.jsx
│   │   │   ├── HealthEntryCard.jsx
│   │   │   ├── AllergySection.jsx
│   │   │   ├── MedicationSection.jsx
│   │   │   ├── GrowthSection.jsx
│   │   │   └── PeriodSection.jsx
│   │   ├── onboarding/            # Family setup flow
│   │   │   ├── OnboardingPage.jsx
│   │   │   ├── FamilyMemberForm.jsx
│   │   │   ├── FamilyMemberList.jsx
│   │   │   └── FamilyMemberCard.jsx
│   │   ├── FamilyCodeScreen.jsx   # Create/join family with 6-char code
│   │   └── LandingPage.jsx        # Pre-login landing page
│   ├── data/
│   │   ├── checkupRecommendations.js
│   │   └── vitaminRecommendations.js
│   ├── utils/
│   │   ├── firebase.js            # Auth + Realtime DB operations
│   │   ├── storage.js             # LocalStorage helpers
│   │   ├── checkupUtils.js        # Checkup status calculations
│   │   └── exportSummary.js       # Doctor-visit HTML export
│   ├── App.jsx                    # Root: routing, all shared state
│   ├── App.css
│   ├── main.jsx
│   └── index.css                  # Global styles and CSS custom properties
├── index.html
├── tasks.md                       # ← Task queue, always check this
├── CLAUDE.md                      # ← This file
├── vite.config.js
├── eslint.config.js
└── .env.example
```

---

## Architecture

### State Management

All state lives in `App.jsx` as `useState` hooks — no Context, Redux, or Zustand.

| Variable | Type | Purpose |
|---|---|---|
| `user` | Firebase User / null / undefined | Auth state (`undefined` = loading) |
| `familyCode` | string | 6-char alphanumeric family identifier |
| `members` | array | Family members |
| `entries` | array | Health log entries |
| `checkupLogs` | object | `{ memberId: { checkupId: dateString } }` |
| `dismissedCheckups` | object | `{ memberId: [checkupId, ...] }` |
| `allergies` | object | `{ memberId: [allergy, ...] }` |
| `growthRecords` | object | `{ memberId: [record, ...] }` |
| `medications` | object | `{ memberId: [medication, ...] }` |
| `periodRecords` | object | `{ memberId: [record, ...] }` |
| `syncStatus` | string | `idle` / `syncing` / `synced` / `error` |

### Routing / Screen Logic

Conditional renders in `App.jsx` (no React Router):

1. `user === undefined` → Loading spinner
2. `user === null` → `<LandingPage>`
3. `user` + no `familyCode` → `<FamilyCodeScreen>`
4. `user` + `familyCode` + no `members` → `<OnboardingPage>`
5. `user` + `familyCode` + `members` → `<DashboardPage>`

### Persistence Strategy

- **LocalStorage** — primary offline persistence; images (base64) stored here only
- **Firebase Realtime Database** — cross-device sync; images stripped before writing
- **Sync loop prevention:** `isRemoteUpdate` ref in App.jsx prevents re-uploading data from Firebase
- **Debounced writes:** rapid state changes are debounced before Firebase writes

---

## Data Models

### Family Member
```js
{ id, name, age, gender: "Male"|"Female"|"Other", role, knownIssues }
```

### Health Entry
```js
{ id, memberId, date, bodyLocation, image, duration, description, whatWasDone, followUp, followUpDate }
```
`image` is base64, LocalStorage only, stripped from Firebase.

### Allergy
```js
{ id, allergen, type: "Food"|"Drug"|"Environmental", severity: "Mild"|"Moderate"|"Severe", reaction }
```

### Growth Record
```js
{ id, date, height, weight, unit: "metric"|"imperial" }
```

### Medication
```js
{ id, name, type, dosage, frequency }
```

### Period Record
```js
// Period: { id, type: "period", startDate, endDate, flow, symptoms }
// Ovulation: { id, type: "ovulation", date, notes }
```

### Checkup Status (computed in checkupUtils.js)
- `overdue` — never done or past due date
- `due-soon` — within 30 days of due date
- `up-to-date` — more than 30 days until due

---

## Firebase Database Layout

```
families/
└── {familyCode}/
    ├── createdAt
    ├── members/
    ├── entries/
    ├── checkupLogs/
    ├── dismissedCheckups/
    ├── allergies/
    ├── growthRecords/
    ├── medications/
    └── periodRecords/
```

- Auth: Google Sign-In only (`GoogleAuthProvider`)
- Family codes: 6-char alphanumeric, excluding O, I, 0, 1

---

## Code Conventions

- Functional components + hooks only — no class components
- One component per file, PascalCase filenames, `.jsx` extension
- Event handlers: `handle*` prefix. Callback props: `on*` prefix
- Constants: UPPER_CASE
- IDs: `Date.now().toString()`
- CSS: colocated in `App.css` / `index.css` — no CSS modules, no Tailwind, no CSS-in-JS
- Use existing CSS custom properties from `index.css`
- Run `npm run lint` before committing

---

## Key Utility Functions

| File | Key exports |
|---|---|
| `firebase.js` | `signInWithGoogle`, `signOut`, `onAuthStateChange`, `generateFamilyCode`, `createFamily`, `familyExists`, `subscribeToFamily`, `updateFamilyData` |
| `storage.js` | `saveToStorage`, `loadFromStorage`, `STORAGE_KEYS` |
| `checkupUtils.js` | `getRecommendedCheckups(member)`, `getCheckupStatus(checkup, lastDate)` |
| `exportSummary.js` | `exportMemberSummary(member, data)` |

---

## Known Gaps (for future consideration)

- **No tests** — consider adding Vitest
- **No TypeScript** — plain JS/JSX; types would reduce prop-drilling bugs
- **No error boundaries** — React crashes show a blank screen
- **No CI/CD** — no GitHub Actions configured
- **Images as base64** — Firebase Storage would be better long-term
- **XSS risk** — `dangerouslySetInnerHTML` in `exportSummary.js`
- **Firebase Security Rules** — ensure rules restrict access to authenticated users by family code
- **Prop drilling** — all state in App.jsx passed many levels deep; React Context would help
- **No pagination** — all entries loaded into memory
- **Limited accessibility** — missing ARIA labels, alt text, keyboard nav in some areas

---

## About the Owner

Anat is a product leader with an engineering background. Be concise and direct. Present options when there are tradeoffs — don't decide unilaterally. Flag risks proactively (localStorage limits, Firebase quota, mobile regressions).
