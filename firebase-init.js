/* =============================================================================
   Firebase bootstrap for speep.me — shared by editor.html and comic.html.

   THIS FILE IS PUBLIC BY DESIGN. The web config below is NOT a secret; Firebase
   web config is meant to ship in client code. Real security comes from Firebase
   Authentication + the Firestore/Storage rules (see firestore.rules /
   storage.rules), which are enforced server-side by Google.

   Setup lives in FIREBASE_SETUP.md. Until you fill in the two TODOs below, the
   editor falls back to copy-paste and the comic uses its built-in pages only.
   ============================================================================ */
(function () {
  // 1) Paste your Firebase web config (Firebase console → Project settings →
  //    "Your apps" → SDK setup and configuration → Config):
  const FIREBASE_CONFIG = {
    apiKey: "AIzaSyB5F0kShGzZpIvXXNZTZJWym6EmOYvzRys",
    authDomain: "dngn-d5f30.firebaseapp.com",
    projectId: "dngn-d5f30",
    storageBucket: "dngn-d5f30.firebasestorage.app",
    messagingSenderId: "565807479999",
    appId: "1:565807479999:web:fa252d5b47469891029a0a",
    measurementId: "G-VQXRKDQFPJ"
  };

  // 2) Paste YOUR account's UID (the editor's sign-in bar prints it after you
  //    log in the first time). It must match the uid in firestore.rules /
  //    storage.rules.
  const OWNER_UID = "URBZG88uPMNkaHhZoRRtIqvo9hl2";

  const hasSDK = typeof firebase !== "undefined" && typeof firebase.initializeApp === "function";
  const configured = hasSDK && FIREBASE_CONFIG.apiKey && !String(FIREBASE_CONFIG.apiKey).startsWith("TODO");

  if (configured) {
    if (!firebase.apps || !firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
    window.__DNGN_FB = {
      configured: true,
      OWNER_UID: OWNER_UID,
      // Only wire the products whose compat SDK the current page actually loaded.
      auth:    (typeof firebase.auth      === "function") ? firebase.auth()      : null,
      db:      (typeof firebase.firestore === "function") ? firebase.firestore() : null,
      storage: (typeof firebase.storage   === "function") ? firebase.storage()   : null
    };
  } else {
    window.__DNGN_FB = { configured: false, OWNER_UID: OWNER_UID, auth: null, db: null, storage: null };
    if (!hasSDK) console.info("[DNGN] Firebase SDK not present on this page.");
    else console.info("[DNGN] Firebase not configured yet — see FIREBASE_SETUP.md. Editor uses copy-paste; comic uses built-in pages only.");
  }
})();
