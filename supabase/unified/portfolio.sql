-- =====================================================================
--  UNIFICACIÓN — Porfolio_Nico_V2 dentro del proyecto Supabase
--  compartido "Caramesgarcianico" (ref rucrcjcizdbsdrqmrcon).
--
--  Estado real hoy: el repo es solo mockups de diseño (ver CLAUDE.md);
--  el código real (Vite + React) aún no está scaffoldeado y no hay
--  ninguna feature de backend decidida todavía. Por eso este archivo NO
--  inventa tablas de negocio (contacto, proyectos, etc.) — sería
--  diseñar sobre requisitos hipotéticos. Solo deja preparado el schema
--  `portfolio` y el andamiaje mínimo de perfil para que, en cuanto la
--  app tenga login, comparta el mismo auth.users que el resto de apps
--  del proyecto unificado.
--
--  Idempotente y aditivo. Amplíalo con las tablas reales cuando la app
--  se scaffoldee y sus features de backend se decidan.
-- =====================================================================

create schema if not exists portfolio;

create table if not exists portfolio.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
alter table portfolio.profiles enable row level security;

drop policy if exists "profiles_select_own" on portfolio.profiles;
create policy "profiles_select_own" on portfolio.profiles for select using (auth.uid() = id);
drop policy if exists "profiles_insert_own" on portfolio.profiles;
create policy "profiles_insert_own" on portfolio.profiles for insert with check (auth.uid() = id);
drop policy if exists "profiles_update_own" on portfolio.profiles;
create policy "profiles_update_own" on portfolio.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
drop policy if exists "profiles_delete_own" on portfolio.profiles;
create policy "profiles_delete_own" on portfolio.profiles for delete using (auth.uid() = id);

create or replace function portfolio.handle_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists set_profiles_updated_at on portfolio.profiles;
create trigger set_profiles_updated_at before update on portfolio.profiles
  for each row execute function portfolio.handle_updated_at();

-- Trigger con nombre único sobre auth.users (varias apps del proyecto
-- unificado enganchan su propio handle_new_user al mismo auth.users).
create or replace function portfolio.handle_new_user()
returns trigger
language plpgsql security definer set search_path = portfolio as $$
begin
  insert into portfolio.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created_portfolio on auth.users;
create trigger on_auth_user_created_portfolio
  after insert on auth.users
  for each row execute function portfolio.handle_new_user();

-- =====================================================================
-- FASE 2 / futuro: cuando la app se scaffoldee (Vite + React) y se
-- decidan sus features reales (chat interno, formulario de contacto...),
-- añadir aquí sus tablas siguiendo el mismo patrón que
-- Desktop_Nav/supabase/unified/desktop_nav.sql (schema propio, RLS,
-- bucket con prefijo 'portfolio-...' si hace falta Storage).
-- =====================================================================
