-- ============================================================================
-- promoremind — rifiniture RLS dopo l'audit (supabase/rls-audit.sql)
-- Esito audit: RLS attiva su tutte le tabelle, policy "auth.uid() = user_id",
-- anon e utenti estranei non vedono nulla, nessuna riga orfana, un solo utente.
-- Questo script chiude i punti residui. È idempotente ed è in una transazione:
-- se qualcosa va storto non cambia niente. Eseguilo nel SQL Editor.
-- ============================================================================

begin;

-- 1. Permessi superflui.
--    Oggi anon e authenticated hanno TRUNCATE/TRIGGER/REFERENCES su tutte le tabelle:
--    TRUNCATE non è soggetto a RLS. L'app non ne ha bisogno.
revoke truncate, trigger, references on all tables in schema public from anon, authenticated;

--    anon non scrive mai. Mantiene SELECT solo perché il cron keep-alive interroga
--    `domains` con la chiave anon (la RLS gli restituisce 0 righe, ma genera attività).
revoke insert, update, delete on all tables in schema public from anon;

--    Lo stesso vale per le tabelle create in futuro
alter default privileges for role postgres in schema public
  revoke truncate, trigger, references on tables from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke insert, update, delete on tables from anon;


-- 2. Policy: solo per utenti autenticati (oggi sono per {public}, quindi valutate anche per anon),
--    con WITH CHECK esplicito e auth.uid() in sub-select (valutato una volta per query, non per riga).
drop policy if exists "owner_aruba_panels" on public.aruba_panels;
create policy "owner_aruba_panels" on public.aruba_panels
  for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "owner_databases" on public.databases;
create policy "owner_databases" on public.databases
  for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "owner_db_slots" on public.db_slots;
create policy "owner_db_slots" on public.db_slots
  for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "owner_domains" on public.domains;
create policy "owner_domains" on public.domains
  for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "Users can manage their own PEC emails" on public.pec_emails;
create policy "owner_pec_emails" on public.pec_emails
  for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "Users can manage their own subscriptions" on public.subscriptions;
create policy "owner_subscriptions" on public.subscriptions
  for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);


-- 3. user_id valorizzato in automatico lato database (il client continua a inviarlo: nessun cambio nell'app)
alter table public.aruba_panels  alter column user_id set default auth.uid();
alter table public.databases     alter column user_id set default auth.uid();
alter table public.db_slots      alter column user_id set default auth.uid();
alter table public.domains       alter column user_id set default auth.uid();
alter table public.pec_emails    alter column user_id set default auth.uid();
alter table public.subscriptions alter column user_id set default auth.uid();


-- 4. Indici sulle colonne usate dalle policy e dai filtri dell'app
create index if not exists idx_aruba_panels_user_id  on public.aruba_panels  (user_id);
create index if not exists idx_databases_user_id     on public.databases     (user_id);
create index if not exists idx_db_slots_user_id      on public.db_slots      (user_id);
create index if not exists idx_domains_user_id       on public.domains       (user_id);
create index if not exists idx_pec_emails_user_id    on public.pec_emails    (user_id);
create index if not exists idx_subscriptions_user_id on public.subscriptions (user_id);

commit;


-- ============================================================================
-- VERIFICHE DOPO L'ESECUZIONE
-- ============================================================================

-- A. Policy ora solo per "authenticated" e con WITH CHECK
select tablename, policyname, roles, cmd, qual, with_check
from pg_policies where schemaname = 'public' order by tablename;

-- B. anon: solo SELECT; authenticated: niente TRUNCATE/TRIGGER/REFERENCES
select grantee, table_name, string_agg(privilege_type, ', ' order by privilege_type) as privilegi
from information_schema.role_table_grants
where table_schema = 'public' and grantee in ('anon', 'authenticated')
group by grantee, table_name order by table_name, grantee;

-- C. Il TUO utente vede ancora i suoi dati (atteso: numeri > 0 dove hai righe)
begin;
  set local role authenticated;
  select set_config('request.jwt.claims',
                    '{"sub":"d16f9396-68bf-46bc-8b9c-7a93b5d6c290","role":"authenticated"}', true);
  select 'aruba_panels' as tabella, count(*) from public.aruba_panels
  union all select 'domains',       count(*) from public.domains
  union all select 'databases',     count(*) from public.databases
  union all select 'db_slots',      count(*) from public.db_slots
  union all select 'pec_emails',    count(*) from public.pec_emails
  union all select 'subscriptions', count(*) from public.subscriptions;
rollback;

-- D. anon e un utente estraneo continuano a vedere 0 righe: ripeti le query 11 e 12 di rls-audit.sql

-- E. La funzione rls_auto_enable (SECURITY DEFINER) non deve essere eseguibile da anon/authenticated
select has_function_privilege('anon',          'public.rls_auto_enable()', 'execute') as anon_exec,
       has_function_privilege('authenticated', 'public.rls_auto_enable()', 'execute') as auth_exec;
-- Se uno dei due è true:  revoke execute on function public.rls_auto_enable() from anon, authenticated, public;
