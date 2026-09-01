# Я AIᵐ architecture — v0

## Principle

The app must still talk if the cable is cut.

```
[ UI ]
   |
[ Session  ]  ← messages in this chat
   |
[ Memory   ]  ← durable facts, profile, past turns
   |
[ Engine   ]  ← local responder (v0) / model adapter (later)
   |
[ Functions]  ← empty registry that grows
```

Online is an *adapter*, not the spine.

## Essence

An Essence is everything that makes *this* Я instance itself:

- profile name
- memories
- function list
- chat archives

v0 stores Essence in the browser (`localStorage` + structured JSON export).
Later versions mint Essence as a signed file the creator can re-download.

## Function registry

Each function is:

```json
{
  "id": "export.log",
  "name": "Export log",
  "enabled": true,
  "version": "0.0.1"
}
```

v0 ships with:

- `chat.send`
- `memory.remember`
- `memory.recall`
- `log.download`
- `essence.export`

Disabled stubs ready to grow:

- `model.local` — on-device weights
- `model.remote` — optional API
- `voice.listen`
- `voice.speak`

Enable a stub and implement its handler. The chat loop already asks the registry before it answers.

## Offline / online

| Mode | Behavior |
|---|---|
| Offline | Local engine only. Memory still works. Logs still export. |
| Online | Same engine. Remote model function may run *if enabled and reachable*. If it fails, fall back local. |

No feature in v0 requires the network.

## Platforms

Same web core:

- iOS Safari / Home Screen
- Android Chrome / TWA
- HarmonyOS Web / WebView

Flutter shell in `flutter/` is a blank native window pointed at the same ideas for a later compile.
