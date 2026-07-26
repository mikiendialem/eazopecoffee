# Eazope Coffee

A single-page Ethiopian coffee shop site with a 3D animated hero (Three.js),
scroll animations (GSAP), a cart, and an order form that writes directly to
a Supabase table.

## Files

| File | Purpose |
|---|---|
| `EazopeCoffee.html` | The entire site — HTML, CSS, and JS in one file |
| `config.example.js` | Template for your Supabase credentials |
| `config.js` | Your real credentials — **not committed to git** |
| `database.sql` | Sets up the `orders` table and its access policy in Supabase |
| `.gitignore` | Keeps `config.js` (and other local/OS files) out of git |

## Setup

1. **Clone/copy this folder.**
2. **Create `config.js`:**
   ```bash
   cp config.example.js config.js
   ```
   Then open `config.js` and fill in your own Supabase project's URL and
   anon/public key (Supabase dashboard → Project Settings → API).
3. **Set up the database:** open the Supabase dashboard → SQL Editor →
   paste the contents of `database.sql` → Run.
4. **Open `EazopeCoffee.html`** in a browser.

   Double-clicking the file works, but running it through a simple local
   server avoids some `file://`-specific browser quirks:
   ```bash
   npx serve .
   # or
   python -m http.server 8000
   ```

## How ordering works

- Visitors add items to the cart (kept in memory, resets on page reload).
- On checkout, the form inserts one row into the `orders` table via the
  Supabase JS client using the anon key.
- Row Level Security (RLS) is enabled on `orders` with an **insert-only**
  policy — visitors can create orders but cannot read, edit, or delete
  any order, including their own or anyone else's.

## Viewing orders

There's no admin page on the site itself (by design — see below). To see
incoming orders:

- **Supabase dashboard → Table Editor → `orders`**, or
- **SQL Editor:**
  ```sql
  select * from public.orders order by created_at desc;
  ```

## Security notes

- The Supabase **anon/public key** in `config.js` is meant to be used in
  client-side code — it is not a secret by itself. The real protection is
  the RLS policy in `database.sql`, which restricts what that key can do
  (insert new orders only, nothing else).
- Keeping it in a separate `config.js` instead of hardcoded in the HTML is
  still good practice: it makes the key easy to rotate, keeps credentials
  out of version history, and separates config from code.
- **Never** put a Supabase `service_role` key in this file or anywhere in
  frontend code — that key bypasses RLS entirely and grants full database
  access to anyone who can view your site's source.
- If you build an admin dashboard later to manage orders from the website
  itself (rather than the Supabase dashboard), that needs real
  authentication — either a Supabase Auth login with a `SELECT` policy
  scoped to authenticated users, or a small trusted backend using the
  service_role key, never exposed to the browser.

## Tech

- Tailwind CSS (CDN)
- Three.js r128 (3D hero cup + floating beans)
- GSAP + ScrollTrigger (scroll animations)
- Supabase JS client (order storage)
