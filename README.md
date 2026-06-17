# Authify — Spring Boot + React Authentication System

A full-stack authentication system built with **Spring Boot** (backend) and **React + Vite** (frontend), featuring JWT-based login, email/password registration, OTP email verification, and OTP-based password reset via Brevo SMTP.

---

## Features

- **User Registration** — Register with name, email, and password (BCrypt hashed)
- **JWT Login** — Secure login with HttpOnly cookie-based JWT
- **Email Verification** — 6-digit OTP sent via Brevo SMTP to verify account
- **Password Reset** — OTP-based password reset flow (15-minute expiry)
- **Protected Routes** — Spring Security stateless filter chain with custom entry point
- **Logout** — Clears JWT cookie server-side
- **HTML Email Templates** — Thymeleaf-rendered welcome, OTP, and password reset emails

---

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Java 21 + Spring Boot 4.x | Application framework |
| Spring Security | Authentication & authorization |
| Spring Data JPA + Hibernate | ORM / database access |
| MySQL | Relational database |
| JJWT (0.9.1) | JWT generation & validation |
| Spring Mail + Brevo SMTP | Transactional email delivery |
| Thymeleaf | HTML email templating |
| Lombok | Boilerplate reduction |
| Maven | Build tool |

### Frontend
| Technology | Purpose |
|---|---|
| React 19 + Vite 8 | UI framework & dev server |
| React Router DOM v7 | Client-side routing |
| Axios | HTTP client |
| Bootstrap 5 + Bootstrap Icons | Styling |
| React Toastify | Notification toasts |

---

## Project Structure

```
├── Backend/
│   └── src/main/java/edu/bootcamp/authSys/
│       ├── config/          # SecurityConfig, CustomAuthenticationEntryPoint
│       ├── controller/      # AuthController, ProfileController
│       ├── dto/             # Request/Response DTOs
│       ├── entity/          # UserEntity (JPA)
│       ├── filter/          # JwtRequestFilter
│       ├── repositoy/       # UserRepository
│       ├── service/         # ProfileService, EmailService
│       └── util/            # JwtUtil
│   └── src/main/resources/
│       ├── application.yaml
│       └── templates/       # Thymeleaf email templates
│
└── Frontend/
    └── src/
        ├── components/      # Menubar, Header
        ├── context/         # AppContext (global state)
        ├── pages/           # Home, Login, EmailVerify, ResetPassword
        └── util/            # constants.js
```

---

## API Endpoints

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| POST | `/api/v1/register` | No | Register new user |
| POST | `/api/v1/login` | No | Login, sets JWT cookie |
| POST | `/api/v1/logout` | No | Clears JWT cookie |
| GET | `/api/v1/is-authenticated` | Yes | Check auth status |
| GET | `/api/v1/profile` | Yes | Get current user profile |
| POST | `/api/v1/send-reset-otp?email=` | No | Send password reset OTP |
| POST | `/api/v1/reset-password` | No | Reset password with OTP |
| POST | `/api/v1/send-otp` | Yes | Send email verification OTP |
| POST | `/api/v1/verify-otp` | Yes | Verify email with OTP |

---

## Getting Started

### Prerequisites
- Java 21
- Node.js 20+
- MySQL 8+
- A [Brevo](https://www.brevo.com) account for SMTP

### Backend Setup

1. Clone the repository and navigate to the `Backend/` directory.

2. Create the MySQL database (auto-created on first run if it doesn't exist):
   ```
   authsysapp
   ```

3. Set the required environment variable:
   ```bash
   export SMTP_PASSWORD=your_brevo_smtp_password
   ```

4. Run the application:
   ```bash
   ./mvnw spring-boot:run
   ```

   The backend starts on `http://localhost:8080`.

### Frontend Setup

1. Navigate to the `Frontend/` directory.

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the dev server:
   ```bash
   npm run dev
   ```

   The frontend starts on `http://localhost:5173`.

---

## Configuration

Key settings in `Backend/src/main/resources/application.yaml`:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/authsysapp?createDatabaseIfNotExist=true
    username: root
    password: root
  mail:
    host: smtp-relay.brevo.com
    port: 587
    username: <your-brevo-smtp-login>
    password: ${SMTP_PASSWORD}

jwt:
  secret:
    key: thisismyjwtsecretkey  # Change this in production!
```

> **Note:** Replace the JWT secret with a strong random key before deploying to production.

---

## Authentication Flow

```
Register → Login → JWT issued (HttpOnly cookie)
                         ↓
              Protected routes via JwtRequestFilter
                         ↓
         Optional: Verify email via OTP
         Optional: Reset password via OTP
```

---

## License

This project is intended for educational and portfolio purposes.
