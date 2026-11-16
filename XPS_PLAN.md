# Plan: XPShare (XPS) — a fake 2004 Frutiger Aero forum that is secretly an interactive story

## Context
You want a story told entirely through what looks like an early-2000s web forum (glossy Frutiger Aero / Y2K look: sky gradients, bubbles, glass buttons, aqua highlights). Readers browse boards, threads and user profiles as if it's a real community; you, as admin, puppet every "user". You need an admin client to create recurring identities (name, avatar, flair, banner, signature, join date, post count, rank) and compose/edit/reply to posts as any of them.

**Premise:** It is 2004. XPShare ("XPS") is the world's primary hub of online entertainment. Its users (all characters you control) trade their *memories* for XPS's in-site currency, which can buy other people's memories or be cashed out for real money. The forum chrome should therefore feel like a real 2004 product: branding, ToS, a currency, a memory marketplace, staff accounts, ads.

Decisions made:
- Lives at **speep.me/xps/** in this repo, reusing the existing Firebase project (`firebase-init.js`), Google login, and owner-only rules pattern from the DNGN comic editor (`editor.html`, `firestore.rules`, `storage.rules`).
- **Scheduled drip**: every post has a fake in-story timestamp *and* a real `liveAt` time, so threads grow over days like a live forum.
- Readers can: browse/click everything, **react & vote in polls** (real counts), and use **fake logins / passwords** to unlock hidden boards and "deleted" posts.

Stack: plain HTML/CSS/vanilla JS + Firebase compat SDK (same as the rest of the site — no build step, deploys via GitHub Pages on push).

## File layout (new)
```
xps/
  index.html        board list (categories, "Who's online", stats footer)
  board.html        ?b=slug  thread list (sticky/locked icons, reply counts, last post)
  thread.html       ?t=id    posts, pagination, reactions, polls
  user.html         ?u=id    profile: banner, avatar, flair, bio, XP balance, trade history, recent posts
  exchange.html     Memory Exchange: listings grid, "recently sold" ticker
  listing.html      ?m=id    single memory listing + discussion thread
  tos.html          in-world Terms of Service / FAQ (great place for story clues)
  login.html        fake login → unlocks hidden content
  admin.html        the puppet client (owner-only)
  css/aero.css      the whole theme
  js/xps-data.js  Firestore reads + liveAt filtering + caching
  js/render.js      shared renderers (post card, user mini-profile, BBCode)
  js/admin.js       admin client logic
  img/              glossy icons, rank pips, smilies, backgrounds
```
Reuse `/firebase-init.js` (load it with `../firebase-init.js`) and its `window.__DNGN_FB` handle.

## Data model (Firestore, all under `xps_*` collections)
- `xps_identities/{id}`: name, XP balance (or derived from ledger), memories sold/bought counts, trader rating, avatarUrl, bannerUrl, flair {text, color, icon}, rank, signature, bio, location, joinDate (fake), postCountOffset, isMod/isAdmin badge, nameColor, `hidden` flag.
- `xps_boards/{slug}`: title, description, icon, category, order, `lockKey` (null or the unlock key required).
- `xps_threads/{id}`: boardSlug, title, authorId, sticky, locked, icon, createdFake, liveAt, viewsFake, `lockKey`.
- `xps_posts/{id}`: threadId, authorId, body (BBCode), fakeTime, liveAt, editedFake ("Last edited by X"), `deleted` (shows "[post removed by moderator]" unless unlocked), `lockKey`, optional poll {question, options[]}.
- `xps_reactions/{postId}` and `xps_votes/{pollId}`: counter docs; public increment-only writes.
- `xps_keys/{hash}`: unlock keys → list of lockKeys they grant (store SHA-256 of password so passwords aren't readable).
- `xps_listings/{id}`: **memory listings** — sellerId, title ("Summer 1997, grandma's kitchen"), teaser, full memory text (lockKey/"purchased" reveal), price in XP currency, status (listed/sold/withdrawn), buyerId, fake sale date. Rendered as a "Memory Exchange" board with listing cards.
- `xps_ledger/{id}`: in-story transactions (identity → identity, amount, memory link, cash-out events) so profiles can show balances and trade history that stay consistent.
- `xps_drafts/{id}`: owner-only unpublished posts.

**Drip logic:** readers query `where('liveAt','<=', now)`; Firestore rules also enforce `resource.data.liveAt <= request.time` for non-owners so future posts can't be peeked at via the console.

**Fake logins:** login.html hashes the typed password, reads `xps_keys/{hash}`; on hit, stores granted lockKeys in localStorage and the site reveals hidden boards/posts. (Note: truly secret content would need the rules to check it — acceptable for an ARG; mention in README that determined snoopers could find it.)

## Admin client (`xps/admin.html`) — the core feature
Owner-only (Google sign-in, same UID check as `editor.html`). Panels:
1. **Identity manager** — grid of all puppets; create/edit/duplicate; upload avatar & banner to Storage (`xps/avatars/…`, `xps/banners/…`); flair builder with color picker; live preview of the mini-profile card.
2. **Composer** — pick identity (searchable dropdown with avatars, "recently used" pinned), pick board → new thread or existing thread → reply; BBCode toolbar (bold, quote-as-user, spoiler, color, img, smilies); fake timestamp + liveAt picker ("now", "+2h", custom); live preview rendered with the real `render.js`.
3. **Thread view in edit mode** — open any thread, every post gets Edit / Delete / "Mark as mod-removed" / "Reply as…" / "Quote as…" buttons; drag to reorder by fake time.
4. **Exchange manager** — create memory listings as any identity, mark sold to another identity (auto-writes a ledger entry and an optional "Thanks for the trade!" post), cash-out events.
5. **Schedule timeline** — list of upcoming (not-yet-live) posts sorted by liveAt, to plan the drip.
6. **Boards & keys** — create boards, lock them behind keys, manage passwords.
7. Drafts autosave to `xps_drafts`.

## In-world time
All fake timestamps are 2004 dates ("Posted: Tue Mar 16, 2004 11:42 pm"). Keep a site-wide `storyNow` in `xps_meta/clock` that the admin advances; the header shows that date, and "X minutes ago" is computed against it, not the real clock. liveAt (real time) still controls *when* readers see a post.

## Aesthetic checklist (`aero.css`)
XPS logo: glossy aqua orb/bubble wordmark "XPShare" with a reflection; currency icon (e.g. a shiny "XP" coin/droplet).
Sky-blue → white gradient background with soft bokeh/bubble PNGs, glossy pill buttons (top-half white gradient highlight), translucent glass panels with `backdrop-filter`, aqua/lime accents, Tahoma/Verdana/"Segoe UI" fonts, 1px inner borders, rounded 6px corners, tiny 16px icons, forum chrome (breadcrumbs, "You are not logged in", "Users browsing this thread", Powered-by footer, hit counter, 88×31 buttons). Period-accurate details: Windows XP Luna touches, "Best viewed in Internet Explorer 6 at 1024×768", fake banner ads, MSN-style status icons. Optional: Nature photo (grass/water droplets) header, aqua cursor.

## Build phases (one vibe-coding prompt/commit each)
1. **Static mock** — `aero.css` + index/board/thread/user pages with hardcoded JSON sample data. Nail the look first.
2. **Data layer** — move sample data to Firestore collections; `xps-data.js` with liveAt filtering; update `firestore.rules`/`storage.rules` with `xps_*` matches (copy owner-UID pattern).
3. **Admin: identities** — sign-in + identity CRUD + uploads.
4. **Admin: composer & edit mode** — new thread / reply / edit / delete as any identity, BBCode + preview, scheduling.
5. **Reader interactivity** — reactions & polls (increment-only rules, localStorage to prevent double votes).
6. **Memory Exchange** — exchange.html, listing.html, ledger + balances on profiles, admin exchange manager.
7. **ARG layer** — fake login, locked boards, mod-removed posts, hidden profiles, secret URLs.
8. **Polish** — "who's online" generated from recently-active identities, post counts computed, unread-dot styling, mobile layout, favicon, link from `index.html`.

Suggested first prompt: *"Build phase 1: create xps/css/aero.css and static index/board/thread/user pages in xps/ for XPShare, a 2004 Frutiger Aero forum where users trade memories for currency, using hardcoded sample identities, posts, and a couple of memory listings."*

## Critical files touched outside `xps/`
- `firestore.rules`, `storage.rules` — add `xps_*` and `xps/` paths (owner write, public read with liveAt check, increment-only reaction/vote rules).
- `FIREBASE_SETUP.md` — add a forum section.
- `index.html` (optional) — a link to the forum, or keep it hidden for ARG mystery.

## Verification
- Open pages locally (`python3 -m http.server`) and screenshot with Playwright at desktop & phone widths to check the look.
- Sign in on `xps/admin.html`, create 2 identities, list a memory as one and sell it to the other (check both balances/ledger update), post a thread + replies with one reply scheduled 5 minutes out; confirm it's hidden from an incognito reader until liveAt, then appears.
- React/vote from incognito; confirm counts update and a second vote is blocked.
- Try a wrong and right fake password; confirm locked board appears only after the right one.
- Publish rules and confirm a signed-out client cannot write posts or read future ones (Firebase console Rules Playground).
