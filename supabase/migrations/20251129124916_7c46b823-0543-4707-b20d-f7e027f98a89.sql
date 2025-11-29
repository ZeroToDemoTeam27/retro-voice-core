-- Add unique constraint to username column to prevent duplicates
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_username_unique UNIQUE (username);

-- Create index for faster username lookups during login
CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles(username);