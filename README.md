# ClassSpace MVP 🎓

**ClassSpace** is a secure, private classroom directory and student portfolio website MVP. It functions as an invitation-only yearbook and student showcase where classmates can create profiles, customize theme accents, manage projects, and communicate, under the supervision of classroom administrators.

---

## Key Features

1. **Invitation-Only Signup**: timing-safe hashed code verification matching classroom records.
2. **Private Directory**: directory access and profile details are restricted to approved members of the same classroom.
3. **Student Portfolios**: customizable accents, tag inputs (for skills, favorite subjects, hobbies), profile status, and optional field visibility.
4. **Project Showcases**: CRUD management for school/personal projects featuring image uploads, technologies, repository/live links, and visibility toggles.
5. **Classroom Announcements**: pins, expiration boundaries, and admin controls.
6. **Student Reporting (Flags)**: classmates can report profile violations; admins can resolve/dismiss flags and add moderation notes.
7. **Robust Admin Panel**: statistics overview, student approvals, content moderation shortcuts, announcements manager, classroom configuration, and timing-safe invitation code regeneration.

---

## Technology Stack

- **Framework**: Next.js 16 (App Router) with Turbopack compilation.
- **Languages**: TypeScript & Node.js.
- **Styling**: Tailwind CSS (v4) & Vanilla CSS.
- **Database, Auth & Storage**: Supabase (PostgreSQL with strict Row Level Security (RLS) policies, bucket storage, and edge JWT session validation).
- **Forms & Validation**: React Hook Form, @hookform/resolvers, and Zod.
- **Testing**: Vitest.

---

## Installation & Local Setup

### 1. Clone the Project
Navigate to the root directory `/home/ghiankylledomingo/Projects/classspace` in your local environment.

### 2. Install Dependencies
Run:
```bash
npm install
```

### 3. Configure Environment Variables
Create a local `.env` file at the root of the workspace. Use `.env.example` as a template:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-never-expose-to-client
INVITATION_CODE_SALT=your-TimingSafe-HMAC-SHA256-hash-salt
```

### 4. Supabase Database Schema
Execute the SQL script found at `supabase/migrations/20260712000000_init.sql` directly inside the **Supabase SQL Editor** to bootstrap your schema. It defines:
- The `classrooms`, `profiles`, `projects`, `announcements`, and `reports` tables.
- Row Level Security (RLS) policies preventing normal accounts from reading other classrooms or modifying other profiles.
- Trigger protections preventing normal student roles from escalating themselves to `admin` or changing their status/classroom.
- Automatic `updated_at` modification triggers.

### 5. Setup Storage Buckets
Create two public storage buckets in the Supabase Dashboard:
1. **`avatars`** (Used for student profile pictures)
2. **`projects`** (Used for project cover images and screenshots)

Make sure to enable public read access on both buckets so they can render in the browser. Add the following Supabase RLS Storage Policies on both buckets:
- **Select**: Allow authenticated users to read files.
- **Insert / Update / Delete**: Allow authenticated users to upload and modify files where `auth.uid() = owner` (or where prefix matches their user ID).

---

## Seeding Development Data

We have provided a fictional database seeder script. The seeder creates a sample classroom, registers auth credentials, hashes invitation codes, and seeds mock records (1 admin, 6 approved students, 2 pending students, projects, and active reports).

To execute the seed script:
```bash
node scripts/seed.js
```
*Note: Make sure your `.env` contains valid credentials, especially `SUPABASE_SERVICE_ROLE_KEY`, before running this script.*

### Fictional Login Credentials:
- **Administrator**: `admin@oakridge.edu` / `password123`
- **Approved Student**: `jane@oakridge.edu` / `password123`
- **Approved Student**: `john@oakridge.edu` / `password123`
- **Pending Student**: `sam@oakridge.edu` / `password123`

---

## How to Create the First Admin Account Manually

If you choose not to use the seed script, follow these steps to securely set up your initial Administrator account:
1. Register a normal account on the registration page (`/register`) using your classroom invite code.
2. Log into the **Supabase Dashboard** and navigate to the **Table Editor** -> `profiles` table.
3. Locate your profile row and modify:
   - `role` to `'admin'`
   - `status` to `'approved'`
4. Reload the application. You will now have access to the Admin Dashboard (`/admin`).

---

## Commands & Scripts

- **Development Server**: Launches local Next.js environment.
  ```bash
  npm run dev
  ```
- **Production Build**: Compiles code, runs TypeScript verification, and produces static build assets.
  ```bash
  npm run build
  ```
- **Testing**: Runs the Vitest unit tests verifying invitation timing calculations, profile progress scoring, and validation rules.
  ```bash
  npm run test
  ```

---

## MVP Limitations & Boundary Constraints

1. **Supabase Client Restrictions**: Normal student accounts are prevented from bypassing database triggers. An anti-escalation trigger (`trigger_profiles_escalation_protection`) automatically reverts updates to security columns (`role`, `status`, `classroom_id`) unless executed by the service-role client.
2. **Timing Attack Protection**: Invitation verification uses timing-safe equal buffers. This requires a stable `INVITATION_CODE_SALT` in your `.env`. Changing this salt will invalidate existing invitation hashes.
3. **No Direct Account Deletion via Client**: Students deleting their accounts will successfully remove their database profiles and projects via CASCADE, but deleting the actual Auth credential requires the Supabase Admin API. The Settings page securely invokes this using the Next.js Server Action with the Service Role key.
4. **File Size Filters**: Upload files are limited to 5MB and standard image formats (`.jpg`, `.png`, `.webp`) at the client boundary before uploading to storage.
