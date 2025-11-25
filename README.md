# Find My Pet – Full Integration & Setup Guide

## 1. Overview

This document explains, in detail, how the **Find My Pet** feature works end‑to‑end, including:

- Frontend (Next.js) flow and API calls
- Backend (ASP.NET Core) controller logic
- Python ML service (Flask) algorithms
- PostgreSQL tables used for search and for stored embeddings/characteristics
- Full setup instructions and common issues

The main goal: given a user‑uploaded pet photo, find visually similar photos in:

- `rescue_report_photos` (linked to `rescue_reports`)
- `animal_photos` (linked to `animals` and `organizations`)

using **ResNet50 embeddings + cosine similarity**.

---

## 2. High‑Level Architecture

### 2.1 Components

- **Frontend** (Next.js, React)
  - Route: `app/find-my-pet/page.tsx`
  - API client: `lib/api.ts` (`apiClient.comparePhoto`)
- **Backend** (ASP.NET Core Web API)
  - Controller: `backend/Controllers/PhotoComparisonController.cs`
  - Controller: `backend/Controllers/RescueReportsController.cs`
- **ML Service** (Python, Flask)
  - File: `ml-service/app.py`
  - Endpoints:
    - `/api/compare-photo` – search
    - `/api/analyze-photo` – per‑photo analysis
- **Database** (PostgreSQL `petrescue`)
  - Tables: `rescue_report_photos`, `animal_photos`, `rescue_reports`, `animals`,
    `organizations`, `photo_embedding`, `photo_characteristic`, `characteristic`.

### 2.2 Data Flow Summary

1. User uploads image on `/find-my-pet`.
2. Frontend calls backend: `POST /api/PhotoComparison/compare` (multipart, photo).
3. Backend forwards to Python: `POST /api/compare-photo` (multipart, photo + threshold).
4. Python:
   - Reads DB photos (rescue + animal)
   - Computes ResNet50 embeddings
   - Computes cosine similarity
   - Returns JSON matches
5. Backend returns JSON directly to frontend.
6. Frontend renders similarity results.

Separately, when a **rescue report** is created:

1. Backend saves `rescue_reports` + `rescue_report_photos`.
2. For each new photo, backend calls Python: `POST /api/analyze-photo`.
3. Python returns embedding + characteristics.
4. Backend stores them in `photo_embedding`, `characteristic`, `photo_characteristic`.

---

## 3. Frontend: Next.js Logic

### 3.1 API Base URL and Client

`lib/api.ts` defines:

- `API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5149/api"`.
- `ApiClient` class with `request<T>()` that:
  - Builds `fetch(this.baseURL + endpoint)`.
  - Automatically sets `Content-Type: application/json` *except* when `body` is `FormData`.
  - Attaches `Authorization: Bearer <token>` if stored.

### 3.2 comparePhoto(file, threshold?)

`apiClient.comparePhoto` sends the uploaded file to the backend:

- Builds `FormData` with:
  - `photo` = the `File` from `<input type="file">`.
  - `threshold` (optional) = `threshold.toString()`.
- Calls `POST /PhotoComparison/compare` via `this.request()`.

Expected response shape (TypeScript):

- `matches: any[]`
- `total_compared: number`
- `matches_found: number`
- optional `rescue_photos_compared`, `animal_photos_compared`.

### 3.3 FindMyPetPage Component

File: `app/find-my-pet/page.tsx`.

- Defines `SimilarityMatch` interface matching the Python response.
- Manages state: selected file, preview URL, loading/error, results, summary.
- `handleSubmit`:
  - Validates `selectedFile`.
  - Calls `apiClient.comparePhoto(selectedFile)`.
  - Handles `{ error }` vs `{ data }` from the API client.
- Renders:
  - Upload card with file input and preview.
  - Summary (how many photos compared, how many matches).
  - List of cards for each match, with different display for:
    - `type === "rescue_report"`
    - `type === "animal"`.

This page is the **only** frontend consumer of `/api/PhotoComparison/compare`.

---

## 4. Backend: ASP.NET Core Logic

### 4.1 Configuration

`backend/appsettings.json` contains:

- `"MLService": { "Url": "http://localhost:5001" }` → used to reach Flask.

`Program.cs` registers AutoMapper and HTTP clients (for DI via `IHttpClientFactory`).

### 4.2 PhotoComparisonController (Search)

Route: `POST /api/PhotoComparison/compare`.

Responsibility:

1. Receive user image from frontend (`IFormFile photo`).
2. Validate:
   - Non‑empty file.
   - MIME type in {jpeg, jpg, png, gif}.
   - Size ≤ 10MB.
3. Build `MultipartFormDataContent` with:
   - `photo` – the file stream.
   - `threshold` – `double` formatted with `CultureInfo.InvariantCulture`.
4. Send to Python: `POST {MLService.Url}/api/compare-photo`.
5. If Python returns 2xx → relay JSON body to frontend.
6. If Python returns error → respond with `{ message: "ML service error", error: <body> }`.

### 4.3 RescueReportsController (Metadata Storage)

On `POST /api/RescueReports` (create):

1. Save `RescueReport` entity.
2. For each uploaded image:
   - Save `RescueReportPhoto` with:
     - `PhotoData` (BYTEA), `ContentType`, `FileName`, `FileSize`, `CreatedAt`.
