# AI Lecture Notes Generator 🎓

> **"Turn lectures into learning."**
> A modern full-stack web application designed for university students to convert PDF lecture slides and class transcripts into structured study notes, key definitions, exam preparation questions, and interactive quizzes.

---

## 🚀 Key Features

1. **User Authentication & Isolation**
   - Secure student registration and login with BCrypt password hashing.
   - Cryptographic token authentication and strict user-data isolation.

2. **Lecture Document Processing**
   - **Upload PDF**: Native text extraction via Apache PDFBox 3.x with password protection detection and image-only PDF detection.
   - **Paste Text**: Direct pasting of lecture transcripts, textbook excerpts, and class notes.
   - Three customizable generation styles: *Quick Revision*, *Detailed Notes*, and *Exam Preparation*.

3. **Intelligent Notes Generation**
   - **Live AI Mode**: Supports OpenAI or any OpenAI-compatible API (e.g., DeepSeek, Groq, Ollama, Azure OpenAI).
   - **Demo Mode**: 100% deterministic, high-yield rule-based extraction when no AI API key is configured.
   - Produces Executive Summaries, Structured Module Headings, Key Concepts, Terminology & Definitions, Exam Questions, and Multiple-Choice Questions (MCQs).

4. **Interactive Practice Quizzes**
   - Server-side score calculation and tamper-proof verification.
   - Question-by-question navigation with progress tracking.
   - Comprehensive review showing score percentage, correct answers, and explanations.

5. **Context-Bound AI Chat**
   - Ask clarifying questions directly against any saved lecture note.
   - Answers are strictly grounded in your selected lecture material.

6. **Export & Library Management**
   - One-click clipboard copy.
   - Download notes as formatted `.txt` files.
   - Searchable personal study library with deletion confirmation.

---

## 📁 Project Structure

```text
ai-lecture-notes-generator/
├── backend/
│   ├── src/main/java/com/ailecturenotes/
│   │   ├── config/            # WebMvcConfig, SecurityBeansConfig
│   │   ├── controller/        # Auth, Note, Chat, Quiz, Dashboard, Health
│   │   ├── dto/               # Typed Request and Response DTOs
│   │   ├── entity/            # User, Note, QuizResult JPA entities
│   │   ├── exception/         # Centralized GlobalExceptionHandler
│   │   ├── repository/        # Spring Data JPA repositories
│   │   ├── security/          # HMAC-SHA256 TokenService & AuthInterceptor
│   │   ├── service/           # AuthService, NoteService, AiService, QuizService, etc.
│   │   └── AiLectureNotesApplication.java
│   ├── src/main/resources/
│   │   └── application.properties
│   ├── pom.xml
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/        # ProtectedRoute, UI components
│   │   ├── context/           # AuthContext (user, session state)
│   │   ├── layouts/           # DashboardLayout with responsive sidebar
│   │   ├── pages/             # Landing, Login, Signup, Dashboard, Generate, Notes, Quiz, Chat, Settings
│   │   ├── services/          # Axios api client with token interceptor
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── nginx.conf
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🛠️ Prerequisites

- **Java JDK 17+** (JDK 17, 21, or 25)
- **Apache Maven 3.8+**
- **Node.js 18+** & **npm**
- *(Optional)* **Docker & Docker Compose** for containerized execution
- *(Optional)* **PostgreSQL 14+** (H2 in-memory is enabled by default for zero-config local development)

---

## 💻 1. How to Run the Backend Locally

```bash
cd backend

# Option A: Run directly using Maven
mvn spring-boot:run

# Option B: Build and run the packaged jar
mvn clean package -DskipTests
java -jar target/ai-lecture-notes-generator-1.0.0.jar
```

The backend server starts on port `8080`.
Verify health by visiting: `http://localhost:8080/api/health`

---

## 🎨 2. How to Run the Frontend Locally

```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

The frontend will start at `http://localhost:5173`.
All requests to `/api` are automatically proxied to `http://localhost:8080`.

---

## 🐘 3. How to Configure PostgreSQL

By default, the application runs on an in-memory H2 database for local convenience. To connect to PostgreSQL (locally or in production):

Set the following environment variables:
```bash
DATABASE_URL=jdbc:postgresql://localhost:5432/ailecturedb
DATABASE_DRIVER=org.postgresql.Driver
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_postgres_password
JPA_DIALECT=org.hibernate.dialect.PostgreSQLDialect
```

---

## 🤖 4. How to Configure the AI API

The application supports any OpenAI-compatible API endpoint (OpenAI, DeepSeek, Groq, Ollama, etc.):

```bash
# In your terminal or deployment environment variables:
AI_API_KEY=sk-your-openai-api-key
AI_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-4o-mini
```

---

## 💡 5. How to Use Demo Mode (No API Key Required)

If `AI_API_KEY` is not provided or is left blank:
- The backend automatically engages **Demo Mode**.
- Generated study notes, summaries, key terms, definitions, and multiple-choice questions are extracted deterministically using rule-based algorithms directly from the provided text.
- Generated content is transparently labeled in the UI as **Rule-Based Demo Mode**.
- AI Chat uses keyword relevance search to answer questions using verbatim lecture citations.

---

## 🐳 6. Running with Docker Compose

Run the entire stack (PostgreSQL + Spring Boot + React/Nginx) with a single command:

```bash
docker-compose up --build
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8080`
- PostgreSQL: `localhost:5432`

---

## ☁️ 7. Recommended Production Deployment

### Backend (Render / Railway / Fly.io / AWS ECS)
1. Deploy the `backend/` directory as a Docker service or Java service.
2. Configure the following environment variables in your cloud provider:
   - `PORT=8080`
   - `DATABASE_URL=jdbc:postgresql://<db-host>:<port>/<db-name>?sslmode=require`
   - `DATABASE_USERNAME=<user>`
   - `DATABASE_PASSWORD=<password>`
   - `FRONTEND_URL=https://your-frontend-domain.vercel.app`
   - `JWT_SECRET=<random-64-character-string>`
   - `AI_API_KEY=<optional-openai-key>`

### Frontend (Vercel / Netlify / Cloudflare Pages)
1. Set the root directory to `frontend`.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Set environment variable:
   - `VITE_API_BASE_URL=https://your-backend-domain.onrender.com/api`

---

## 🧪 8. Verification & Testing Completed

- [x] **Spring Boot Compilation & Context Load**: Maven tests completed with 0 errors.
- [x] **React Production Build**: Vite built `dist/` with 0 errors.
- [x] **Authentication**: Registration, Login, Token generation, and `/api/auth/me` user isolation verified.
- [x] **Notes Generation**: PDF text extraction and Text paste generation tested with Demo Mode fallback.
- [x] **Quiz Verification**: Server-side grading, question delivery with hidden answer keys, and score persistence tested.
- [x] **CORS & Security**: CORS restricted, password hashing with BCrypt active, and sensitive DTO filtering active.
