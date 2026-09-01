# Я AIᵐ architecture — v0.1

## Law

1. The app runs offline from the first launch.
2. The creator of a model mints its Essence.
3. A minted Essence can be downloaded again at any time from the local vault.
4. A network is never required for talk, memory, mint, or download.

## Offline from the start

No feature waits on a server.

- UI, engine, memory, mint, and vault live in the page and localStorage.
- A service worker caches the app shell.
- model.remote exists only as a later optional function.

## Essence

Portable soul of this model instance:

- model id, name, engine
- creator public key
- profile, memories, functions, chat archive
- ECDSA P-256 signature over stable JSON

Minting uses Web Crypto on-device. The private key never leaves the device.

working copy --mint--> signed Essence --store--> vault --download anytime--> .json

The vault keeps the last 50 mints.

## Creator

On first run the app generates a P-256 keypair stored under ya-aim-creator.
Resetting the working chat does not destroy the creator key or the vault.

## Functions

Always on: chat.send, memory.remember, memory.recall, log.download, essence.mint, essence.download

Stubs: model.local, model.remote, voice.listen, voice.speak
