CREATE OR REPLACE FUNCTION public.check_profile_updates()
RETURNS TRIGGER AS $$
DECLARE
    current_user_role TEXT;
BEGIN
    IF auth.uid() IS NOT NULL THEN
        SELECT role INTO current_user_role FROM public.profiles WHERE id = auth.uid();

        IF current_user_role IS NULL OR current_user_role != 'admin' THEN
            NEW.role := OLD.role;
            NEW.status := OLD.status;
            NEW.classroom_id := OLD.classroom_id;
            NEW.points := OLD.points;
            NEW.tier := OLD.tier;
            NEW.student_id_code := OLD.student_id_code;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.check_profile_insert()
RETURNS TRIGGER AS $$
BEGIN
    IF auth.uid() IS NOT NULL THEN
        NEW.role := 'student';
        NEW.status := 'pending';
        NEW.points := 500;
        NEW.tier := 'Class C • Regular';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_profiles_insert_protection
    BEFORE INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.check_profile_insert();
