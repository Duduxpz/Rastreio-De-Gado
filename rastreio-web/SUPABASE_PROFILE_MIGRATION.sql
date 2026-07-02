-- Migração para armazenar o nome da fazenda por usuário no Supabase
-- Execute no SQL Editor do Supabase

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  farm_name text not null default 'Minha Fazenda',
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy if not exists "profiles_select_own"
  on public.profiles
  for select
  using (auth.uid() = id);

create policy if not exists "profiles_insert_own"
  on public.profiles
  for insert
  with check (auth.uid() = id);

create policy if not exists "profiles_update_own"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, farm_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'farm_name', 'Minha Fazenda')
  )
on conflict (id) do nothing;
  return new;
end;
$$;

create or replace trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
