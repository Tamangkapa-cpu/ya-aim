# Я AIᵐ — version 0

A simple conversational AI that runs on **iOS, Android, and HarmonyOS**.

- Logo: **Я**
- Memory is local
- Chat log can be downloaded
- Works **online or offline**
- Built to **gain functions** without rewriting the core

Repo: https://github.com/Tamangkapa-cpu/ya-aim

## What v0 is

v0 is a working app, not a demo slide.

| Capability | v0 |
|---|---|
| Text chat | Yes |
| Persistent memory | Yes (device storage) |
| Download chat log | `.txt` `.md` `.json` |
| Offline | Yes — local engine + memory |
| Online | Optional — attach an API later |
| Evolve | Function registry. New abilities register themselves |

v0’s “model” is a **local memory engine**. It recalls what you said, keeps a profile, and answers from that. A full on-device LLM is a later function you drop in — the chat shell does not change.

## Run it now

Open `web/index.html` in a browser.

Or serve it:

```bash
cd web
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

Add to Home Screen on iOS / Android / Harmony to use it like an app. It works without a network after the first load if you host it with a service worker (included).

## Native wrappers

- **iOS / Android:** wrap `web/` with Capacitor or open the Flutter shell in `flutter/`
- **HarmonyOS:** load the same PWA in a Web component, or port the Flutter shell

The product logic lives in `web/app.js`. Keep that file as the source of truth for v0 behavior.

## Project layout

```
ya-aim/
  README.md
  docs/architecture.md
  web/                 ← runnable v0
  flutter/             ← native shell skeleton
```
