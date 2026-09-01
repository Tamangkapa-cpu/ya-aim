# Я AIᵐ — version 0.1

A simple conversational AI for **iOS, Android, and HarmonyOS**.

- Logo: **Я**
- **Offline from the first launch**
- The **creator mints** the Essence of the model
- A minted Essence is **downloadable at any time** from the local vault
- Chat logs download as `.txt` `.md` `.json`
- Functions can be added later without rewriting the shell

Repo: https://github.com/Tamangkapa-cpu/ya-aim

## Offline first

Talk, memory, mint, and download do not call a server. A network can exist. The app does not need it.

## Essence

You are the creator.

1. Use the model. It remembers on this device.
2. Tap **Mint Essence** (or say “mint”).
3. The app signs the model with a key generated on this device.
4. The sealed file is stored in the **Vault**.
5. Download that mint again whenever you want. No account. No cloud.

The private key never leaves the device.

## Run

```bash
cd web
python3 -m http.server 8080
```

Open `http://localhost:8080`. Add to Home Screen for app-like use.

## Layout

```
web/                 runnable app
docs/architecture.md
flutter/             native shell stub
```
