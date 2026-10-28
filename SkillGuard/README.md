# SkillGuard — AI & Machine Learning Course Management System

A full-stack MERN college project based on the uploaded CourseManagement reference. It includes admin-managed courses and lessons, student enrollment/progress, timed MCQ exams, server-side grading, browser-level anti-copy/paste restrictions, focus-loss/activity logging, and PDF certificates with QR verification.

## Requirements
- Node.js 18+ and npm
- MongoDB local installation or a MongoDB Atlas database

## Setup
1. Extract the ZIP and open the `SkillGuard` folder in VS Code. Open a terminal in `app/server`.
2. Run `npm install`.
3. Copy `app/server/.env.example` to `app/server/.env`. Set `MONGODB_URI` to your Atlas URI including `/skillguard` (or the database name you intend to use), and set a long random `JWT_SECRET`. The ZIP intentionally does not include your private `.env` file.
4. Run `npm run seed` once against an empty database to create demo users and starter AI/ML courses. The seed script intentionally stops if users or courses already exist; do not delete existing data to rerun it.
5. Run `npm run dev` in the server terminal.
6. Open a second terminal in `app/client`; run `npm install`, then `npm run dev`.
7. Visit http://localhost:5173.

## Demo accounts
- Admin: `admin@skillguard.com` / `adminpassword123`
- Student: `rohan@student.com` / `studentpassword123`

Change demo passwords and the JWT secret before deploying. Do not use demo credentials in production.

## Key features
- Admin creates and edits courses with modules and lessons.
- Students register, enroll, complete lessons and view progress.
- Admin Exam Builder creates timed multiple-choice assessments with pass marks and attempt limits.
- Exam questions are served without the answer key; grading happens on the server.
- Copy, cut, paste, context-menu and tab visibility events are blocked/detected in the exam UI and logged to the backend.
- Exam deadlines are checked by the server; the client timer is not trusted for grading.
- Certificate eligibility requires a passed exam and 100% course lesson progress. One certificate per student/course is stored.
- PDF certificate includes a QR code and unique certificate ID; the public verification page is `/verify/:certificateId`.
- Admin can review recent exam activity at `/admin/exams`.

## API overview
- `POST /api/exams` (Admin) create exam
- `GET /api/exams/course/:courseId` list exams for a course
- `GET /api/exams/:examId` retrieve safe exam questions
- `POST /api/exams/:examId/start` start/resume attempt
- `POST /api/exams/:examId/activity` log activity
- `POST /api/exams/attempt/:attemptId/submit` server-side grading
- `POST /api/exams/attempt/:attemptId/certificate` issue eligible certificate
- `GET /api/exams/mine/certificates` list own certificates
- `GET /api/certificates/:certificateId/pdf` download certificate PDF
- `GET /api/exams/verify/:certificateId` verify certificate metadata

## Important security limitations
Browser-only controls cannot guarantee that a student cannot copy information, take screenshots, use another device, or bypass browser restrictions. SkillGuard treats them as deterrents and records events rather than claiming perfect prevention. For high-stakes proctoring, use institutionally approved secure-browser/proctoring tools and privacy notices.
