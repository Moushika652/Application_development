# Login and Registration App

**Morrow** is a small React application with account registration, sign-in, form validation, and a signed-in dashboard. Its warm, split-screen interface adapts for smaller screens.

## Run locally

1. Open a terminal in this folder.
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Open the local URL printed in the terminal (Vite normally uses `http://localhost:5173`).

Create an account first, then use the same email and password to sign in. The app saves demo account data in this browser's local storage. Passwords are hashed with the browser's Web Crypto API before they are saved.

## Important

This is a front-end learning demo, not production authentication. Browser storage can be viewed or cleared by the browser user; there is no server, database, password reset, or real session security. Do not use a real password or sensitive personal information.
