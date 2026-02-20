# CLAUDE.md — Health Family App

This file provides context for AI assistants working in this codebase.

## Project Overview

**Health Family** is a React SPA for tracking family health records. It supports multiple family members with shared real-time sync via Firebase. Key features include health entry logging, checkup reminders, allergy tracking, growth/BMI records, medication management, period/ovulation tracking, and doctor-visit export.

**Tech stack:** React 19, Vite 7, Firebase 12 (Auth + Realtime Database), CSS3 with custom properties, ESLint 9.

---

## Development Commands

```bash
npm run dev       # Start Vite dev server with HMR
npm run build     # Production build (outputs to dist/)
npm run preview   # Preview production build locally
npm run lint      # Run ESLint
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
│   │   │   ├── DashboardPage.jsx  # Family member grid
│   │   │   ├── MemberDashboard.jsx # Tabbed member detail view
│   │   │   ├── HealthEntryModal.jsx # Health log form (modal)
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
│   │   └── LandingPage.jsx        # Marketing landing page
│   ├── data/
│   │   ├── checkupRecommendations.js  # 31 age/gender-based checkup definitions
│   │   └── vitaminRecommendations.js  # Vitamin/supplement data
│   ├── utils/
│   │   ├── firebase.js            # Firebase auth + Realtime DB operations
│   │   ├── storage.js             # LocalStorage read/write helpers
│   │   ├── checkupUtils.js        # Checkup status calculations (overdue/due-soon/up-to-date)
│   │   └── exportSummary.js       # Doctor-visit HTML export
│   ├── App.jsx                    # Root: routing logic, all shared state
│   ├── App.css                    # Component styles
│   ├── main.jsx                   # React entry point
│   └── index.css                  # Global styles and CSS custom properties
├── index.html                     # HTML shell
├── vite.config.js
├── eslint.config.js               # ESLint flat config (v9)
└── .env.example                   # Firebase config template
```

---

## Architecture

### State Management

All application state lives in `App.jsx` as `useState` hooks — there is no Context API, Redux, Zustand, or similar. State is passed down as props.

**State variables in App.jsx:**

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

`App.jsx` uses a series of conditional renders (not React Router):

1. `user === undefined` → Loading spinner
2. `user === null` → `<LandingPage>`
3. `user` set + no `familyCode` → `<FamilyCodeScreen>`
4. `user` + `familyCode` + no `members` → `<OnboardingPage>`
5. `user` + `familyCode` + `members` → `<DashboardPage>`

### Persistence Strategy

**Dual-layer sync:**
- **LocalStorage** (via `utils/storage.js`) — primary offline persistence; images (base64) are only stored here.
- **Firebase Realtime Database** — sync across devices/users; images are stripped before writing to Firebase.

**Sync loop prevention:** An `isRemoteUpdate` ref in App.jsx prevents re-uploading data that just arrived from Firebase.

**Debounced writes:** State changes trigger debounced Firebase writes to avoid excessive writes on rapid updates.

---

## Data Models

### Family Member
```js
{
  id: string,           // Date.now().toString()
  name: string,
  age: number,          // 0–120
  gender: "Male" | "Female" | "Other",
  role: "Mom" | "Dad" | "Brother" | "Sister" | "Grandparent" | "Other",
  knownIssues: string   // freetext, optional
}
```

### Health Entry
```js
{
  id: string,
  memberId: string,
  date: string,         // ISO 8601
  bodyLocation: string, // value from BODY_REGIONS constant
  image: string | undefined,  // base64; LocalStorage only, stripped from Firebase
  duration: string,     // e.g. "2 days", "1 weeks"
  description: string,
  whatWasDone: string,
  followUp: boolean,
  followUpDate: string  // ISO 8601; only present if followUp === true
}
```

### Allergy
```js
{
  id: string,
  allergen: string,
  type: "Food" | "Drug" | "Environmental",
  severity: "Mild" | "Moderate" | "Severe",
  reaction: string
}
```

### Growth Record
```js
{
  id: string,
  date: string,         // ISO 8601
  height: number,       // stored in cm
  weight: number,       // stored in kg
  unit: "metric" | "imperial"  // display preference at time of entry
}
```

### Medication
```js
{
  id: string,
  name: string,
  type: string,
  dosage: string,
  frequency: string
}
```

### Period Record
```js
// type = "period"
{
  id: string,
  type: "period",
  startDate: string,  // ISO 8601
  endDate: string,    // ISO 8601
  flow: string,
  symptoms: string
}

// type = "ovulation"
{
  id: string,
  type: "ovulation",
  date: string,       // ISO 8601
  notes: string
}
```

