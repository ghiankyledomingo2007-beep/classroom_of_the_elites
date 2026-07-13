-- Create merit_claims table
CREATE TABLE IF NOT EXISTS public.merit_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    points_requested INTEGER NOT NULL CHECK (points_requested > 0 AND points_requested <= 500),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.merit_claims ENABLE ROW LEVEL SECURITY;

-- Policies for merit_claims
CREATE POLICY "Students can view their own claims"
    ON public.merit_claims FOR SELECT
    USING (auth.uid() = profile_id);

CREATE POLICY "Students can insert their own claims"
    ON public.merit_claims FOR INSERT
    WITH CHECK (auth.uid() = profile_id AND status = 'pending');

CREATE POLICY "Admins can view all claims"
    ON public.merit_claims FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update all claims"
    ON public.merit_claims FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Trigger to automatically update profile points and tier when a claim is approved
CREATE OR REPLACE FUNCTION public.handle_merit_claim_update()
RETURNS TRIGGER AS $$
DECLARE
    current_points INTEGER;
    new_tier TEXT;
BEGIN
    -- If status transitioned from 'pending' to 'approved'
    IF OLD.status = 'pending' AND NEW.status = 'approved' THEN
        -- 1. Increment points in profiles
        UPDATE public.profiles
        SET points = COALESCE(points, 0) + NEW.points_requested
        WHERE id = NEW.profile_id
        RETURNING points INTO current_points;

        -- 2. Determine new tier based on points
        IF current_points >= 1500 THEN
            new_tier := 'Class A • Elite';
        ELSIF current_points >= 1000 THEN
            new_tier := 'Class B • Advanced';
        ELSIF current_points >= 500 THEN
            new_tier := 'Class C • Regular';
        ELSE
            new_tier := 'Class D • Deficient';
        END IF;

        -- 3. Update the tier in profiles
        UPDATE public.profiles
        SET tier = new_tier
        WHERE id = NEW.profile_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_handle_merit_claim_approval
    AFTER UPDATE ON public.merit_claims
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_merit_claim_update();
