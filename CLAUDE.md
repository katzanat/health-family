# CLAUDE.md — Health Family

This file provides context for AI assistants working on this codebase.

## Project Overview

**Health Family** is a React + Vite single-page application for tracking health records across all family members. It uses Firebase for authentication and real-time data sync, and localStorage for offline persistence.

Core features:
- Google sign-in via Firebase Auth
- Family code system (6-char alphanumeric) — multiple users share one family's data
- Family member profiles (name, role, age, gender, known conditions)
- Health entry logging (body location, photo, duration, description, treatment, follow-up)
- Preventative checkup reminders filtered by age and gender
- Allergy, medication/vitamin, and growth record tracking
- Period and ovulation tracking (female members only)
- Doctor export — generates a printable HTML health summary

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 (JSX, functional components, hooks) |
| Build tool | Vite 7 |
| Backend/Auth | Firebase v12 (Authentication + Realtime Database) |
| Persistence | localStorage (offline, images) + Firebase RTDB (sync) |
| Linting | ESLint 9 (flat config) |
| Language | JavaScript (.js / .jsx), ES modules |

No TypeScript. No CSS framework (plain CSS). No router library (view state managed in `App.jsx`).

## Development Commands

```bash
npm run dev       # Vite dev server with HMR
npm run build     # Production build to dist/
npm run preview   # Serve the production build locally
npm run lint      # ESLint check
```

## Environment Setup

Copy `.env.example` to `.env` and fill in Firebase project values:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_DATABASE_URL=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

All env vars are prefixed with `VITE_` so Vite exposes them via `import.meta.env`.

## Repository Structure

```
health-family/
├── index.html                  # Vite HTML entry point
├── vite.config.js              # Vite config (react plugin only)
├── eslint.config.js            # ESLint flat config
├── .env.example                # Required env vars template
└── src/
    ├── main.jsx                # React root — mounts <App> in StrictMode
    ├── App.jsx                 # Root component — all state, auth, Firebase sync
    ├── App.css                 # Global styles
    ├── index.css               # Base/reset styles
    ├── data/
    │   ├── checkupRecommendations.js   # Static checkup schedule data + getRecommendedCheckups()
    │   └── vitaminRecommendations.js   # Static vitamin data + getRecommendedVitamins()
    ├── utils/
    │   ├── firebase.js         # Firebase init, auth helpers, RTDB read/write/subscribe
    │   ├── storage.js          # localStorage get/save helpers for all data types
    │   ├── checkupUtils.js     # getCheckupStatus(), getNextDueDate(), formatDate(), formatFrequency()
    │   └── exportSummary.js    # generateSummaryHTML() + exportForDoctor() (opens print window)
    └── components/
        ├── LandingPage.jsx             # Marketing page for unauthenticated users
        ├── FamilyCodeScreen.jsx        # Create or join a family by 6-char code
        ├── onboarding/
        │   ├── OnboardingPage.jsx      # Wrapper — add/delete members before first dashboard visit
        │   ├── FamilyMemberForm.jsx    # Add member form
        │   ├── FamilyMemberCard.jsx    # Display card for a member in onboarding list
        │   └── FamilyMemberList.jsx    # List of FamilyMemberCards
        ├── dashboard/
        │   ├── DashboardPage.jsx       # Family overview grid; opens MemberDashboard on click
        │   ├── MemberDashboard.jsx     # Tabbed per-member view (Entries, Checkups, Allergies, Medications, Growth, Period)
        │   ├── HealthEntryModal.jsx    # Modal form to add a health entry
        │   ├── HealthEntryCard.jsx     # Display card for a single health entry
        │   ├── HealthEntryList.jsx     # List of HealthEntryCards
        │   ├── AllergySection.jsx      # Allergy list + add form
        │   ├── GrowthSection.jsx       # Growth records list + add form (height/weight/BMI)
        │   ├── MedicationSection.jsx   # Medication/vitamin list + add form (shows recommendations)
        │   └── PeriodSection.jsx       # Period + ovulation logs + calendar view + stats
        ├── checkups/
        │   ├── CheckupList.jsx         # Renders recommended checkups with status badges
        │   └── CheckupCard.jsx         # Single checkup row with mark-done and dismiss actions
        └── body-selector/
            ├── BodySelector.jsx        # Interactive body diagram for location tagging
            └── BodySelector.css        # Body selector styles
```

## Application Flow

Authentication and view state are managed entirely in `App.jsx` using a simple string `view` state (no router):

```
app loads
  → user === undefined  →  Loading screen
  → user === null       →  LandingPage  (Google sign-in)
  → user set, no code   →  FamilyCodeScreen  (create or join)
  → code set, view=onboarding  →  OnboardingPage  (add members)
  → view=dashboard      →  DashboardPage  →  MemberDashboard (per member)
```

## State Architecture

All application state lives in `App.jsx` and is passed down as props (no context, no external store):

| State | Type | Description |
|---|---|---|
| `user` | `FirebaseUser \| null \| undefined` | `undefined` = auth loading |
| `familyCode` | `string` | 6-char code shared by a family |
| `members` | `Array<Member>` | Family member profiles |
| `entries` | `Array<HealthEntry>` | Health log entries |
| `checkupLogs` | `{ [memberId]: { [checkupId]: isoDateString } }` | Last-done dates |
| `dismissedCheckups` | `{ [memberId]: string[] }` | Dismissed checkup IDs |
| `allergies` | `{ [memberId]: Allergy[] }` | Per-member allergy lists |
| `growthRecords` | `{ [memberId]: GrowthRecord[] }` | Per-member growth data |
| `medications` | `{ [memberId]: Medication[] }` | Per-member medications |
| `periodRecords` | `{ [memberId]: PeriodRecord[] }` | Per-member period/ovulation logs |
| `syncStatus` | `'idle' \| 'syncing' \| 'synced' \| 'error'` | Firebase sync indicator |