### Checkup (from data/checkupRecommendations.js)
```js
{
  id: string,
  name: string,
  frequencyMonths: number,
  gender: "all" | "male" | "female",
  minAge: number,
  maxAge: number
}
```

Checkup status is computed in `utils/checkupUtils.js`:
- `overdue` — never done or past due date
- `due-soon` — within 30 days of due date
- `up-to-date` — more than 30 days until due

---

## Firebase Database Layout

```
families/
└── {familyCode}/
    ├── createdAt
    ├── members/         { memberId: memberObject }
    ├── entries/         { entryId: entryObject }
    ├── checkupLogs/     { memberId: { checkupId: dateString } }
    ├── dismissedCheckups/ { memberId: [checkupIds] }
    ├── allergies/       { memberId: [allergies] }
    ├── growthRecords/   { memberId: [records] }
    ├── medications/     { memberId: [medications] }
    └── periodRecords/   { memberId: [records] }
```

**Authentication:** Google Sign-In only (`GoogleAuthProvider`). No email/password flow.

**Family codes** are 6-character alphanumeric strings. Characters O, I, 0, 1 are excluded to avoid confusion.

---

## Code Conventions

### Components
- Functional components with hooks only — no class components.
- One component per file; filename matches component name (PascalCase).
- `.jsx` extension for all React files.
- Event handlers use `handle*` prefix (e.g., `handleSubmit`). Callback props use `on*` prefix (e.g., `onSave`).

### Constants
- Uppercase names for arrays/objects of fixed values: `ROLES`, `GENDERS`, `BODY_REGIONS`.
- ESLint is configured to allow unused variables starting with uppercase (constants used implicitly).

### IDs
- Always `Date.now().toString()` — timestamp-based, not UUIDs.

### Firebase ↔ App data conversion
- Firebase stores objects; member-keyed data (allergies, growth, etc.) uses `arrayToMap` / `mapToArray` helpers in `firebase.js`.
- Entries use `{ entryId: entryObject }` maps in Firebase.

### Styling
- CSS files colocated at the top level (`App.css`, `index.css`); no CSS modules or CSS-in-JS.
- Use existing CSS custom properties for colors/spacing (defined in `index.css`).
- Do not introduce Tailwind, styled-components, or other styling frameworks.

### ESLint
- Flat config (ESLint 9+). Rules: `js.configs.recommended` + react-hooks + react-refresh.
- Run `npm run lint` before committing.

---

## Key Utility Files

### `src/utils/firebase.js`
- `signInWithGoogle()` — triggers Google OAuth popup
- `signOut()` — signs out current user
- `onAuthStateChange(callback)` — subscribe to auth state
- `generateFamilyCode()` — returns new 6-char code
- `createFamily(code)` — creates Firebase node
- `familyExists(code)` — returns boolean
- `subscribeToFamily(code, callback)` — real-time listener
- `updateFamilyData(code, data)` — writes all family data to Firebase

### `src/utils/storage.js`
- `saveToStorage(key, value)` / `loadFromStorage(key, defaultValue)` — JSON serialization wrappers
- Constants for all storage keys (`STORAGE_KEYS.*`)

### `src/utils/checkupUtils.js`
- `getRecommendedCheckups(member)` — filters checkup list by age/gender
- `getCheckupStatus(checkup, lastDate)` — returns `overdue` | `due-soon` | `up-to-date`

### `src/utils/exportSummary.js`
- `exportMemberSummary(member, data)` — opens a new browser window with a printable HTML report

---

## Known Gaps / Areas for Improvement

- **No tests** — no Jest, Vitest, or testing library configured. Consider adding Vitest (native Vite integration).
- **No TypeScript** — the codebase uses plain JS/JSX. Types would significantly reduce bugs given the number of inter-component props.
- **No error boundaries** — React crashes will show a blank screen.
- **No CI/CD** — no GitHub Actions or deployment pipeline.
- **Images stored as base64** — inefficient for large photos; Firebase Storage would be a better long-term solution.
- **No input sanitization** — all user inputs go directly into state and Firebase. XSS via `dangerouslySetInnerHTML` in `exportSummary.js` is a known risk for the export HTML output.
- **Firebase Security Rules** — not documented or included in the repo; ensure rules restrict read/write to authenticated users with their family code.
- **Prop drilling** — all state lives in App.jsx and is passed many levels deep. React Context would help as the component tree grows.
- **No pagination** — all entries/records are loaded into memory; may degrade for large datasets.
- **Limited accessibility** — missing ARIA labels, alt text on images, and keyboard navigation in some interactive areas.
