# Firebase setup for the DNGN panel editor

This wires the panel editor to **Firebase** so you can publish comic pages —
caption text, layout, **and** panel art — without touching the GitHub repo,
exactly like qaern.wiki. The site stays static on GitHub Pages; Firebase adds:

- **Authentication** — a Google login so only *you* can use the editor to publish.
- **Cloud Firestore** — stores each page's caption/layout data.
- **Cloud Storage** — stores uploaded panel images.

Security is enforced server-side by Firebase **rules** (see `firestore.rules`
and `storage.rules`), not by hiding anything in the page. The web config in
`firebase-init.js` is *meant* to be public.

**Free at this scale.** Firebase's free (Spark) tier covers a personal webcomic
comfortably (~50k reads / 20k writes per day, 1 GiB Storage). GitHub Pages stays
free. No servers to run.

---

## One-time setup

### 1. Create a Firebase project
1. Go to <https://console.firebase.google.com/> → **Add project**.
2. Name it (e.g. `speep-dngn`). Google Analytics is optional.

### 2. Enable the three products
- **Authentication** → Get started → **Sign-in method** → enable **Google**.
  - Under Authentication → **Settings → Authorized domains**, add `speep.me`
    (and `localhost` for local testing).
- **Firestore Database** → Create database → Production mode → pick a region.
- **Storage** → Get started → Production mode → same region.

### 3. Register a Web app and copy the config
1. Project settings (gear) → **Your apps** → Web (`</>`).
2. Register the app (nickname is fine; Hosting not needed).
3. Copy the `firebaseConfig` object.
4. Paste those six values into **`firebase-init.js`** (the `FIREBASE_CONFIG` at
   the top).

### 4. Get your UID and lock down writes
1. Open `editor.html` (locally or on the site) and click **Sign in** — sign in
   with the Google account that should own the comic.
2. The sign-in bar prints your **UID**. Copy it.
3. Paste that UID into **three** places, replacing `TODO_YOUR_UID`:
   - `firebase-init.js` → `OWNER_UID`
   - `firestore.rules`
   - `storage.rules`
4. Publish the rules:
   - **Firestore** → Rules → paste `firestore.rules` → Publish.
   - **Storage** → Rules → paste `storage.rules` → Publish.
   - (Or, with the Firebase CLI: `firebase deploy --only firestore:rules,storage`.)

### 5. Commit `firebase-init.js`
Commit the filled-in `firebase-init.js` (and the two `.rules` files) so the live
site uses them. The config is safe to commit.

---

## Using the editor

1. Open `editor.html` and **Sign in** as the owner account.
2. Build the page: caption text (with the markup toolbar), title, source,
   flairs, columns/tall, and one row per panel. For each panel you can either
   reference an existing `Comics/pageNN` image (by suffix) or **upload** art.
3. Watch the **live preview**.
4. Click **Publish to site** — this uploads any images to Storage and writes the
   page to Firestore. `comic.html` reads Firestore on load and shows your page.
5. **Load page from site** re-loads an already-published page for editing.

The old **copy-paste export** still works as a fallback (for hardcoding a page
into `comic.html`), but with Firebase you shouldn't need it.

---

## How it stays safe for the live comic
`comic.html` reads Firestore as an **overlay** on top of its built-in pages. If
Firebase is unreachable or unconfigured, the comic simply renders its existing
hardcoded pages — the Firestore layer only ever *adds/overrides*, so it can't
break the comic.
