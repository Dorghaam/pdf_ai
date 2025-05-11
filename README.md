# PDF Chat Application

A Next.js application that allows users to upload PDF documents and have interactive, AI-powered conversations about their content.

## Features

- 📄 PDF uploading and processing
- 🔍 Extract text content from PDFs
- 💬 Chat with PDFs using OpenAI
- 🧠 Retrieval-Augmented Generation (RAG)
- 🔒 Authentication using Supabase
- 📊 Document management

## Tech Stack

- **Frontend**: Next.js 15, React, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API routes, Vercel Edge Runtime
- **Database**: Supabase (PostgreSQL with pgvector)
- **AI**: OpenAI GPT-4o and Embeddings API
- **Authentication**: Supabase Auth
- **Storage**: Vercel Blob Storage
- **Styling**: Tailwind CSS

## Local Development Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd <your-repo-name>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    - Copy `.env.example` to `.env.local`:
      ```bash
      cp .env.example .env.local
      ```
    - Fill in the required values in `.env.local` (Supabase URL/keys, OpenAI API key).
    - For Vercel Blob local development, run `npx vercel login`, then `npx vercel link` to link your project, and finally `npx vercel env pull .env.development.local` to pull cloud environment variables including `BLOB_READ_WRITE_TOKEN`. Update `.env.local` if this creates a new file.

4.  **Set up Supabase:**
    - Go to your Supabase project dashboard.
    - In the SQL Editor, create a new query and run the contents of `supabase/migrations/0000_initial_schema.sql` to set up tables, pgvector, and RLS policies.
    - Ensure you have enabled the `vector` extension in Supabase (Database > Extensions).

5.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The app should now be running on `http://localhost:3000`.

## Required Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase project anon key.
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase project service role key (keep secret, for server-side admin tasks).
- `OPENAI_API_KEY`: Your OpenAI API key.
- `BLOB_READ_WRITE_TOKEN`: (For local Vercel Blob usage) Your Vercel Blob read/write token.

## Architecture

The application uses a Next.js App Router structure with the following components:

1. **Upload Flow**:
   - User uploads a PDF file
   - File is stored in Vercel Blob Storage
   - Metadata is recorded in Supabase
   - Backend processes the PDF (text extraction, chunking, embedding generation)
   - Chunks and embeddings are stored in Supabase pgvector

2. **Chat Flow**:
   - User sends a query about a document
   - System retrieves relevant chunks using vector similarity search
   - OpenAI API generates a response based on the relevant context
   - Response is streamed back to the user

## Deployment

This application is designed to be deployed on Vercel. Connect your GitHub repository to Vercel and set the required environment variables in the Vercel dashboard.