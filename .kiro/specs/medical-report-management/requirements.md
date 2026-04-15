# Requirements: Medical Report Management (MedExplain Upgrade)

## Introduction

This document defines the functional and non-functional requirements for upgrading the MedExplain MERN application. The upgrade transforms the existing basic OCR report viewer into a full medical report management platform with structured data extraction, role-based access, a health timeline, QR-based patient sharing, and a professional hospital-grade UI.

All existing functionality (auth, file upload, OCR, chatbot, i18n) is preserved and extended.

---

## Requirements

### 1. Authentication & Role-Based Access

#### 1.1 Role-Aware Registration

**User Story**: As a new user, I want to register as either a patient or a doctor so that I get the appropriate interface and access level.

**Acceptance Criteria**:
- [ ] Registration form includes a role selector with options: "Patient" and "Doctor"
- [ ] `role` field is stored on the User document (default: `'patient'`)
- [ ] JWT token payload includes the `role` claim
- [ ] Existing users without a role field default to `'patient'` on login

**Correctness Properties**:
- For any valid registration payload `{ name, email, password, role }` where `role ∈ { 'patient', 'doctor' }`, the returned JWT always decodes to a token where `token.role === role`
- For any JWT with `role !== 'doctor'`, the `requireRole('doctor')` middleware always responds with HTTP 403

---

#### 1.2 Role-Based Route Protection

**User Story**: As the system, I want to ensure doctors can only access doctor routes and patients can only access patient routes.

**Acceptance Criteria**:
- [ ] `requireRole(role)` middleware added to `middleware/auth.js`
- [ ] All `/api/doctor/*` routes require `role: 'doctor'` in JWT
- [ ] Patient routes remain accessible to patients only (existing `protect` middleware + userId check)
- [ ] A patient JWT on a doctor route returns `403 { error: "Access restricted to doctors" }`

---

### 2. Report Upload & Processing

#### 2.1 Enhanced File Upload

**User Story**: As a patient, I want to upload a PDF or image medical report and have it processed automatically.

**Acceptance Criteria**:
- [ ] Upload accepts PDF and common image formats (jpg, jpeg, png, webp)
- [ ] Duplicate detection: uploading the same file (same originalName + userId) returns `409 Conflict`
- [ ] Report document created immediately with `status: 'pending'`; processing is async
- [ ] `originalName` (human-readable filename) stored alongside the randomized `fileName`

---

#### 2.2 Structured Data Extraction

**User Story**: As a patient, I want the system to extract structured medical information from my uploaded report so I can see my condition, medications, and test results clearly.

**Acceptance Criteria**:
- [ ] After OCR/PDF text extraction, `parseStructured(rawText)` is called
- [ ] Extracted fields stored in a new `ExtractedData` document linked to the Report and User
- [ ] Fields extracted: `condition`, `medications[]`, `dosage[]`, `testResults[]`, `visitDate`
- [ ] If a field cannot be extracted, it defaults gracefully (e.g., `condition: "General Checkup"`, `visitDate: null`)
- [ ] `ExtractedData` document created/updated atomically with Report status update

**Correctness Properties**:
- For any non-empty `rawText` string, `parseStructured(rawText)` always returns an object containing all five fields (`condition`, `medications`, `dosage`, `testResults`, `visitDate`) and never throws an exception
- For any `rawText`, `parseStructured(rawText).medications` is always an array (never null or undefined)

---

#### 2.3 Neutral Medical Summary

**User Story**: As a patient, I want a short plain-language summary of my report so I can quickly understand the key findings.

**Acceptance Criteria**:
- [ ] `buildSummary()` generates exactly 3–4 sentences
- [ ] Summary uses neutral language — no alarm words ("critical", "dangerous", "urgent")
- [ ] Summary stored in `ExtractedData.summary`
- [ ] Summary displayed in the "Summary" tab of the Report Detail page

**Correctness Properties**:
- For any valid inputs `(condition: string, testResults: TestResult[], medications: string[])`, `buildSummary()` always returns a string containing between 3 and 4 sentences (split by `.` or `!` or `?`)
- `buildSummary()` never returns an empty string

---

#### 2.4 Soft Medication Insights

**User Story**: As a patient, I want to be gently informed if a medication appears in multiple reports so I can discuss it with my doctor.

**Acceptance Criteria**:
- [ ] `generateInsights()` checks current report's medications against all previous `ExtractedData` records for the same userId
- [ ] If a medication appears in a prior report, an insight of type `'duplicate_medication'` is added
- [ ] Insight message uses neutral language: e.g., "Metformin has appeared in a previous report."
- [ ] Insights displayed in the "Notes" tab with amber styling (not red)
- [ ] No insight is generated if the patient has no prior reports

**Correctness Properties**:
- For any `insights` array returned by `generateInsights()`, every insight object has a non-empty `message` string
- `generateInsights([], userId)` always returns an empty array

---

### 3. Health Timeline

#### 3.1 Chronological Timeline