## Firebase / localStorage Sync Pattern

Data flows in two directions and `App.jsx` prevents write-back loops using a `isRemoteUpdate` ref:

1. **Firebase → state**: `subscribeToFamily()` fires callbacks; each callback sets state AND saves to localStorage, then sets `isRemoteUpdate.current = true`.
2. **State → Firebase**: `useEffect` on each state slice calls the corresponding `write*()` helper. If `isRemoteUpdate.current` is `true`, it skips the write and resets the flag.

**Important**: images are stored as base64 in localStorage only. `writeEntries()` calls `stripImages()` before writing to Firebase to avoid exceeding RTDB limits.

## Firebase Database Schema

```
families/
  {familyCode}/
    createdAt: ISO string
    members/      { [id]: MemberObject }
    entries/      { [id]: EntryObject (no image field) }
    checkupLogs/  { [memberId]: { [checkupId]: isoDateString } }
    dismissedCheckups/ { [memberId]: string[] }
    allergies/    { [memberId]: { [id]: AllergyObject } }
    growthRecords/ { [memberId]: { [id]: GrowthObject } }
    medications/  { [memberId]: { [id]: MedicationObject } }
    periodRecords/ { [memberId]: { [id]: PeriodObject } }
```

Arrays are converted to/from Firebase maps using `arrayToMap()` / `mapToArray()` in `firebase.js`.

## Data Models

### Member
```js
{ id: string, name: string, role: 'Mom'|'Dad'|'Brother'|'Sister'|'Grandparent'|'Other',
  age: number, gender: 'Male'|'Female'|'Other', knownIssues: string }
```

### HealthEntry
```js
{ id: string, memberId: string, date: string (YYYY-MM-DD), bodyLocation: string,
  image: string|null (base64, localStorage only), duration: string,
  description: string, whatWasDone: string, followUp: boolean, followUpDate: string,
  actionTaken: string }
```

### Allergy
```js
{ id: string, allergen: string, type: string, severity: 'Mild'|'Moderate'|'Severe',
  reaction: string }
```

### GrowthRecord
```js
{ id: string, date: string, height: number (cm), weight: number (kg) }
```

### Medication
```js
{ id: string, name: string, type: string, dosage: string, frequency: string }
```

### PeriodRecord
```js
// Period log
{ id: string, type: 'period', startDate: string, endDate: string,
  flow: string, symptoms: string }
// Ovulation log
{ id: string, type: 'ovulation', date: string, notes: string }
```

## Key Conventions

### Component conventions
- All components are functional with hooks; no class components.
- Props are passed directly — no React context or state management library.
- Per-member data (allergies, growth, etc.) is stored as `{ [memberId]: Array }` in state and `{ [memberId]: { [recordId]: Object } }` in Firebase.
- IDs are generated with `Date.now().toString()`.

### ESLint rules
- Config is in `eslint.config.js` (flat config format).
- `no-unused-vars` is enforced with `varsIgnorePattern: '^[A-Z_]'` — uppercase-starting variable names are exempt (used for constants like `ROLE_ICONS`, `SYNC_LABELS`).
- Files: `**/*.{js,jsx}`.

### Styling
- Plain CSS — no Tailwind, no CSS modules, no styled-components.
- Global styles in `src/index.css` and `src/App.css`.
- Component-specific CSS only exists for `BodySelector` (`BodySelector.css`).
- CSS class naming uses BEM-like patterns (`member-dashboard`, `member-tab-active`, `sync-badge`).

### No test suite
There are no tests in this project. `npm run lint` is the only automated quality check.

## Checkup Recommendation System

`src/data/checkupRecommendations.js` exports a static list of checkup definitions:
```js
{ id, name, frequencyMonths, gender: 'all'|'male'|'female', minAge, maxAge }
```

`getRecommendedCheckups(age, gender)` filters the list for the member. Gender is compared case-insensitively (normalized to lowercase internally).

`getCheckupStatus(lastDoneDate, frequencyMonths)` in `checkupUtils.js` returns:
- `'overdue'` — past due or never done
- `'due-soon'` — due within 30 days
- `'up-to-date'` — more than 30 days remaining

## Export for Doctor

`exportForDoctor()` in `src/utils/exportSummary.js` opens a new browser window, writes a complete standalone HTML document, and triggers `window.print()`. The HTML includes: profile, allergies, medications, growth records, checkup history, recent health entries, and period/ovulation data (female only).

## Adding New Health Data Types

When adding a new per-member data category (e.g., vaccines):

1. Add a `localStorage` key and get/save helpers in `src/utils/storage.js`.
2. Add `write*()` and subscribe callback in `src/utils/firebase.js` (the `subscribeToFamily` function and `families/{code}/newType` path).
3. Add state + `useEffect` for persist+sync in `src/App.jsx`, following the `isRemoteUpdate` pattern.
4. Pass the state and handlers down through `DashboardPage` → `MemberDashboard`.
5. Add a tab in `MemberDashboard.jsx` and create a new Section component under `src/components/dashboard/`.
6. Update `generateSummaryHTML()` in `exportSummary.js` to include the new data in doctor exports.
