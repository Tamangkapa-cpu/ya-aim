const STORE_KEY = "ya-aim-v0";

const defaultState = () => ({
  profile: { name: "You", yaName: "Я" },
  memories: [],
  messages: [],
  functions: [
    { id: "chat.send", name: "Send message", enabled: true, version: "0.0.1" },
    { id: "memory.remember", name: "Remember facts", enabled: true, version: "0.0.1" },
    { id: "memory.recall", name: "Recall facts", enabled: true, version: "0.0.1" },
    { id: "log.download", name: "Download chat log", enabled: true, version: "0.0.1" },
    { id: "essence.export", name: "Export Essence", enabled: true, version: "0.0.1" },
    { id: "model.local", name: "On-device model", enabled: false, version: "stub" },
    { id: "model.remote", name: "Remote model", enabled: false, version: "stub" },
    { id: "voice.listen", name: "Voice in", enabled: false, version: "stub" },
    { id: "voice.speak", name: "Voice out", enabled: false, version: "stub" }
  ]
});

let state = load();

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    const base = defaultState();
    return {
      ...base,
      ...parsed,
      functions: mergeFunctions(base.functions, parsed.functions || [])
    };
  } catch {
    return defaultState();
  }
}

function mergeFunctions(base, saved) {
  const map = new Map(saved.map((f) => [f.id, f]));
  return base.map((f) => ({ ...f, ...map.get(f.id) }));
}