**User Story**: As a patient, I want to see all my medical visits in chronological order so I can track my health history over time.

**Acceptance Criteria**:
- [ ] `GET /api/timeline` returns all `ExtractedData` records for the authenticated user
- [ ] Results sorted by `visitDate` descending (newest first) by default
- [ ] Each entry includes: `date`, `condition`, `medications[]`, `summary`, `reportId`
- [ ] Timeline page renders a vertical timeline with date pills and condition/treatment text
- [ ] "View Report" link on each entry navigates to the Report Detail page

**Correctness Properties**:
- For any userId with N completed reports, the timeline endpoint always returns exactly N entries
- For any two consecutive timeline entries `[a, b]`, `a.visitDate >= b.visitDate` (descending order guaranteed)

---

### 4. Doctor View

#### 4.1 Patient Search

**User Story**: As a doctor, I want to search for a patient by their patient ID so I can view their medical history.

**Acceptance Criteria**:
- [ ] `GET /api/doctor/patient/:patientId` requires `role: 'doctor'` JWT
- [ ] Returns `{ patient: { name, email }, timeline: TimelineEntry[], reports: ReportSummary[] }`
- [ ] Patient data is read-only — no create, update, or delete operations available to doctors
- [ ] Invalid or non-existent `patientId` returns `404 { error: "Patient record not found" }`

---

#### 4.2 Doctor UI

**User Story**: As a doctor, I want a clean read-only interface to review a patient's summary, timeline, and reports.

**Acceptance Criteria**:
- [ ] Doctor dashboard shows a search bar (patientId input) and a "Scan QR" button
- [ ] After search, displays: patient name, summary card, timeline, collapsible report list
- [ ] No upload, delete, or edit controls are rendered in doctor view
- [ ] Doctor cannot navigate to patient-only routes (upload, profile edit)

---

### 5. QR Code Feature

#### 5.1 QR Generation

**User Story**: As a patient, I want a unique QR code I can share with my doctor so they can quickly access my history.

**Acceptance Criteria**:
- [ ] Each patient has a unique `patientId` (e.g., `"MED-00042"`) generated at registration
- [ ] `GET /api/qr/:patientId` returns a base64-encoded PNG QR image
- [ ] QR encodes the URL: `{APP_URL}/doctor/patient/:patientId`
- [ ] QR code displayed on a dedicated "Share" page in the patient UI (200×200px)
- [ ] "Copy link" button copies the encoded URL to clipboard

**Correctness Properties**:
- For any valid `patientId` belonging to an existing user, the QR endpoint always returns a non-empty base64 string

---

### 6. UI/UX

#### 6.1 Hospital-Grade Design System

**User Story**: As a user, I want a clean, professional interface that feels appropriate for a medical application.

**Acceptance Criteria**:
- [ ] Color palette applied globally: background `#f8f9fa`, surface `#ffffff`, accent `#4a90a4`
- [ ] Typography set to Inter or Roboto (loaded via Google Fonts or local)
- [ ] All cards use `border-radius: 12px` and `box-shadow: 0 2px 8px rgba(0,0,0,0.08)`
- [ ] Page transitions use CSS fade/slide (0.2s ease)
- [ ] No AI buzzwords in UI labels — use: Summary, Insights, History, Notes, Details

---

#### 6.2 Report Detail Split Layout

**User Story**: As a patient, I want to see my original report alongside the extracted data so I can verify the information.

**Acceptance Criteria**:
- [ ] Report Detail page has a two-panel layout: left (original file preview), right (structured data)
- [ ] PDF files rendered inline using `react-pdf`
- [ ] Image files rendered using `<img>` tag with `object-fit: contain`
- [ ] Right panel has three tabs: "Summary", "Details", "Notes"
- [ ] "Details" tab shows: Condition, Medications, Dosage, Test Results table

---

#### 6.3 i18n Preservation

**User Story**: As a user, I want all new UI text to be available in English, Hindi, and Tamil.

**Acceptance Criteria**:
- [ ] All new UI strings added to `en.json`, `hi.json`, and `ta.json` locale files
- [ ] New pages (Timeline, Doctor View, QR Share) use `useTranslation()` hook for all visible text
- [ ] Language selector remains functional across all new pages

---

### 7. Non-Functional Requirements

#### 7.1 Processing Performance

**Acceptance Criteria**:
- [ ] Upload endpoint responds within 500ms (before async processing begins)
- [ ] Timeline query responds within 1 second for up to 100 reports per patient
- [ ] Compound index `{ userId: 1, visitDate: -1 }` added to `ExtractedData` collection

---

#### 7.2 Security

**Acceptance Criteria**:
- [ ] Uploaded files stored with randomized filenames (Multer `Date.now()` prefix)
- [ ] QR payload contains only `patientId` — no PII, no tokens
- [ ] Doctor search returns only summary fields — no raw extracted text or file paths exposed
- [ ] All new routes protected by `protect` middleware (JWT required)
