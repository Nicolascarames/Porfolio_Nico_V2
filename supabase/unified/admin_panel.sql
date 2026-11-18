-- =====================================================================
--  Panel privado del servidor (pestaña /admin/panel).
--
--  Guarda una única fila con el contenido de
--  mapa_proyectos/panel/panel.json. El repo del porfolio es público, así
--  que estos datos NO viven en el código: solo se leen de aquí, y RLS
--  deja leerlos únicamente al admin de Portfolio (portfolio.is_admin()).
--
--  No hay políticas de insert/update/delete: nadie puede escribir desde
--  la web. La fila se sube con `mapa_proyectos/scripts/subir-panel.sh`
--  (Supabase CLI, que entra como postgres y se salta RLS).
--
--  Idempotente: se puede volver a ejecutar sin romper nada.
-- =====================================================================

create table if not exists portfolio.admin_panel (
  id          smallint primary key default 1 check (id = 1),
  data        jsonb not null,
  updated_at  timestamptz not null default now()
);

alter table portfolio.admin_panel enable row level security;

revoke all on portfolio.admin_panel from anon, authenticated;
grant select on portfolio.admin_panel to authenticated;

drop policy if exists "admin_panel_select_admin" on portfolio.admin_panel;
create policy "admin_panel_select_admin"
  on portfolio.admin_panel for select
  to authenticated
  using (portfolio.is_admin());