3. After saving photos, call `AnalyzeAndSavePhotoMetadataAsync(newPhotos)`:
   - For each `RescueReportPhoto` with binary data:
     - Build multipart request with `photo` bytes.
     - Call `POST {MLService.Url}/api/analyze-photo`.
     - Deserialize `PhotoAnalysisResult`:
       - `Embedding: double[]`.
       - `Characteristics: List<PhotoCharacteristicResult>`.
     - Upsert:
       - `photo_embedding` row for this `photo_id`.
       - `characteristic` rows by name.
       - `photo_characteristic` rows linking photo to each characteristic.

---

## 5. Python ML Service Logic

### 5.1 Model & Embeddings

- Uses `torchvision.models.resnet50(weights=ResNet50_Weights.DEFAULT)`.
- Removes the final classification layer → network outputs a high‑dimensional feature vector.
- Each image is:
  - Resized and center‑cropped to 224×224.
  - Converted to a tensor.
- The resulting tensor is flattened to a 1D embedding (length ≈ 2048).

### 5.2 Cosine Similarity Algorithm

Similarity between two embeddings `u` and `v` is computed using scikit‑learn:

- `similarity = cosine_similarity(u.reshape(1, -1), v.reshape(1, -1))[0][0]`.
- Range: [-1, 1]; 1.0 = identical direction.
- The threshold (default 0.7) filters matches: only similarities ≥ threshold are returned.

### 5.3 /api/compare-photo (Search)

1. Read `photo` from `request.files` and `threshold` from `request.form`.
2. Convert threshold to float, accepting both `"0.7"` and `"0,7"`.
3. Extract query embedding from uploaded image.
4. Connect to PostgreSQL `petrescue`.
5. Query:
   - `rescue_report_photos` joined to `rescue_reports`.
   - `animal_photos` joined to `animals` and `organizations`.
6. For each DB photo:
   - Decode bytes from `photo_data`, or base64 from `photo_url`.
   - Extract embedding.
   - Compute cosine similarity with query embedding.
   - If ≥ threshold, build a match object with IDs and metadata.
7. Sort matches by similarity descending.
8. Return JSON with `matches` and counts.

### 5.4 /api/analyze-photo (Per‑Photo Analysis)

1. Read `photo` from `request.files`.
2. Extract ResNet50 embedding.
3. Compute simple characteristics from raw pixels (via NumPy):
   - Average RGB → estimate brightness (dark/medium/bright).
   - Compare average color to a palette of named colors → dominant_color.
4. Return JSON:
   - `embedding: number[]`.
   - `characteristics: { name, value, confidence }[]`.

---

## 6. PostgreSQL Tables and Usage

### 6.1 For Search

- `rescue_report_photos` + `rescue_reports`:
  - Provide rescue report images and metadata (location, description, urgency, status).
  - Photos filtered to relevant statuses (reported/assigned/in_progress).
- `animal_photos` + `animals` + `organizations`:
  - Provide adoptable animal images, names, species, color, org name, location.
- ML service **reads** from these tables during `/api/compare-photo`.

### 6.2 For Stored Embeddings & Characteristics

- `photo_embedding`:
  - Stores embedding vectors per `RescueReportPhoto`.
- `characteristic`:
  - Dictionary of characteristic names (e.g., `dominant_color`, `brightness`).
- `photo_characteristic`:
  - Links each photo to many characteristics with `value` + `confidence`.
- These are **written** by the .NET backend using `/api/analyze-photo` responses.

---

## 7. Setup Instructions

### 7.1 Database

1. Ensure PostgreSQL is installed and running.
2. Create database `petrescue` (if not already) and apply schema scripts from `scripts/`.
3. Configure connection string in backend `appsettings.json` to point to this DB.

### 7.2 Python ML Service

1. In repo root:
   - `cd ml-service`
   - `python -m venv .venv`
2. Activate venv (PowerShell):
   - `.\.venv\Scripts\activate`
3. Install dependencies:
   - `pip install -r requirements.txt`
4. Run service:
   - `python app.py`
5. Verify health:
   - `curl http://localhost:5001/health` → `{ "status": "healthy" }`.

### 7.3 .NET Backend

1. From repo root: `cd backend`.
2. Restore & build:
   - `dotnet build`
3. Run:
   - `dotnet run`
4. Confirm base URL:
   - Typically `http://localhost:5149/api`.

### 7.4 Next.js Frontend

1. From repo root:
   - `npm install`
   - `npm run dev`
2. Open `http://localhost:3000/find-my-pet`.
3. Upload a clear pet photo to test the feature.

---

## 8. Common Issues

- **ML service error / 500 from /api/PhotoComparison/compare**:
  - Check Python logs in the ML service console.
  - Verify `/health` returns healthy.
  - Ensure DB connection settings in `app.py` match your Postgres.
- **Threshold parsing error ("could not convert string to float '0,7'")**:
  - Fixed by:
    - Sending threshold from C# using `CultureInfo.InvariantCulture`.
    - Parsing on Python side by replacing `','` with `'.'`.
- **Dotnet build file‑in‑use warnings**:
  - Backend executable already running; stop it before rebuilding.

---

This file can be printed or exported as a PDF via your editor or tools like Pandoc.
