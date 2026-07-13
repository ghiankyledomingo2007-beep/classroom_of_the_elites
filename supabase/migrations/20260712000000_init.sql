-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------
-- 1. Create Tables
-- ----------------------------------------------------

-- Classrooms Table
CREATE TABLE public.classrooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    school_name TEXT NOT NULL,
    school_year TEXT NOT NULL,
    section_name TEXT NOT NULL,
    invitation_code_hash TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Profiles Table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY, -- Will match auth.users.id
    classroom_id UUID REFERENCES public.classrooms(id) ON DELETE SET NULL,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    nickname TEXT,
    username TEXT UNIQUE NOT NULL,
    bio TEXT,
    about TEXT,
    birthday DATE,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'deactivated')),
    favorite_subjects TEXT[] DEFAULT '{}',
    interests TEXT[] DEFAULT '{}',
    hobbies TEXT[] DEFAULT '{}',
    skills TEXT[] DEFAULT '{}',
    achievements TEXT[] DEFAULT '{}',
    github_url TEXT,
    linkedin_url TEXT,
    portfolio_url TEXT,
    website_url TEXT,
    profile_accent TEXT NOT NULL DEFAULT 'indigo' CHECK (profile_accent IN ('indigo', 'blue', 'violet', 'rose', 'emerald', 'orange')),
    show_birthday BOOLEAN NOT NULL DEFAULT false,
    show_external_links BOOLEAN NOT NULL DEFAULT true,
    show_achievements BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Projects Table
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    technologies TEXT[] DEFAULT '{}',
    github_url TEXT,
    live_url TEXT,
    project_date DATE,
    is_visible BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Announcements Table
CREATE TABLE public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    classroom_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Reports Table
CREATE TABLE public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    classroom_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
    reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reported_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    details TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewing', 'resolved', 'dismissed')),
    admin_notes TEXT,
    resolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    resolved_at TIMESTAMPTZ
);

-- ----------------------------------------------------
-- 2. Indexes for Quick Querying
-- ----------------------------------------------------
CREATE INDEX idx_profiles_classroom ON public.profiles(classroom_id);
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_status ON public.profiles(status);
CREATE INDEX idx_projects_profile ON public.projects(profile_id);
CREATE INDEX idx_announcements_classroom ON public.announcements(classroom_id);
CREATE INDEX idx_reports_classroom ON public.reports(classroom_id);
CREATE INDEX idx_reports_status ON public.reports(status);

-- ----------------------------------------------------
-- 3. Automatic updated_at triggers
-- ----------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_classrooms_updated_at BEFORE UPDATE ON public.classrooms FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trigger_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trigger_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trigger_announcements_updated_at BEFORE UPDATE ON public.announcements FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------
-- 4. Trigger to protect role/status/classroom_id escalation
-- ----------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_profile_updates()
RETURNS TRIGGER AS $$
DECLARE
    current_user_role TEXT;
BEGIN
    -- Only check if this is performed by an authenticated database session
    IF auth.uid() IS NOT NULL THEN
        -- Get the role of the user performing the update
        SELECT role INTO current_user_role FROM public.profiles WHERE id = auth.uid();
        
        -- If the user is NOT an admin, they cannot change role, status, or classroom_id
        IF current_user_role IS NULL OR current_user_role != 'admin' THEN
            NEW.role := OLD.role;
            NEW.status := OLD.status;
            NEW.classroom_id := OLD.classroom_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_profiles_escalation_protection
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.check_profile_updates();

-- ----------------------------------------------------
-- 5. Row Level Security (RLS) Configuration
-- ----------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Classrooms Policies
CREATE POLICY "Allow anyone to read classrooms (needed for signup verification)"
    ON public.classrooms FOR SELECT
    USING (true);

CREATE POLICY "Allow admins to insert/update classrooms"
    ON public.classrooms FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Profiles Policies
CREATE POLICY "Allow users to read their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Allow approved students to read approved profiles in same classroom"
    ON public.profiles FOR SELECT
    USING (
        status = 'approved' AND 
        classroom_id = (SELECT classroom_id FROM public.profiles WHERE id = auth.uid()) AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND status = 'approved'
        )
    );

CREATE POLICY "Allow admins to read any profile in their classroom"
    ON public.profiles FOR SELECT
    USING (
        classroom_id = (SELECT classroom_id FROM public.profiles WHERE id = auth.uid()) AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Allow users to insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow users to update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow admins to update any profile in their classroom"
    ON public.profiles FOR UPDATE
    USING (
        classroom_id = (SELECT classroom_id FROM public.profiles WHERE id = auth.uid()) AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Projects Policies
CREATE POLICY "Allow users to read their own projects"
    ON public.projects FOR SELECT
    USING (profile_id = auth.uid());

CREATE POLICY "Allow approved students to read visible projects in their classroom"
    ON public.projects FOR SELECT
    USING (
        is_visible = true AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND status = 'approved' AND classroom_id = (
                SELECT classroom_id FROM public.profiles WHERE id = projects.profile_id
            )
        )
    );

CREATE POLICY "Allow admins to read any project in their classroom"
    ON public.projects FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin' AND classroom_id = (
                SELECT classroom_id FROM public.profiles WHERE id = projects.profile_id
            )
        )
    );

CREATE POLICY "Allow approved students to create their own projects"
    ON public.projects FOR INSERT
    WITH CHECK (
        profile_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND status = 'approved'
        )
    );

CREATE POLICY "Allow users to update/delete their own projects"
    ON public.projects FOR UPDATE
    USING (profile_id = auth.uid())
    WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Allow users to delete their own projects"
    ON public.projects FOR DELETE
    USING (profile_id = auth.uid());

CREATE POLICY "Allow admins to moderate (update/delete) projects in their classroom"
    ON public.projects FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin' AND classroom_id = (
                SELECT classroom_id FROM public.profiles WHERE id = projects.profile_id
            )
        )
    );

CREATE POLICY "Allow admins to delete projects in their classroom"
    ON public.projects FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin' AND classroom_id = (
                SELECT classroom_id FROM public.profiles WHERE id = projects.profile_id
            )
        )
    );

-- Announcements Policies
CREATE POLICY "Allow approved students to read announcements in their classroom"
    ON public.announcements FOR SELECT
    USING (
        classroom_id = (SELECT classroom_id FROM public.profiles WHERE id = auth.uid()) AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND status = 'approved'
        )
    );

CREATE POLICY "Allow admins to read announcements in their classroom"
    ON public.announcements FOR SELECT
    USING (
        classroom_id = (SELECT classroom_id FROM public.profiles WHERE id = auth.uid()) AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Allow admins to manage announcements"
    ON public.announcements FOR ALL
    USING (
        classroom_id = (SELECT classroom_id FROM public.profiles WHERE id = auth.uid()) AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Reports Policies
CREATE POLICY "Allow reporter to view their own reports"
    ON public.reports FOR SELECT
    USING (reporter_id = auth.uid());

CREATE POLICY "Allow admins to view reports in their classroom"
    ON public.reports FOR SELECT
    USING (
        classroom_id = (SELECT classroom_id FROM public.profiles WHERE id = auth.uid()) AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Allow approved students to create reports"
    ON public.reports FOR INSERT
    WITH CHECK (
        reporter_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND status = 'approved'
        )
    );

CREATE POLICY "Allow admins to update reports"
    ON public.reports FOR UPDATE
    USING (
        classroom_id = (SELECT classroom_id FROM public.profiles WHERE id = auth.uid()) AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
