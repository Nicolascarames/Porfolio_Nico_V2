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
--  FASE 2 — Login/registro real + perfil con roles, vía la skill
--  /generar_login (kit Login-Registro-componente). El schema ya existía
--  (arriba) con un andamiaje mínimo sin roles — esto lo EXTIENDE
--  (conserva full_name, añade username/first_name/last_name/role) en
--  vez de sustituirlo, y reutiliza el trigger/función handle_new_user
--  ya existentes en vez de duplicarlos.
--
--  Idempotente y aditivo, igual que el resto del archivo.
-- =====================================================================

do $$ begin
  create type portfolio.app_role as enum ('user', 'mid', 'admin');
exception when duplicate_object then null;
end $$;

alter table portfolio.profiles
  add column if not exists username text unique,
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists role portfolio.app_role not null default 'user';

create or replace function portfolio.get_my_role()
returns portfolio.app_role
language sql security definer stable
set search_path = portfolio, public
as $$
  select role from portfolio.profiles where id = auth.uid();
$$;

create or replace function portfolio.is_admin()
returns boolean
language sql security definer stable
set search_path = portfolio, public
as $$
  select exists (
    select 1 from portfolio.profiles where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function portfolio.is_role_at_least(min_role portfolio.app_role)
returns boolean
language sql security definer stable
set search_path = portfolio, public
as $$
  select exists (
    select 1 from portfolio.profiles where id = auth.uid() and role >= min_role
  );
$$;

-- Reemplaza el cuerpo de la función YA existente (misma firma, mismo
-- trigger `on_auth_user_created_portfolio` de arriba la sigue usando)
-- para que además de full_name/avatar_url rellene username/nombre/rol.
create or replace function portfolio.handle_new_user()
returns trigger
language plpgsql security definer set search_path = portfolio as $$
begin
  insert into portfolio.profiles (id, full_name, avatar_url, username, first_name, last_name, role)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    split_part(new.email, '@', 1) || '_' || substr(new.id::text, 1, 6),
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    'user'
  )
  on conflict (id) do nothing;
  return new;
end; $$;

create or replace function portfolio.prevent_role_change()
returns trigger
language plpgsql security definer
set search_path = portfolio, public
as $$
begin
  if new.role is distinct from old.role and not portfolio.is_admin() then
    raise exception 'Only an admin can change a user role';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_role_change on portfolio.profiles;
create trigger enforce_role_change
  before update on portfolio.profiles
  for each row execute function portfolio.prevent_role_change();

-- RLS: el andamiaje original era todo self-only (select/update/delete
-- propios). El AdminPanel del kit necesita leer TODAS las filas y que
-- el rol tope pueda actualizar/borrar cualquiera — se ajustan aquí.
-- insert_own y update_own (self) se dejan tal cual, ya coinciden.
drop policy if exists "profiles_select_own" on portfolio.profiles;
create policy "profiles_select_all" on portfolio.profiles for select using (true);

drop policy if exists "profiles_update_admin" on portfolio.profiles;
create policy "profiles_update_admin" on portfolio.profiles for update using (portfolio.is_admin());

-- Antes permitía borrar la fila propia; el kit no ofrece esa acción
-- (solo el rol tope borra usuarios desde el AdminPanel) — se retira.
drop policy if exists "profiles_delete_own" on portfolio.profiles;
drop policy if exists "profiles_delete_admin" on portfolio.profiles;
create policy "profiles_delete_admin" on portfolio.profiles for delete using (portfolio.is_admin());

insert into storage.buckets (id, name, public)
values ('portfolio-avatars', 'portfolio-avatars', true)
on conflict (id) do nothing;

drop policy if exists "portfolio-avatars_public_read" on storage.objects;
create policy "portfolio-avatars_public_read"
  on storage.objects for select using (bucket_id = 'portfolio-avatars');

drop policy if exists "portfolio-avatars_write_own" on storage.objects;
create policy "portfolio-avatars_write_own"
  on storage.objects for insert
  with check (bucket_id = 'portfolio-avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "portfolio-avatars_update_own" on storage.objects;
create policy "portfolio-avatars_update_own"
  on storage.objects for update
  using (bucket_id = 'portfolio-avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "portfolio-avatars_delete_own" on storage.objects;
create policy "portfolio-avatars_delete_own"
  on storage.objects for delete
  using (bucket_id = 'portfolio-avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- Manual (dashboard, no SQL): Auth settings → activar "Leaked password
-- protection", "Confirm email" y "Secure email change". Nunca versionar
-- la service_role key. Bootstrap del primer admin (ejecutar aparte tras
-- el primer registro real):
--   update portfolio.profiles set role = 'admin' where username = 'TU_USERNAME';

-- =====================================================================
-- Futuro: tablas de negocio reales del portfolio (contacto ya vive en
-- api/contact.ts vía Resend, no en Supabase). Seguir el mismo patrón
-- que Desktop_Nav/supabase/unified/desktop_nav.sql si se añade algo más
-- (schema propio ya existe arriba, RLS, bucket con prefijo 'portfolio-').
-- =====================================================================
