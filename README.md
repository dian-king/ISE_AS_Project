# ISE&AS - International School Admissions & Enrollment System

ISE&AS is a professional, white-label digital admissions platform designed for premium international schools. It digitizes the entire enrollment lifecycle—from initial interest and multi-step application submission to document management and administrative review.

---

## 🛠 Tech Stack

### **Frontend**
- **Framework**: Next.js 15+ (App Router)
- **Styling**: Tailwind CSS 4.0
- **State Management**: React Hooks
- **Icons**: Lucide React / Custom SVGs
- **Theme**: Dark/Light mode support via `next-themes`

### **Backend**
- **Framework**: Spring Boot 3.4 (Java 17)
- **Security**: Spring Security with JWT (JSON Web Tokens)
- **Data Access**: Spring Data JPA (Hibernate)
- **Database**: PostgreSQL
- **Email**: Spring Mail Integration

---

## 🚀 Getting Started

Follow these steps to set up the project on your local machine.

### **Prerequisites**
- **Java 17 SDK**
- **Node.js 18+** & npm
- **PostgreSQL** installed and running
- **Maven 3.8+** (or use the provided `./mvnw` wrapper)

---

### **1. Database Configuration**
1. Open your PostgreSQL query tool (pgAdmin, psql, etc.).
2. Execute the commands found in `setup.sql` or simply run:
   ```sql
   CREATE DATABASE ise_as_db;
   ```
3. Update the database credentials in the backend configuration:
   - Navigate to `backend/src/main/resources/application.properties`.
   - Update `spring.datasource.username` and `spring.datasource.password` with your local PostgreSQL credentials.

---

### **2. Backend Setup (Spring Boot)**
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Run the application:
   ```bash
   # Using Maven
   mvn spring-boot:run
   
   # Or using the wrapper (Windows)
   ./mvnw.cmd spring-boot:run
   ```
- The API will be available at: `http://localhost:8081/api/v1`
- **Auto-Initialization**: On the first run, the system automatically seeds the database with a default school ("Greenwood International School"), academic programs, and test accounts.

---

### **3. Frontend Setup (Next.js)**
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
- Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Default Test Accounts
For demonstration purposes, the system initializes with the following portals:

- **Student Portal**: Direct access to the application flow and status tracking.
- **Admin Portal**: Direct access to the Admissions Review Dashboard to manage submissions.

*Note: Background auto-authentication is currently enabled for a seamless demo experience.*

---

## 📁 Project Structure
- `/frontend`: Next.js application (Port 3000)
- `/backend`: Spring Boot REST API (Port 8081)
- `setup.sql`: Database initialization script
- `docker-compose.yml`: (Optional) Containerization configuration

---

## 🔒 Security Notice
- Ensure the `iseas.jwt.secret` in `application.properties` is changed to a secure, random string before any production deployment.
- Never commit actual passwords or secrets to version control.
