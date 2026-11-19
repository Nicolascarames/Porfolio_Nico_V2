-- =====================================================================
--  Configuración de la IA (pestaña /admin/ai).
--
--  ai_config: una fila por integración ('desktop-nav-console' = terminal,
--  'nico-chat' = chat). Tabla PRIVADA: el repo es público y la config no
--  debe ser legible por visitantes; solo el admin (portfolio.is_admin())
--  la lee/edita desde el navegador, y service_role desde el servidor.
--
--  ai_usage: contador diario por IP (hash) e integración, sin políticas:
--  solo service_role, a través de portfolio.ai_usage_hit().
--
--  Idempotente: se puede volver a ejecutar sin romper nada.
-- =====================================================================

create table if not exists portfolio.ai_config (
  integration_id  text primary key
                  check (integration_id in ('desktop-nav-console', 'nico-chat')),
  enabled         boolean not null default true,
  model           text not null default 'claude-haiku-5-5'
                  check (model in ('claude-haiku-5-5', 'claude-sonnet-5-5', 'claude-opus-5-5')),
  personality     text not null default '' check (char_length(personality) <= 2000),
  daily_limit     integer not null default 30 check (daily_limit between 1 and 1000),
  off_message     text not null default 'La IA está descansando. Escríbeme por el formulario de contacto.'
                  check (char_length(off_message) <= 300),
  updated_at      timestamptz not null default now()
);

alter table portfolio.ai_config enable row level security;

revoke all on portfolio.ai_config from anon, authenticated;
grant select, update on portfolio.ai_config to authenticated;
grant all on portfolio.ai_config to service_role;

drop policy if exists "ai_config_select_admin" on portfolio.ai_config;
create policy "ai_config_select_admin"
  on portfolio.ai_config for select
  to authenticated
  using (portfolio.is_admin());

drop policy if exists "ai_config_update_admin" on portfolio.ai_config;
create policy "ai_config_update_admin"
  on portfolio.ai_config for update
  to authenticated
  using (portfolio.is_admin())
  with check (portfolio.is_admin());

insert into portfolio.ai_config (integration_id)
values ('desktop-nav-console'), ('nico-chat')
on conflict do nothing;

-- ---------------------------------------------------------------------
create table if not exists portfolio.ai_usage (
  ip_hash         text not null,
  integration_id  text not null,
  day             date not null,
  count           integer not null default 0,
  primary key (ip_hash, integration_id, day)
);

alter table portfolio.ai_usage enable row level security;

revoke all on portfolio.ai_usage from anon, authenticated;
grant all on portfolio.ai_usage to service_role;

-- ---------------------------------------------------------------------
create or replace function portfolio.ai_usage_hit(
  p_ip_hash text,
  p_integration_id text,
  p_limit integer
) returns boolean
language plpgsql
security definer
set search_path = portfolio, pg_temp
as $$
declare
  v integer;
begin
  insert into portfolio.ai_usage as u (ip_hash, integration_id, day, count)
  values (p_ip_hash, p_integration_id, (now() at time zone 'utc')::date, 1)
  on conflict (ip_hash, integration_id, day)
  do update set count = u.count + 1
  returning u.count into v;

  delete from portfolio.ai_usage where day < (now() at time zone 'utc')::date - 7;

  return v <= p_limit;
end;
$$;

revoke execute on function portfolio.ai_usage_hit(text, text, integer) from public, anon, authenticated;
grant execute on function portfolio.ai_usage_hit(text, text, integer) to service_role;
