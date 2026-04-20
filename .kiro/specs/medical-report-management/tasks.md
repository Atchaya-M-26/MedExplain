# Tasks: Medical Report Management (MedExplain Upgrade)

## Implementation Plan

### Phase 1: Backend Foundation

- [x] 1.1 Enhance User model with `role` and `patientId` fields
  - Add `role: { type: String, enum: ['patient', 'doctor'], default: 'patient' }` to `models/User.js`
  - Add `patientId: String` (auto-generated short ID, e.g. `MED-XXXXX`) to `models/User.js`
  - Add pre-save hook to generate `patientId` for new patient users

- [x] 1.2 Update auth controller and JWT to include role
  - Include `role` in JWT payload in `controllers/authController.js`
  - Update register endpoint to accept and validate `role` field
  - Ensure existing users without role default to `'patient'` on login

- [x] 1.3 Add `requireRole` middleware
  - Add `requireRole(role)` function to `middleware/auth.js`
  - Returns 403 with `{ error: "Access restricted to doctors" }` on role mismatch

- [x] 1.4 Create `ExtractedData` MongoDB model
  - New file `models/ExtractedData.js` with fields: `reportId`, `userId`, `condition`, `medications`, `dosage`, `testResults`, `visitDate`, `summary`, `insights`
  - Add compound index `{ userId: 1, visitDate: -1 }`

- [x] 1.5 Enhance `Report` model
  - Add `originalName: String` field to `models/Report.js`
  - Remove deprecated `simplifiedSummary`, `abnormalFindings`, `analysis` fields (or mark as legacy)

---

### Phase 2: Structured Extraction Service

- [x] 2.1 Create `services/structuredExtractor.js`
  - `extractCondition(text)` — regex patterns for diagnosis/impression/assessment sections
  - `extractMedications(text)` — common medication name patterns
  - `extractDosage(text)` — dosage pattern extraction (mg, ml, twice daily, etc.)
  - `extractVisitDate(text)` — date pattern extraction
  - `buildSummary(condition, testResults, medications)` — 3-4 neutral sentences
  - `generateInsights(medications, userId)` — async, checks prior ExtractedData for duplicates
  - `parseStructured(rawText, userId)` — orchestrates all above, returns full ExtractedData object

- [x] 2.2 Integrate structured extractor into report processing pipeline
  - In `controllers/reportController.js` `processReport()`, call `parseStructured()` after OCR/PDF extraction
  - Create/upsert `ExtractedData` document after extraction
  - Update `Report.status` to `'completed'` only after both Report and ExtractedData are saved

- [x] 2.3 Add duplicate upload detection
  - Before creating Report, check for existing `{ userId, originalName }` match
  - Return `409 Conflict` if duplicate found

---

### Phase 3: Timeline & Doctor APIs

- [x] 3.1 Create timeline route and controller
  - New file `routes/timeline.js` — `GET /api/timeline` (protected)
  - New file `controllers/timelineController.js` — query ExtractedData by userId, sort by visitDate desc
  - Register route in `server.js`

- [x] 3.2 Create doctor routes and controller
  - New file `routes/doctor.js` — all routes require `protect` + `requireRole('doctor')`
  - `GET /api/doctor/patient/:patientId` — returns patient summary, timeline, report list
  - New file `controllers/doctorController.js`
  - Register route in `server.js`

- [x] 3.3 Create QR code route
  - New file `routes/qr.js` — `GET /api/qr/:patientId` (protected)
  - Install `qrcode` npm package
  - Generate QR encoding `{APP_URL}/doctor/patient/:patientId`, return base64 PNG
  - Register route in `server.js`

---

### Phase 4: Frontend — Core Pages

- [x] 4.1 Apply global design system
  - Update `App.css` with CSS custom properties (color tokens, typography, card styles, transitions)
  - Add Google Fonts import for Inter/Roboto in `public/index.html`

- [x] 4.2 Update Register page with role selector
  - Add role radio/select to `pages/Register.js`
  - Pass role to auth API call

- [x] 4.3 Update AuthContext to store and expose role
  - Parse role from JWT in `context/AuthContext.js`
  - Expose `user.role` to consuming components

- [x] 4.4 Rebuild Patient Dashboard
  - Update `pages/Dashboard.js` with new card layout (condition, date, status badge, View Details button)
  - Fetch reports from `/api/reports`, display ExtractedData fields (condition) on each card
  - Add "Upload Report" primary button

- [x] 4.5 Create Report Detail page (split layout)
  - New file `pages/ReportDetail.js`
  - Left panel: PDF viewer (`react-pdf`) or `<img>` based on fileType
  - Right panel: tabs — Summary, Details (condition/meds/dosage/test results table), Notes (insights)
  - Install `react-pdf` and `qrcode.react` packages
  - Add route `/report/:id` in `App.js`

- [x] 4.6 Create Timeline page
  - New file `pages/Timeline.js`
  - Fetch from `/api/timeline`
  - Vertical CSS timeline component — date pill left, condition + summary right, "View Report" link
  - Add route `/timeline` in `App.js`

- [x] 4.7 Create Doctor View pages
  - New file `pages/DoctorDashboard.js` — search bar + QR scan button
  - New file `pages/DoctorPatientView.js` — read-only patient summary, timeline, report list
  - Add routes `/doctor` and `/doctor/patient/:patientId` in `App.js`
  - Protect with role check (redirect patients away from doctor routes)

- [x] 4.8 Create QR Share page (patient)
  - New file `pages/QRShare.js`
  - Fetch QR base64 from `/api/qr/:patientId`, render with `<img>` or `qrcode.react`
  - Copy link button
  - Add route `/share` in `App.js`

---

### Phase 5: Navigation & i18n

- [x] 5.1 Update Navigation component
  - Add links: Timeline, Share (patient role)
  - Add link: Patients (doctor role)
  - Hide role-inappropriate links based on `user.role`

- [x] 5.2 Add i18n keys for all new UI strings
  - Add keys to `locales/en.json`, `locales/hi.json`, `locales/ta.json`
  - Keys needed: dashboard labels, timeline labels, doctor view labels, QR page labels, tab names (summary, details, notes)

---

### Phase 6: Polish & Non-Functional

- [x] 6.1 Add MongoDB indexes
  - Add compound index `{ userId: 1, visitDate: -1 }` on ExtractedData in model definition
  - Add index `{ userId: 1, originalName: 1 }` on Report for duplicate detection

- [x] 6.2 Add loading and error states to all new pages
  - Spinner/skeleton while data loads
  - Error boundary or inline error message on fetch failure

- [x] 6.3 Install new npm packages
  - Backend: `npm install qrcode` in `backend/`
  - Frontend: `npm install react-pdf qrcode.react` in `frontend/`
