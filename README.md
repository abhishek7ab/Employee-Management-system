# 👥 StaffPulse - Employee Management System

A modern, full-stack **Employee Management System** built with **Spring Boot 4 (Java 21)** and **React 19 (Vite)**. It provides complete employee record management, daily attendance tracking, leave approval workflows, and interactive department analytics.

---

## ✨ Features

- 👥 **Employee Directory (CRUD)**: Add, edit, view, and delete employee records with live search, department filters, and assigned managers.
- 📅 **Daily Attendance Tracker**: Mark and update daily attendance (`Present`, `Absent`, `Half-Day`) with one-click toggles and instant summaries.
- 📝 **Leave Management System**: Submit leave requests with reason and dates; managers can approve or reject with a single click.
- 📊 **Department Insights & Analytics**: Visual progress bars showing staff distribution across departments, total payroll, and average compensation.
- 🗄️ **Zero-Setup Local Database**: Works out-of-the-box with embedded **H2 Database** (no installation required) or can connect to **MySQL**.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, Vite, Modern Vanilla CSS (Dark Mode & Glassmorphism) |
| **Backend** | Java 21, Spring Boot, Spring Data JPA, Hibernate |
| **Database** | H2 (in-memory, pre-configured) / MySQL (`employee_db`) |
| **Build Tools** | Maven Wrapper (`mvnw`), npm |

---

## 🚀 How to Run the Project

### Option 1: One-Click Start (Recommended)
Simply run the included batch file in PowerShell or CMD:

```powershell
.\run.bat
```
- Automatically finds an available port (default `8080` or `8081`).
- Starts Spring Boot with the pre-seeded local database.
- Open **[http://localhost:8080](http://localhost:8080)** in your browser.

---

### Option 2: React Development Mode (with Hot Reload)
If you are developing or modifying the React frontend:

```powershell
# 1. Start the React dev server
npm run dev
```
- Open **[http://localhost:5173](http://localhost:5173)** in your browser.
- All API requests are automatically proxied to Spring Boot.

---

### Option 3: Standard Maven Command
```powershell
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=local"
```

---

## 📁 Project Structure

```
Employee management/
├── frontend/                     # React 19 + Vite frontend source code
│   ├── src/
│   │   ├── components/           # Employee, Attendance, Leave, & Insights modules
│   │   ├── App.jsx               # Main dashboard layout and navigation
│   │   └── index.css             # Glassmorphic dark design system
│   └── vite.config.js            # Dev proxy to localhost:8080 & static build config
├── src/
│   ├── main/java/...             # Spring Boot controllers, models, and services
│   └── main/resources/
│       ├── application.properties        # MySQL database config
│       ├── application-local.properties  # H2 local database config
│       └── static/               # Compiled production React frontend bundle
├── employee_db.sql               # Optional MySQL database schema & sample data
├── package.json                  # Root npm scripts (npm run dev / build)
├── pom.xml                       # Maven dependencies & build configuration
├── run.bat                       # One-click startup script for Windows
└── README.md                     # Project documentation
```

---

## 🔌 REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/employees` | List all employees (supports `?department=`, `?search=`) |
| `POST` | `/api/employees` | Create a new employee |
| `PUT` | `/api/employees/{id}` | Update existing employee details |
| `DELETE` | `/api/employees/{id}` | Delete an employee |
| `GET` | `/api/attendance?date=YYYY-MM-DD` | Fetch attendance records for a specific date |
| `POST` | `/api/attendance/mark` | Mark or update employee attendance |
| `GET` | `/api/leaves` | List leave requests (supports `?status=`) |
| `POST` | `/api/leaves` | Submit a new leave request |
| `PUT` | `/api/leaves/{id}/status` | Approve or reject a leave request |

---

## 🗄️ H2 Database Console

When running with the `local` profile, an interactive database console is available:
- **URL**: [http://localhost:8080/h2-console](http://localhost:8080/h2-console)
- **JDBC URL**: `jdbc:h2:mem:employeedb`
- **User Name**: `sa`
- **Password**: *(leave empty)*
