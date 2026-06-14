# Excella International School — Admissions Portal

A full-stack digital admissions and enrollment system built for **Excella International School**, Kigali, Rwanda. The platform digitises the entire admissions lifecycle — from public programme browsing and multi-step online applications through to document management, staff review workflows, interview scheduling, and final enrolment.

---

## Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router, TypeScript)
- **Styling**: Tailwind CSS v4 with CSS custom properties
- **Typography**: Playfair Display (headings) + Inter (body) via Google Fonts
- **Theme**: Dark / Light mode via `next-themes`
- **Location**: `@devrw/rwanda-location` for cascading Rwanda administrative levels

### Backend
- **Framework**: Spring Boot 3.4 (Java 17)
- **Security**: Spring Security with JWT authentication
- **Data Access**: Spring Data JPA (Hibernate)
- **Database**: PostgreSQL
- **Email**: Spring Mail integration

---

## Features

### Public Portal
- Landing page with school branding, programme overview, and admissions journey guide
- Full programme catalogue (Nursery → Senior 6) with per-level detail cards (Montessori & National Curriculum)
- Tuition & Fees, FAQ, and Contact pages

### Parent / Applicant Portal
- Account registration and JWT-based login with role-based routing
- **Multi-step application form** (Student Info → Parent Info → Academic History → Documents → Review) with **per-step required-field validation** — users cannot advance until mandatory fields are complete
- Cascading Rwanda administrative location selector (Province → District → Sector → Cell → Village)
- Document upload (Birth Certificate, Report Card)
- Application dashboard — real-time status tracking, colour-coded status badges, offer acceptance flow
- Application timeline view

### Admin Portal
- Admissions dashboard with stats (total / pending / accepted / rejected) and full applications table
- Status management — inline dropdown to move any application through the full workflow
- Interview scheduling modal
- Per-application detail view with document verification, reviewer assignment, and committee review
- Reports, user management, and system configuration sections
- Role-based access for: `ADMISSIONS_OFFICER`, `REVIEWER`, `INTERVIEWER`, `ADMISSIONS_COMMITTEE`, `PRINCIPAL`, `REGISTRAR`, `ADMINISTRATOR`, `SUPER_ADMIN`

---

## Getting Started

### Prerequisites
- Java 17 SDK
- Node.js 18+ and npm
- PostgreSQL (running locally)
- Maven 3.8+ (or use the included `./mvnw` wrapper)

### 1. Database Setup
```sql
CREATE DATABASE ise_as_db;
```
Then update `backend/src/main/resources/application.properties` with your PostgreSQL credentials:
```properties
spring.datasource.username=YOUR_USERNAME
spring.datasource.password=YOUR_PASSWORD
```

### 2. Backend
```bash
cd backend
mvn spring-boot:run
# Windows: ./mvnw.cmd spring-boot:run
```
API runs at `http://localhost:8081/api/v1`.

On first run the system auto-seeds: **Excella International School**, all Cambridge academic programmes (Nursery → A-Level), and default staff/admin test accounts.

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

---

## Design System

| Token | Value | Usage |
|---|---|---|
| Forest Green | `#0D4A2F` | Primary navigation, buttons, accents |
| Dark Green | `#082D1D` | Hover states, deep backgrounds |
| Mid Green | `#155D38` | Secondary hover states |
| Gold | `#C9A227` | CTA buttons, highlights, badges |
| Light Gold | `#E8C85A` | Gold hover states |
| Cream | `#F8F5EE` | Page background |

Headings use **Playfair Display** (serif) applied via the `.font-display` utility class. Body copy uses **Inter**.

---

## Project Structure

```
ISE_AS_Project/
├── frontend/          # Next.js app (port 3000)
│   └── src/
│       ├── app/       # Page routes (App Router)
│       └── components/# Shared UI components (Button, SchoolCrest, …)
├── backend/           # Spring Boot REST API (port 8081)
│   └── src/main/java/com/iseas/ise_as_backend/
│       ├── controller/
│       ├── service/
│       ├── model/
│       ├── dto/
│       └── repository/
├── setup.sql          # Database initialisation script
└── docker-compose.yml # Optional containerisation
```

---

## Security Notes
- Change `iseas.jwt.secret` in `application.properties` to a secure random value before any deployment.
- Never commit real credentials or secrets to version control.
- The `application.properties` file included here uses local-only placeholder values.
