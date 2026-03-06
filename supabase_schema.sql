-- ========================================================
-- SUPABASE SCHEMA FOR HEALTHCARE APP
-- Run this entire script in the Supabase SQL Editor
-- ========================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create custom enum types
CREATE TYPE user_role AS ENUM ('patient', 'doctor', 'admin');
CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE appointment_status AS ENUM ('booked', 'cancelled', 'completed');

-- 2. Create Profiles Table (extends the Supabase auth.users table)
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  role user_role DEFAULT 'patient'::user_role NOT NULL,
  avatar_url text,
  phone text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Function to handle new user signups and automatically create a profile entry
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'patient'::user_role)
  );
  RETURN new;
END;
$$;

-- Trigger to call the handle_new_user function whenever a user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 3. Create Doctors Table
CREATE TABLE public.doctors (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  specialization text NOT NULL,
  qualification text NOT NULL,
  experience integer NOT NULL DEFAULT 0,
  fees numeric(10,2) NOT NULL DEFAULT 0.00,
  location text NOT NULL,
  clinic_address text NOT NULL,
  license_number text NOT NULL UNIQUE,
  verification_status verification_status DEFAULT 'pending'::verification_status NOT NULL,
  rating numeric(3,2) DEFAULT 0.00,
  review_count integer DEFAULT 0,
  bio text,
  availability jsonb DEFAULT '[]'::jsonb, -- Array of TimeSlot objects
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Appointments Table
CREATE TABLE public.appointments (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  doctor_id uuid REFERENCES public.doctors(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  time_slot text NOT NULL,
  status appointment_status DEFAULT 'booked'::appointment_status NOT NULL,
  queue_number integer,
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Prevent double-booking constraint
CREATE UNIQUE INDEX idx_appointments_doctor_date_time 
ON public.appointments(doctor_id, date, time_slot) 
WHERE status = 'booked';


-- 5. Create Reviews Table
CREATE TABLE public.reviews (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  doctor_id uuid REFERENCES public.doctors(id) ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- 6. Create Messages Table
CREATE TABLE public.messages (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 2. Doctors Policies
CREATE POLICY "Doctor profiles are viewable by everyone" ON public.doctors
  FOR SELECT USING (true);

CREATE POLICY "Doctors can insert their own profile" ON public.doctors
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Doctors can update their own profile" ON public.doctors
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can update doctor approval status" ON public.doctors
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 3. Appointments Policies
CREATE POLICY "Users can view their own appointments" ON public.appointments
  FOR SELECT USING (
    auth.uid() = patient_id OR 
    auth.uid() = (SELECT user_id FROM public.doctors WHERE id = doctor_id) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Patients can insert appointments" ON public.appointments
  FOR INSERT WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Users can update their appointments (cancel/complete)" ON public.appointments
  FOR UPDATE USING (
    auth.uid() = patient_id OR 
    auth.uid() = (SELECT user_id FROM public.doctors WHERE id = doctor_id)
  );

-- 4. Reviews Policies
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Patients can insert reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = patient_id);

-- 5. Messages Policies
CREATE POLICY "Users can view their own messages" ON public.messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can mark received messages as read" ON public.messages
  FOR UPDATE USING (auth.uid() = receiver_id);

-- ========================================================
-- END OF SCRIPT
-- ========================================================
