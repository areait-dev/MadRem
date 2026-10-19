-- ============================================================================
-- promoremind — verifica RLS (Row Level Security) su Supabase
-- Da eseguire nel SQL Editor del progetto. Le query 1–10 sono di sola lettura.
-- Le query 11–12 usano una transazione con ROLLBACK: non modificano nulla.
-- Tabelle usate dall'app: aruba_panels, domains, databases, db_slots,
-- pec_emails, subscriptions (tutte con colonna user_id).
-- ============================================================================


-- 1. RLS attiva su ogni tabella dello schema public?
--    Atteso: rls_enabled = true per tutte le tabelle dell'app.
select c.relname                         as tabella,
       c.relrowsecurity                  as rls_enabled,
       c.relforcerowsecurity             as rls_forced
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind in ('r', 'p')            -- tabelle e tabelle partizionate
order by c.relname;


-- 2. Tabelle SENZA RLS (devono essere zero, oppure essere intenzionali)
select schemaname, tablename
from pg_tables
where schemaname = 'public'
  and not rowsecurity
order by tablename;


-- 3. Tutte le policy esistenti, con comando, ruoli e condizioni
select tablename, policyname, permissive, roles, cmd,
       qual       as using_expr,
       with_check as with_check_expr
from pg_policies
where schemaname = 'public'
order by tablename, cmd, policyname;


-- 4. Tabelle con RLS attiva ma SENZA policy (nessuno, tranne il service role, può leggerle)
select c.relname as tabella
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'r'
  and c.relrowsecurity
  and not exists (
    select 1 from pg_policies p
    where p.schemaname = 'public' and p.tablename = c.relname
  )
order by c.relname;


-- 5. Copertura dei comandi: per ogni tabella, quali comandi hanno una policy
--    Atteso per le tabelle dell'app: SELECT, INSERT, UPDATE, DELETE (oppure ALL)
select t.tablename,
       bool_or(p.cmd in ('SELECT', 'ALL')) as select_ok,
       bool_or(p.cmd in ('INSERT', 'ALL')) as insert_ok,
       bool_or(p.cmd in ('UPDATE', 'ALL')) as update_ok,
       bool_or(p.cmd in ('DELETE', 'ALL')) as delete_ok
from pg_tables t
left join pg_policies p on p.schemaname = t.schemaname and p.tablename = t.tablename
where t.schemaname = 'public'
group by t.tablename
order by t.tablename;


-- 6. Policy PERICOLOSE: aperte a tutti, senza filtro su utente, o consentite ad anon/public
--    Atteso: nessuna riga (a meno di tabelle pubbliche volute).
select tablename, policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public'
  and (
        qual is null or trim(qual) in ('true', '(true)')
     or with_check is not null and trim(with_check) in ('true', '(true)')
     or 'anon' = any (roles)
     or 'public' = any (roles)
     or (qual is not null and qual not ilike '%auth.uid()%')
      )
order by tablename, policyname;


-- 7. Permessi (GRANT) dei ruoli anon / authenticated sulle tabelle.
--    anon NON dovrebbe avere privilegi sulle tabelle dell'app.
select grantee, table_name, string_agg(privilege_type, ', ' order by privilege_type) as privilegi
from information_schema.role_table_grants
where table_schema = 'public'
  and grantee in ('anon', 'authenticated')
group by grantee, table_name
order by table_name, grantee;


-- 8. Colonna user_id: presente, NOT NULL, e con default auth.uid()?
--    (senza NOT NULL una riga con user_id nullo sfuggirebbe ai controlli)
select table_name, column_name, is_nullable, column_default, data_type
from information_schema.columns
where table_schema = 'public'
  and column_name = 'user_id'
order by table_name;


-- 9. Viste nello schema public: ignorano la RLS se non sono "security_invoker"
select c.relname as vista,
       coalesce(c.reloptions::text, '') as opzioni   -- cerca security_invoker=true
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind in ('v', 'm')
order by c.relname;


-- 10. Funzioni SECURITY DEFINER nello schema public: girano con i privilegi del proprietario
--     e possono saltare la RLS. Verifica che non espongano dati a tutti.
select p.proname as funzione,
       pg_get_function_identity_arguments(p.oid) as argomenti,
       p.prosecdef as security_definer,
       p.proconfig as config
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.prosecdef
order by p.proname;


