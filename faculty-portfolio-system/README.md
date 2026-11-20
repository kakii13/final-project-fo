# SorSU Faculty Portfolio Portal

A responsive Vite + React + TypeScript prototype for managing SorSU Bulan Campus faculty portfolios. Faculty accounts, profiles, and uploaded files are stored in the browser's local storage; authentication and role checks are development-only and must be replaced with a secured backend before production use.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. In Visual Studio Code, open this folder, run the commands in the integrated terminal, then use **Run and Debug** or the terminal to start the development server.

## Demo accounts

- Administrator: `admin@sorsu.edu.ph` / `admin123`
- Faculty member: `m.reyes@sorsu.edu.ph` / `faculty123`
- Other seeded faculty accounts use `faculty123`.

New faculty can register on the sign-in screen. Accounts created by administrators are assigned the temporary password `faculty123`.

## Features

- Role-aware navigation and dashboards for administrators and faculty
- Faculty CRUD, search, portfolio category document upload/replacement/removal, and progress indicators
- File validation for PDF, Word, Excel, JPG, and PNG documents up to 3 MB
- Local persistent data, analytics, department summaries, CSV report export, and print/PDF workflow
- Responsive layout for desktop and mobile

Uploaded file content is stored as data URLs in browser local storage. Browser storage is device-specific and is not a secure document repository. Use a backend, secure password handling, authorization, and managed file storage before production deployment.
