-- =====================================================================
--  Configuración pública del sitio (pestaña /admin/sections).
--
--  Una única fila con las variantes activas de cada sección (mismas
--  claves que src/config/sections.ts, que sigue siendo el valor por
--  defecto). Cualquiera puede leerla (la web pública la necesita); solo
--  el admin de Portfolio (portfolio.is_admin()) puede escribirla.
--
--  `data` solo contiene claves que difieren o se han fijado desde el
--  admin; la web valida cada valor y cae al defecto si no es válido.
--
--  Idempotente: se puede volver a ejecutar sin romper nada.
-- =====================================================================

create table if not exists portfolio.site_config (
  id          smallint primary key default 1 check (id = 1),
  data        jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

alter table portfolio.site_config enable row level security;

revoke all on portfolio.site_config from anon, authenticated;
grant select on portfolio.site_config to anon, authenticated;
grant insert, update on portfolio.site_config to authenticated;

drop policy if exists "site_config_select_all" on portfolio.site_config;
create policy "site_config_select_all"
  on portfolio.site_config for select
  to anon, authenticated
  using (true);

drop policy if exists "site_config_insert_admin" on portfolio.site_config;
create policy "site_config_insert_admin"
  on portfolio.site_config for insert
  to authenticated
  with check (portfolio.is_admin());

drop policy if exists "site_config_update_admin" on portfolio.site_config;
create policy "site_config_update_admin"
  on portfolio.site_config for update
  to authenticated
  using (portfolio.is_admin())
  with check (portfolio.is_admin());

insert into portfolio.site_config (id, data)
values (1, '{}'::jsonb)
on conflict (id) do nothing;
