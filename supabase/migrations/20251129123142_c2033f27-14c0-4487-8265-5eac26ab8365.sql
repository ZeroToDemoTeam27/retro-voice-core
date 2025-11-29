-- Create profiles table
create table public.profiles (
  id uuid not null references auth.users(id) on delete cascade primary key,
  email text,
  username text,
  avatar_url text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Create policies for profiles table
create policy "Users can view their own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles
  for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles
  for insert
  with check (auth.uid() = id);

-- Create function to handle new user creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, username)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

-- Create trigger to automatically create profile on user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Create function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Create trigger for updated_at on profiles
create trigger on_profile_updated
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();