-- 11. TEST COME UTENTE ANONIMO (chi ha solo la chiave anon pubblica, come il cron keep-alive)
--     Atteso: 0 righe per ogni tabella, oppure errore "permission denied".
begin;
  set local role anon;
  select 'aruba_panels'  as tabella, count(*) from public.aruba_panels
  union all select 'domains',       count(*) from public.domains
  union all select 'databases',     count(*) from public.databases
  union all select 'db_slots',      count(*) from public.db_slots
  union all select 'pec_emails',    count(*) from public.pec_emails
  union all select 'subscriptions', count(*) from public.subscriptions;
rollback;


-- 12. TEST COME UTENTE AUTENTICATO CON UN ALTRO ID
--     Simula un utente qualsiasi (UUID finto): non deve vedere nessuna riga tua.
--     Atteso: 0 righe per ogni tabella.
begin;
  set local role authenticated;
  select set_config('request.jwt.claims',
                    '{"sub":"00000000-0000-0000-0000-000000000000","role":"authenticated"}',
                    true);
  select 'aruba_panels'  as tabella, count(*) from public.aruba_panels
  union all select 'domains',       count(*) from public.domains
  union all select 'databases',     count(*) from public.databases
  union all select 'db_slots',      count(*) from public.db_slots
  union all select 'pec_emails',    count(*) from public.pec_emails
  union all select 'subscriptions', count(*) from public.subscriptions;
rollback;


-- 13. Controllo di coerenza dei dati: righe con user_id nullo o riferito a un utente inesistente
select 'aruba_panels' as tabella, count(*) as righe_orfane
from public.aruba_panels p where p.user_id is null or not exists (select 1 from auth.users u where u.id = p.user_id)
union all select 'domains',       count(*) from public.domains d       where d.user_id is null or not exists (select 1 from auth.users u where u.id = d.user_id)
union all select 'databases',     count(*) from public.databases d     where d.user_id is null or not exists (select 1 from auth.users u where u.id = d.user_id)
union all select 'db_slots',      count(*) from public.db_slots s      where s.user_id is null or not exists (select 1 from auth.users u where u.id = s.user_id)
union all select 'pec_emails',    count(*) from public.pec_emails e    where e.user_id is null or not exists (select 1 from auth.users u where u.id = e.user_id)
union all select 'subscriptions', count(*) from public.subscriptions s where s.user_id is null or not exists (select 1 from auth.users u where u.id = s.user_id);


-- 14. Utenti registrati: se l'app è usata solo da te, deve esserci un solo utente
--     (e le registrazioni pubbliche vanno disattivate: Authentication → Providers → Email → "Allow new users to sign up").
select id, email, created_at, last_sign_in_at, email_confirmed_at
from auth.users
order by created_at;


-- ============================================================================
-- CORREZIONE (NON eseguire alla cieca: lancia prima le query sopra).
-- Applica RLS "ogni utente vede solo le proprie righe" a tutte le tabelle dell'app.
-- ============================================================================
-- do $$
-- declare t text;
-- begin
--   foreach t in array array['aruba_panels','domains','databases','db_slots','pec_emails','subscriptions']
--   loop
--     execute format('alter table public.%I enable row level security', t);
--     execute format('revoke all on public.%I from anon', t);
--
--     -- pulizia di eventuali policy con lo stesso nome
--     execute format('drop policy if exists "owner_select" on public.%I', t);
--     execute format('drop policy if exists "owner_insert" on public.%I', t);
--     execute format('drop policy if exists "owner_update" on public.%I', t);
--     execute format('drop policy if exists "owner_delete" on public.%I', t);
--
--     execute format('create policy "owner_select" on public.%I for select to authenticated using ((select auth.uid()) = user_id)', t);
--     execute format('create policy "owner_insert" on public.%I for insert to authenticated with check ((select auth.uid()) = user_id)', t);
--     execute format('create policy "owner_update" on public.%I for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)', t);
--     execute format('create policy "owner_delete" on public.%I for delete to authenticated using ((select auth.uid()) = user_id)', t);
--   end loop;
-- end $$;
--
-- -- user_id obbligatorio e valorizzato in automatico (evita righe "orfane")
-- -- alter table public.domains alter column user_id set default auth.uid(), alter column user_id set not null;
-- -- (ripeti per le altre tabelle)
--
-- -- Indici per velocizzare le policy
-- -- create index if not exists idx_domains_user_id on public.domains (user_id);
