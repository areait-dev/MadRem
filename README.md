# promoremind

Promemoria e monitoraggio delle scadenze dell'infrastruttura di Promotergroup: pannelli Aruba, domini, database, caselle PEC e abbonamenti.

Produzione: <https://remind.promotergroup.eu>

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS 4 con i token del design system Promotergroup, definiti in `src/index.css` (`@theme`, nessun `tailwind.config.js`)
- Supabase (autenticazione e database con RLS)
- Framer Motion, SweetAlert2, lucide-react
- PWA (`vite-plugin-pwa`) e hosting su Vercel

## Sviluppo

```bash
npm install
npm run dev        # http://localhost:5173
npm run lint
npm run build      # tsc + vite build
```

Crea un file `.env.local` (ignorato da git):

```bash
VITE_SUPABASE_URL=https://<progetto>.supabase.co
VITE_SUPABASE_ANON_KEY=<chiave anon>
```

## Design system

- Font: Unbounded solo per i titoli H1–H6, Lexend per tutto il resto.
- Colori: solo token semantici (`bg-page`, `bg-surface`, `text-fg`, `text-link`, `border-divider`…), con tema chiaro e scuro (classe `.dark` su `<html>`, scuro di default).
- Bottoni `.btn-primary` / `.btn-secondary`, tag `.tag-*`, input `.input`; gutter laterale comune `px-gutter`.
- Logo: `public/promoremind-light.svg` (tema chiaro) e `public/promoremind-dark.svg` (tema scuro), componente `src/components/Logo.tsx`.

## Deploy (Vercel)

Variabili d'ambiente per l'ambiente **Production**:

| Variabile | Uso |
|---|---|
| `VITE_SUPABASE_URL` | URL del progetto Supabase |
| `VITE_SUPABASE_ANON_KEY` | chiave anon (pubblica) |
| `CRON_SECRET` | segreto del cron `api/keep-alive` (Vercel lo invia come `Authorization: Bearer …`) |

Il cron `/api/keep-alive` gira ogni giorno alle 05:00 UTC (`vercel.json`) per evitare la messa in pausa del database Supabase.

## Supabase

In `supabase/` ci sono gli script SQL per la sicurezza:

- `rls-audit.sql`: query di sola lettura per verificare la RLS (policy, permessi, test come utente anonimo ed estraneo);
- `rls-hardening.sql`: rifiniture applicate dopo l'audit (permessi minimi, policy solo per utenti autenticati, indici).

Tutte le tabelle hanno la colonna `user_id` e policy `auth.uid() = user_id`. Le registrazioni pubbliche sono disattivate.

## Rilasci

I commit seguono Conventional Commits (`commitlint`). Per un rilascio:

```bash
npm run release          # patch
npm run release:minor
npm run release:major
```

Aggiorna a mano `releaseDate` in `package.json`: è la data mostrata nel footer.
