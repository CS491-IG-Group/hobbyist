# hobbyist

## Local setup

1. **Clone and install**
   ```bash
   npm install
   ```

2. **Environment variables**  
   Create a `.env.local` in the project root (this file is gitignored; everyone needs their own).

   - Copy from the example:
     ```bash
     cp .env.example .env.local
     ```
   - Or create `.env.local` manually with:
     ```
     # Supabase (get these from your Supabase project: Project Settings → API)
     NEXT_PUBLIC_SUPABASE_URL=
     NEXT_PUBLIC_SUPABASE_ANON_KEY=
     ```
   - Get the values from your Supabase project:
     - [Supabase Dashboard](https://supabase.com/dashboard) → your project → **Project Settings** → **API**
     - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
     - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Paste them into `.env.local` (no quotes needed).

3. **Run the app**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000). Sign up or log in with any email/password (Supabase Auth).
