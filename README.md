# HR Core System - Premium Enterprise Management System

A premium, high-density, real-time enterprise Human Resources and operations dashboard built with Next.js, Node.js, Express, TypeScript, MongoDB, and Socket.IO.

---

## 1. Project Architecture

This application uses a modular, decoupled architecture split into a React-based frontend and a Node-based REST API backend:

```
[ Frontend (Next.js App Router) ] <--- HTTP REST / WebSockets ---> [ Backend (Express API) ] <---> MongoDB
```

### Frontend Technology Stack
- **Framework**: Next.js 16 (React 19, App Router)
- **Styling**: Vanilla CSS + TailwindCSS v4 (Glassmorphism layout, premium dark mode default, high-density compact spacing)
- **State Management**: Zustand (Auth, UI, chat, and system state storage)
- **Data Fetching**: TanStack React Query (`@tanstack/react-query`)
- **Real-Time Communications**: Socket.IO Client for instant messaging and presence updates
- **Animations**: Framer Motion (`framer-motion`)

### Backend Technology Stack
- **Framework**: Express Server (TypeScript compilation via `ts-node`/`tsc`)
- **Database**: MongoDB using Mongoose schemas
- **Real-Time Integration**: Socket.IO server room broadcasting
- **File Uploads**: Cloudinary integration
- **AI Analytics**: Google Gemini API integration for automated HR feedback
- **Payments & Wallets**: Razorpay API integrations

---

## 2. End-to-End Core Features

The system adapts dynamically based on three user roles: **Admin**, **HR**, and **Employee**:

### A. Role-Based Dashboards

#### 1. Company Command Center (Admin Dashboard)
- **Governance**: Overall employee headcounts, HR manager logs, and department lists.
- **Cost Analytics**: Departmental payroll costs, PF contributions, and TDS calculations.
- **Security Hub**: Failsafe log tracking, audit trail records, locked user accounts, and system indicators.
- **Billing & Storage**: Company plan descriptions (Trial/Enterprise) and dynamic progress bars for storage usage.

#### 2. HR Operations Center (HR Manager Dashboard)
- **Daily Operations**: Leave request approvals, attendance Late-Exceptions, probation timelines, onboarding checklists, and resigning trackers.
- **Lifecycle Management**: Active rosters, pending document verification queues, and probation reviews.
- **Engagement**: Birthday alerts, upcoming work anniversaries, and satisfaction ratings.

#### 3. Personal Workspace (Employee Dashboard)
- **Daily Work Updates (DSR)**: A screen to log yesterday's accomplishments, today's targets, blockers, and comments.
- **Leaves Center**: Apply for, cancel, and track leave request statuses.
- **Focus Mode**: A custom Pomodoro-style timer to track sprints and task progress.

### B. Workforce Directory & Employees List
- Manage, add, and monitor the organization's workforce records.
- Soft-delete feature to move employees to the "Deleted Directory" instead of immediate database drops.
- Filters to view records by department, role, or search strings.

### C. Attendance & Exceptions
- Check-in and check-out tracking with timestamp registers.
- Automated Late exceptions based on standard starting hours (09:00 AM).

### D. Recruitment Funnel & Pipelines
- Manages active job openings.
- Consolidates applicant funnel statistics across stages (Sourced -> Interview -> Offer -> Hired) by merging the `Application` collection with nested `applicants` arrays inside individual `Job` documents.
- Channels candidate sources like LinkedIn, referrals, and company portals.

### E. Workplace Chat
- **Private Messages**: Directly message anyone in the organization.
- **Channels**: Create and participate in department-wide public channels.
- **Real-Time Updates**: Status indicators (online/offline/dnd), unread badge counts, message sound muting, and typing previews powered by Socket.IO.

### F. Settings Hub (Appearance & Theme)
- Personal credentials, bio edit controls, and notification alerts toggle.
- **Premium Themes**: Dynamically switch between Pristine Light and Premium Dark (default) theme styling.

---

## 3. Database Models & Relationships

All schemas are declared inside `backend/src/models/`:

- **User**: Credentials, core authentication roles (`Employee`, `HR`, `Admin`), and profile photo links.
- **Employee**: Detailed workplace profile, department mapping, joined dates, document attachments, and bank details.
- **DeletedEmployee**: Soft-deleted employee records for compliance audits.
- **UserSettings**: Appearance (`themeMode`, `fontSize`, `compactLayout`), productivity timers, timezone, notification configurations, and chat states.
- **Attendance**: Clock-in and clock-out logs mapped to user emails.
- **Leave**: Leave applications (Start/End dates, leave types, reason, review status).
- **DailyWorkUpdate**: Daily Status Reports (DSR) logging yesterday's tasks, today's focus, blockers, and reviewer comments.
- **Job & Application**: Recruitment portal parameters containing vacancy details and candidate details.
- **AuditLog**: Event auditing tracking user actions, timestamps, and IP addresses.
- **Channel & Message**: Live workspace chat and messaging logs.

---

## 4. How to Run Locally

### Prerequisites
- Node.js installed (v18+)
- Local MongoDB instance or MongoDB Atlas Connection string
- Gemini API Key, Cloudinary Credentials, SMTP credentials (optional for full features)

### Step 1: Start the Backend Server
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file inside the `backend/` folder and populate it:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/hr-system
   JWT_SECRET=your_jwt_secret_key
   EMAIL_FROM=noreply@example.com
   SMTP_HOST=sandbox.smtp.mailtrap.io
   SMTP_PORT=2525
   SMTP_USER=your_smtp_user
   SMTP_PASS=your_smtp_password
   GEMINI_API_KEY=your_gemini_api_key
   ```
4. Start the server in development mode:
   ```bash
   npm run dev
   ```

### Step 2: Start the Frontend Application
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js dev server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 5. Deployment Guide (Launch)

### A. Deploy Backend to Render
1. Push your code repository to GitHub/GitLab.
2. Sign in to [Render](https://render.com) and click **New > Blueprint**.
3. Connect your Git repository. Render will automatically parse the `render.yaml` file in the root directory.
4. Set the required **Environment Variables** in the Render dashboard:
   - `MONGODB_URI` (Use a MongoDB Atlas URI string)
   - `JWT_SECRET` (A strong random string)
   - Add your Gemini API key, Cloudinary keys, and SMTP server details.
5. Click **Deploy**. Render will provision your Node.js server automatically.

### B. Deploy Frontend to Vercel
1. Log in to [Vercel](https://vercel.com).
2. Click **Add New > Project** and select your GitHub repository.
3. Set the **Root Directory** setting to `frontend` (since Next.js lives in the frontend folder).
4. Configure Build and Output Settings:
   - Build Command: `next build`
   - Install Command: `npm install`
5. Configure Environment Variables if you want to explicitly define backend API redirection URLs. Vercel automatically sets up the build and serves the app.
