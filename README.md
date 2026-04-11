<div align="center">

# LawRoute

### A Web Application to Help Users Report Civil Issues and Access Legal Aid

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

</div>

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Setup Instructions](#-setup-instructions)
- [Authentication & Roles](#-authentication--roles)
- [API Documentation](#-api-documentation)
- [Testing Instructions](#-testing-instructions)
- [Deployment](#-deployment)
- [Screenshots](#-screenshots)

---

## 🔍 Project Overview

**LawRoute** is a full-stack web application designed to bridge the gap between citizens, legal professionals, and government authorities in Sri Lanka. Many citizens lack easy access to legal resources and have no streamlined way to report civil issues to the correct authorities. LawRoute solves this by providing:

- A **Legal Library** with articles and downloadable legal documents for public access.
- A **Consultation Request** system that connects citizens directly with verified lawyers.
- A **Case Management** area where lawyers and citizens collaborate on active legal cases with document sharing and meeting scheduling.
- A **Civil Issues** reporting flow that routes complaints to the appropriate government authority based on category and location.
- **Lawyer Profiles** and a public directory so citizens can find and evaluate lawyers before requesting consultations.

---

## Key Features

### 📚 Legal Library

- Citizens can:
  - Browse easy-to-read legal articles written in plain language.
  - Open and download ready-made legal documents and templates.
- Lawyers can:
  - Share their knowledge by writing articles for the public.
- Admins can:
  - Review and approve articles before they go public.
  - Keep the document library up to date and organized.

### 💬 Consultation Requests

- Citizens can:
  - Search for a suitable lawyer and request a one‑to‑one consultation.
  - Explain their situation in a simple form and track whether the request is pending, accepted, or rejected.
- Lawyers can:
  - See all consultation requests they’ve received in one place.
  - Accept or reject each request with a clear status.
  - Automatically turn an accepted request into an ongoing case.

### 📁 Case Management

- Citizens and lawyers can:
  - See all their active and closed cases in a dashboard.
  - Open a case to view a clear summary of what the case is about and who is involved.
- Meetings:
  - Lawyers can schedule online or in‑person meetings for each case.
  - Both sides can see upcoming meetings with dates, times, and locations.
  - The system can conduct online meetings via built-in secure video conferencing.
  - Online meetings use a secure, link that only appears at the right time for the right people.
- Documents:
  - Upload, view, and organize documents related to each case in one place.
  - Keep case files together instead of sharing them across multiple apps.
- Lawyers can:
  - Close a case once the work is finished, so it no longer appears as active.

### 🏛️ Civil Issues

- Citizens can:
  - Report everyday civil issues (e.g. land, harassment, public services) with location, description, and photos.
  - Choose whether to share an issue publicly or keep it private.
  - Browse a public feed of issues that citizens chose to make visible.
  - Track the status of each issue (pending, in progress, resolved, rejected) from their own dashboard.
- Authorities can:
  - See all issues that belong to their department.
  - Update the status, add notes, and record how each issue was resolved.
  - View simple charts showing their current workload and progress.
- Admins can:
  - Review issues that don’t clearly belong to a single authority and route them appropriately.

### 👤 Lawyer Profiles

- Citizens can:
  - Search for lawyers by name, area of law, and whether they offer free consultations.
  - Open a detailed profile to see experience, education, languages spoken, and contact details.
  - Request a consultation directly from a lawyer’s profile.
- Lawyers can:
  - Build a professional profile that highlights their expertise, work history, and qualifications.
  - Keep their contact details, languages, and practice areas up to date.
  - Share legal posts and updates that appear on their public profile.
- Admins can:
  - Review new lawyer profiles and verify them before they are shown as approved.
  - Manage which profiles are visible in the public directory.

---

## 🛠️ Tech Stack

| Layer        | Technology                                                           |
| ------------ | -------------------------------------------------------------------- |
| **Frontend** | React 19, Vite 8, TailwindCSS 4, shadcn/ui, React Router 7           |
| **Backend**  | Node.js, Express 5                                                   |
| **Database** | MongoDB Atlas (Mongoose 9)                                           |
| **Auth**     | JWT (JSON Web Tokens), bcryptjs                                      |
| **Storage**  | Cloudinary (images, documents)                                       |
| **Email**    | Nodemailer (Gmail SMTP) - password reset, notifications              |
| **Testing**  | Jest 30, Supertest 7 (unit & integration), Artillery 2 (performance) |

---

## Setup Instructions

### Prerequisites

| Requirement       | Version                         |
| ----------------- | ------------------------------- |
| **Node.js**       | ≥ 18.x                          |
| **npm**           | ≥ 9.x                           |
| **MongoDB Atlas** | Free tier or above              |
| **Cloudinary**    | Free account                    |
| **Gmail Account** | For SMTP (App Password enabled) |
| **Geoapify**      | Free account (API key required) |

### Backend Setup

```bash
# 1. Clone the repository
git clone https://github.com/thisaru01/LawRoute.git
cd LawRoute/backend

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env   # or create .env manually (see below)

# 4. Start development server
npm run dev
```

**Backend `.env` file (example):**

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>

JWT_SECRET=<your_jwt_secret>
JWT_EXPIRE=1d

FRONTEND_URL=http://localhost:5173

# Cloudinary
CLOUDINARY_CLOUD_NAME=<your_cloud_name>
CLOUDINARY_API_KEY=<your_api_key>
CLOUDINARY_API_SECRET=<your_api_secret>

# Nodemailer - Gmail SMTP
MAIL_USER=<your_email>@gmail.com
MAIL_PASS=<your_app_password>
MAIL_FROM=LawRoute <your_email@gmail.com>

# Geoapify
GEOAPIFY_API_KEY=<your_geoapify_key>
```

The backend runs at **http://localhost:5000** by default.

### Frontend Setup

```bash
# 1. Navigate to frontend
cd LawRoute/frontend

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env   # or create .env manually (see below)

# 4. Start development server
npm run dev
```

**Frontend `.env` file (example):**

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

The frontend runs at **http://localhost:5173** by default.

---

## 🔐 Authentication & Roles

LawRoute uses **JWT-based authentication** with role-based access control (RBAC). Tokens are sent via the `Authorization: Bearer <token>` header.

### User Roles

| Role          | Description          |
| ------------- | -------------------- |
| **user**      | Citizen              |
| **lawyer**    | Legal professional   |
| **authority** | Government authority |
| **admin**     | System administrator |

### Auth Flow

1. **Register** - `POST /api/auth/register` creates a user account (citizens; lawyers can sign up and then be verified).

2. **Login** - `POST /api/auth/login` returns a JWT token.

3. **Protected Routes** - the `protect` middleware verifies the token and attaches `req.user`.

4. **Role Gates** - the `authorizeRoles(...roles)` middleware restricts endpoints to specific roles.

5. **Password Reset** - `POST /api/auth/forgot-password` sends a reset email; `POST /api/auth/reset-password` completes the reset.

---

## 📡 API Documentation

**Base URL:** `http://localhost:5000/api`

### Main Endpoint Groups

- `/auth` - register, login, forgot/reset password.
- `/users` - current user profile, profile photo, and password updates.
- `/articles` - legal articles for the public legal library.
- `/documents` - downloadable legal document templates.
- `/consultation-requests` - citizens request consultations; lawyers accept or reject.
- `/cases` - manage cases, documents, and meetings.
- `/civil-issues` - submit and track civil issues; authority/admin operations; public feed.
- `/lawyer-profile` - public lawyer directory and lawyer self-management.
- `/social` - legal-related posts and activity feed.
- `/location` - Sri Lanka location autocomplete endpoints.

### Postman Collection

- **Full API details: https://documenter.getpostman.com/view/45898066/2sBXitCnXC**

### HTTP Status Codes (Common)

- `200 OK` - Successful read.
- `201 Created` - Successful creation.
- `400 Bad Request` - Validation or input errors.
- `401 Unauthorized` - Missing or invalid JWT.
- `403 Forbidden` - Insufficient role/permissions.
- `404 Not Found` - Resource not found.
- `500 Internal Server Error` - Unexpected server error.

---

## 🧪 Testing Instructions

All automated tests currently live in the **backend**.

### How to Run Unit Tests (Jest)

Unit tests cover core backend logic such as services, controllers, middleware, and validation.

All Jest test files (unit and integration) live under `__tests__` and follow the pattern `**/__tests__/**/*.test.[jt]s` inside the backend.

```bash
cd backend
npm test
```

To run a specific test file or subset of tests, pass a Jest pattern:

```bash
cd backend
npm test -- <pattern or file-name>
# e.g.
npm test -- civilIssueService.test.js
```

### Integration Tests (Jest + Supertest)

Integration tests exercise the HTTP API endpoints end-to-end using Supertest.

- Uses the same Jest test file pattern described above.
- Boots the Express app and hits routes such as `/api/auth`, `/api/consultation-requests`, `/api/cases`, etc.

Run all unit and integration tests together:

```bash
cd backend
npm test
```

To focus on specific integration suites, filter by filename or folder:

```bash
cd backend
npm test -- <file-name or folder>
# e.g.
npm test -- consultationRequest.integration.test.js
```

### Performance Testing (Artillery)

Performance scenarios live in `backend/performance-tests/`.

**Example:** consultation request load test (loads variables from `.env`):

```bash
cd backend
npx dotenv -e .env -- npx artillery run performance-tests/consultaion-request/consultation-request.yml
```

If you prefer to export environment variables manually instead of using `dotenv`, set them in your shell before running Artillery.

You can create or adjust additional scenarios by editing or adding YAML files in `backend/performance-tests/`.

### Testing Environment Configuration

All automated tests rely on the same environment variables as the backend server. Before running tests, ensure you have a `.env` file in `backend/` with (at minimum):

- `MONGO_URI` – points to a MongoDB database that is safe for tests (ideally a dedicated test database).
- `JWT_SECRET`, `JWT_EXPIRE`
- `FRONTEND_URL`
- Cloudinary: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- Email (Nodemailer): `MAIL_USER`, `MAIL_PASS`, `MAIL_FROM`
- `GEOAPIFY_API_KEY`

For **Artillery performance tests**, the scenarios expect environment variables so they can authenticate and perform actions. Example variables for multiple roles:

```bash
# Citizen
set USER_EMAIL=citizen@example.com
set USER_PASSWORD=secret

# Lawyer
set LAWYER_EMAIL=lawyer@example.com
set LAWYER_PASSWORD=secret
set LAWYER_ID=642xxxxxxxxxxxxxxxxxxxxxxx

# Authority
set AUTHORITY_EMAIL=authority@example.com
set AUTHORITY_PASSWORD=secret

# Admin
set ADMIN_EMAIL=admin@example.com
set ADMIN_PASSWORD=secret
```

If you run Artillery with `dotenv` (recommended) ensure these variables are present in `backend/.env` or the file you pass to `dotenv`.

---

## 🚢 Deployment

### Backend Deployment - Railway

1. Create a new Railway project and point it to the `backend/` directory.
2. Configure build & start commands:
   - Build: `npm install`
   - Start: `npm start`
3. Add all backend environment variables (MongoDB, JWT, Cloudinary, email, Geoapify, etc.).
4. Deploy.

### Frontend Deployment - Vercel

1. Create a new Vercel project and point it to the repository (select the `frontend/` directory as the root or set the Project Root to `frontend`).
2. Let Vercel detect the framework (Vite).
3. Build command: `npm run build` , Output Directory: `dist`.
4. Add the environment variable `VITE_API_BASE_URL` in the Vercel project Settings → Environment Variables.
5. Deploy.

> Note: Vercel automatically creates preview deployments for branches and pull requests - useful for testing before merging to production.

### Environment Variables

- **Backend (Railway)**

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>

JWT_SECRET=<your_jwt_secret>
JWT_EXPIRE=1d

FRONTEND_URL=https://law-route-sl.vercel.app

# Cloudinary
CLOUDINARY_CLOUD_NAME=<your_cloud_name>
CLOUDINARY_API_KEY=<your_api_key>
CLOUDINARY_API_SECRET=<your_api_secret>

# Nodemailer - Gmail SMTP
MAIL_USER=<your_email>@gmail.com
MAIL_PASS=<your_app_password>
MAIL_FROM=LawRoute <your_email@gmail.com>

# Geoapify
GEOAPIFY_API_KEY=<your_geoapify_key>
```

- **Frontend (Netlify)**

```env
VITE_API_BASE_URL=https://lawroute-production.up.railway.app/api
```

### Live URLs

- Backend (Railway): `https://lawroute-production.up.railway.app`
- Frontend (Netlify): `https://law-route-sl.vercel.app`

---

### 🖼️ Screenshots

**Railway deployment screenshot**
![Railway deployment screenshot](https://res.cloudinary.com/lawroute/image/upload/v1775934732/Railway_ku3cnh.png)

**Vercel deployment screenshot**
![Vercel deployment screenshot](https://res.cloudinary.com/lawroute/image/upload/v1775934733/Vercel_a6flzt.png)
