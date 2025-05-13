```md
# AutoApply AI Platform

This project aims to build an AI-driven job application automation platform, inspired by ApplyHero.ai.

## Tech Stack

*   **Frontend:** React, TypeScript, Vite, Shadcn UI, Tailwind CSS
*   **Backend:** Node.js, Express, TypeScript
*   **AI:** Google Gemini API
*   **Database & Auth:** Supabase (PostgreSQL)
*   **Payments:** Stripe (to be implemented)
*   **Browser Extension:** (to be implemented)

## Project Structure

*   `/src`: Frontend React application.
*   `/server`: Backend Node.js/Express application.
*   `/public`: Static assets for the frontend.

## Getting Started

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Set up Environment Variables:**
    Create a `.env` file in the root directory and populate it with your Supabase and Gemini API keys, and a JWT secret. See `.env.example` (if provided, otherwise create based on `.env` content in this artifact).

    ```
    SUPABASE_URL=YOUR_SUPABASE_URL
    SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    GEMINI_API_KEY=YOUR_GEMINI_API_KEY
    JWT_SECRET=your-super-secret-jwt-key
    ```
    **IMPORTANT**: Remember to connect to your Supabase project via the chat interface in WebContainer for database operations to work.

3.  **Run Development Servers:**

    *   **Frontend (Vite):**
        ```bash
        npm run dev
        ```
        This will typically start the frontend on `http://localhost:5173`.

    *   **Backend (Node/Express):**
        In a new terminal:
        ```bash
        npm run server:dev
        ```
        This will typically start the backend API on `http://localhost:5001`.

4.  **Build for Production:**
    *   **Frontend:**
        ```bash
        npm run build
        ```
    *   **Backend:**
        ```bash
        npm run build:server
        ```
        Then run the compiled server:
        ```bash
        npm run server:start
        ```

## Key Features (Planned)

*   Multi-Platform Auto-Apply
*   AI Resume/Cover Letter Generation (using Gemini)
*   Browser Extension
*   User Dashboard
*   Admin Dashboard
*   Authentication & User Management (Supabase)
*   Payment Integration (Stripe)
*   Email Notifications & Logging

## Development Notes

*   The backend API is proxied through Vite's dev server at `/api`.
*   Supabase is used for authentication and database. Ensure your Supabase project is set up and environment variables are correct.
```