function save() {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

function online() {
  return navigator.onLine;
}

function fnEnabled(id) {
  return state.functions.some((f) => f.id === id && f.enabled);
}

function remember(text) {
  if (!fnEnabled("memory.remember")) return;
  const clean = text.trim();
  if (clean.length < 2) return;
  const fact = { id: crypto.randomUUID(), text: clean, at: Date.now() };
  state.memories.unshift(fact);
  state.memories = state.memories.slice(0, 200);
}

function extractMemories(userText) {
  const t = userText.trim();
  const named = t.match(/^(?:my name is|i am|i'm|call me)\s+(.+)/i);
  if (named) {
    state.profile.name = named[1].replace(/[.?!:].*$/, "").trim();
    remember(`User's name is ${state.profile.name}`);
  }
  const like = t.match(/i (?:like|love|enjoy)\s+(.+)/i);
  if (like) remember(`Likes ${like[1].replace(/[.?!:].*$/, "").trim()}`);
  const live = t.match(/i live in\s+(.+)/i);
  if (live) remember(`Lives in ${live[1].replace(/[.?!:].*$/, "").trim()}`);
  if (/remember this[:\s]/i.test(t)) {
    remember(t.replace(/.*remember this[:\s]*/i, ""));
  }
}

function recall(query) {
  if (!fnEnabled("memory.recall") || state.memories.length === 0) return [];
  const q = query.toLowerCase();
  const scored = state.memories.map((m) => {
    const hay = m.text.toLowerCase();
    let score = 0;
    q.split(/\W+/).filter(Boolean).forEach((w) => {
      if (hay.includes(w)) score += 1;
    });
    return { m, score };
  });
  return scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score).slice(0, 4).map((s) => s.m);
}

function localEngine(userText) {
  extractMemories(userText);
  const q = userText.toLowerCase();
  const hits = recall(userText);

  if (/^(hi|hello|hey|yo|good (morning|evening|afternoon))\b/.test(q)) {
    return `Hello${state.profile.name !== "You" ? ", " + state.profile.name : ""}. I am Я. I keep memory on this device. Speak, and I will hold it.`;
  }
  if (/who are you|what are you|your name/.test(q)) {
    return "I am Я AI\u1d50, version 0. A small conversational engine. I work offline. I remember what you give me. I can grow functions.";
  }
  if (/what can you do|help|commands/.test(q)) {
    const on = state.functions.filter((f) => f.enabled).map((f) => f.id).join(", ");
    return `Enabled functions:\n${on}\n\nSay \u201cremember this: \u2026\u201d to store a fact.\nOpen Я to download the log or export Essence.`;
  }
  if (/what do you remember|what do you know about me|memory/.test(q)) {
    if (!state.memories.length) return "I have no stored facts yet. Tell me your name, or say \u201cremember this: \u2026\u201d.";
    return "What I hold:\n" + state.memories.slice(0, 12).map((m) => "\u2022 " + m.text).join("\n");
  }
  if (/offline|online|network/.test(q)) {
    return online()
      ? "The network is present. I still think locally unless a remote model function is enabled."
      : "We are offline. That is the default mode. Memory and logs still work.";
  }
  if (hits.length) {
    return "From memory:\n" + hits.map((m) => "\u2022 " + m.text).join("\n") + "\n\nSay more and I will keep it.";
  }
  remember("User said: " + userText.slice(0, 180));
  return "Held. I have no larger model loaded in v0, so I answer from memory and pattern. Add `model.local` later. What should I remember next?";
}

async function answer(userText) {
  if (fnEnabled("model.remote") && online()) {
    try {
      return await remoteStub(userText);
    } catch {
      return localEngine(userText);
    }
  }
  if (fnEnabled("model.local")) {
    return "On-device model is registered but not installed in v0. Falling back.\n\n" + localEngine(userText);
  }
  return localEngine(userText);
}

async function remoteStub() {
  throw new Error("no remote endpoint in v0");
}

function push(role, text) {
  state.messages.push({ role, text, at: Date.now() });
  save();
  render();
}

async function send(text) {
  const t = text.trim();
  if (!t || !fnEnabled("chat.send")) return;
  push("user", t);
  const reply = await answer(t);
  push("ya", reply);
}

function formatLog(kind) {
  const title = "Я AI\u1d50 chat log";
  const stamp = new Date().toISOString();
  if (kind === "json") {
    return JSON.stringify({ title, stamp, profile: state.profile, messages: state.messages, memories: state.memories }, null, 2);
  }
  const lines = state.messages.map((m) => {
    const who = m.role === "user" ? state.profile.name : "Я";
    const time = new Date(m.at).toLocaleString();
    if (kind === "md") return `**${who}** \u00b7 ${time}\n\n${m.text}\n`;
    return `${who} (${time})\n${m.text}\n`;
  });
  const head = kind === "md" ? `# ${title}\n\n_${stamp}_\n\n` : `${title}\n${stamp}\n\n`;
  return head + lines.join("\n");
}

function download(kind) {
  if (!fnEnabled("log.download") && kind !== "essence") return;
  let body, name, type;
  if (kind === "essence") {
    if (!fnEnabled("essence.export")) return;
    body = JSON.stringify({
      kind: "ya-essence",
      version: "0",
      mark: "Я",
      exportedAt: new Date().toISOString(),
      profile: state.profile,
      memories: state.memories,
      functions: state.functions,
      messages: state.messages
    }, null, 2);
    name = "ya-essence-v0.json";
    type = "application/json";
  } else if (kind === "json") {
    body = formatLog("json");
    name = "ya-chat.json";
    type = "application/json";
  } else if (kind === "md") {
    body = formatLog("md");
    name = "ya-chat.md";
    type = "text/markdown";
  } else {
    body = formatLog("txt");
    name = "ya-chat.txt";
    type = "text/plain";
  }
  const blob = new Blob([body], { type });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}

function clearChat() {
  state.messages = [];
  save();
  render();
}

function resetAll() {
  state = defaultState();
  save();
  render();
  renderPanel();
}

function toggleFn(id) {
  const f = state.functions.find((x) => x.id === id);
  if (!f) return;
  if (["chat.send", "memory.remember", "memory.recall", "log.download", "essence.export"].includes(id)) return;
  f.enabled = !f.enabled;
  save();
  renderPanel();
}

const logEl = document.getElementById("log");
const form = document.getElementById("composer");
const input = document.getElementById("input");
const panel = document.getElementById("panel");
const netDot = document.getElementById("net-dot");
const netLabel = document.getElementById("net-label");

function renderNet() {
  const on = online();
  netDot.classList.toggle("offline", !on);
  netLabel.textContent = on ? "online \u00b7 local engine" : "offline \u00b7 local engine";
}

function render() {
  renderNet();
  if (!state.messages.length) {
    logEl.innerHTML = `<div class="empty"><div class="big">Я</div><div>Version 0. Memory lives on this device.<br>Type to begin.</div></div>`;
    return;
  }
  logEl.innerHTML = state.messages.map((m) => {
    const who = m.role === "user" ? state.profile.name : "Я";
    return `<article class="msg ${m.role}"><div class="who">${escapeHtml(who)}</div>${escapeHtml(m.text)}</article>`;
  }).join("");
  logEl.scrollTop = logEl.scrollHeight;
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function renderPanel() {
  document.getElementById("name-input").value = state.profile.name;
  document.getElementById("fn-list").innerHTML = state.functions.map((f) => {
    const canToggle = !["chat.send", "memory.remember", "memory.recall", "log.download", "essence.export"].includes(f.id);
    return `<div class="row"><div><div>${escapeHtml(f.name)}</div><div class="fn">${f.id} \u00b7 ${f.version}</div></div>
      ${canToggle
        ? `<button data-fn="${f.id}">${f.enabled ? "on" : "off"}</button>`
        : `<span class="${f.enabled ? "on" : "off"}">${f.enabled ? "on" : "off"}</span>`}
    </div>`;
  }).join("");
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const v = input.value;
  input.value = "";
  send(v);
});

document.getElementById("open-panel").addEventListener("click", () => {
  panel.classList.add("open");
  renderPanel();
});
panel.addEventListener("click", (e) => {
  if (e.target === panel) panel.classList.remove("open");
  const id = e.target.getAttribute("data-fn");
  if (id) toggleFn(id);
});
document.getElementById("name-input").addEventListener("change", (e) => {
  state.profile.name = e.target.value.trim() || "You";
  save();
});
document.getElementById("dl-txt").addEventListener("click", () => download("txt"));
document.getElementById("dl-md").addEventListener("click", () => download("md"));
document.getElementById("dl-json").addEventListener("click", () => download("json"));
document.getElementById("dl-essence").addEventListener("click", () => download("essence"));
document.getElementById("clear-chat").addEventListener("click", clearChat);
document.getElementById("reset-all").addEventListener("click", resetAll);

window.addEventListener("online", renderNet);
window.addEventListener("offline", renderNet);

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}

render();
