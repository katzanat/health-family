# SymptomNest Task Queue

> Instructions for Claude Code:
> 1. First, prioritize all tasks below using: 🔴 High / 🟡 Medium / 🟢 Low
> 2. Add a one-line reason per task
> 3. Recommend a starting point with rationale
> 4. Wait for approval before touching any code
> 5. Work one task at a time, mark done when approved, then move to next

---

## 📋 To Do

### 🔮 Requires backend / external service (future work)
- [ ] Email notification: send user an email when a follow-up is due — needs email sending service (e.g. SendGrid, Firebase Cloud Functions)
- [ ] When creating a new family, send the share/join code to an email — same dependency
- [ ] AI review: analyze symptom description and/or photo and suggest possible causes (opt-in) — needs AI API integration

### 🟢 Low Priority — UI / UX
- [ ] User display: show only user name and avatar (research how other multi-user apps handle user switching)
- [ ] Mobile review: audit the full app on mobile and apply responsive/UX improvements

---

## ✅ Done

- [x] **[BUG] Photo upload causes blank screen crash** — Resizes images to max 1200px/JPEG 80% before storing; added QuotaExceededError safety in localStorage
- [x] **Rename "Health"/"Entry" → "Symptom"** — All UI text updated throughout the app
- [x] **Remove "Click here to remove..." text** — Already icon/button based; no change needed
- [x] **Fix mobile login issue** — Uses `signInWithRedirect` on mobile browsers instead of blocked popup
- [x] **After entering family code, redirect to dashboard** — Auto-advances when Firebase delivers existing family members
- [x] **Ability to remove a symptom entry** — Delete (×) button added to each symptom card
- [x] **Show overdue items first in all lists** — Checkups sorted overdue→due-soon→up-to-date; symptom entries with overdue follow-ups float to top
- [x] **Done items: collapse up-to-date checkups** — Collapsed into a togglable "▼ Up to Date (N)" section at bottom
- [x] **Follow-up scheduler: preset date options** — Quick-pick buttons (1 day / 3 days / 1 week / 1 month / 1 year) added above date picker
- [x] **Hamburger menu: user section + Manage Family** — Clean ☰ menu with user name, family code, Manage Family, Leave Family, Sign Out
- [x] **Family members screen: show members first + nav buttons** — "Go to Dashboard" + "Add Family Member" at top; form anchored at bottom with smooth scroll
- [x] **Home screen: overdue/scheduled items prominently** — "⚠️ Needs Attention" panel with overdue checkups + follow-ups; each item links to the member
- [x] **Forgot family code flow** — "Forgot my family code" link with help screen; Copy button added to hamburger menu code display
- [x] **Export to doctor: download icon + better format** — ⬇ icon on export button; export HTML uses "Symptoms" + SymptomNest branding
- [x] **Filter symptoms by All / Overdue / Follow-up** — Filter bar with 3 tabs on symptoms list
- [x] **Avatar/profile photo for family members** — Photo upload in member form; shown in cards, dashboard grid, and member profile; stripped from Firebase, merged from localStorage
- [x] **Multiple photos per symptom entry** — Up to 5 photos per entry; image gallery in card; backward compatible with old single-image entries
- [x] **Doctor appointment: add + record outcome** — Full Appointments tab per member with add form, upcoming/past grouping, outcome recording, and "📅 Calendar" link to Google Calendar
- [x] **Calendar sync** — "📅 Calendar" button on each upcoming appointment opens Google Calendar with pre-filled event details

