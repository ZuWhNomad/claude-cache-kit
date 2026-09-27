import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const MISSING = "—";
const TEN_MINUTES_MS = 10 * 60 * 1000;

function plainText(value) {
  return String(value).replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").trim();
}

function finiteNumber(value) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : null;
}

function modelName(data) {
  const model = data && typeof data.model === "object" ? data.model : {};
  const value = model.display_name ?? model.id;
  return value == null || plainText(value) === "" ? MISSING : plainText(value);
}

function contextText(data) {
  const context = data && typeof data.context_window === "object" ? data.context_window : {};
  const value = finiteNumber(context.used_percentage);
  if (value == null) return MISSING;
  return String(Math.max(0, Math.min(100, Math.round(value))));
}

function cacheState(data, now) {
  const cache = data && typeof data.prompt_cache === "object" ? data.prompt_cache : null;
  if (!cache) return { text: MISSING, kind: "missing" };
  if (cache.warm === false) return { text: "cold", kind: "cold" };
  if (cache.warm !== true) return { text: MISSING, kind: "missing" };

  const expiresAt = finiteNumber(cache.expires_at);
  if (expiresAt == null) return { text: MISSING, kind: "missing" };
  const remainingSeconds = Math.ceil((expiresAt * 1000 - now) / 1000);
  if (remainingSeconds <= 0) return { text: "cold", kind: "cold" };

  if (remainingSeconds >= 60 * 60) {
    const hours = Math.floor(remainingSeconds / (60 * 60));
    const minutes = Math.floor((remainingSeconds % (60 * 60)) / 60);
    const seconds = remainingSeconds % 60;
    return {
      text: `warm ${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")} left`,
      kind: "warm"
    };
  }

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  return {
    text: `warm ${minutes}:${String(seconds).padStart(2, "0")} left`,
    kind: "warm"
  };
}

function hitText(data) {
  const cache = data && typeof data.prompt_cache === "object" ? data.prompt_cache : {};
  const ratio = finiteNumber(cache.hit_ratio);
  if (ratio == null) return MISSING;
  return String(Math.max(0, Math.min(100, Math.round(ratio * 100))));
}

function causeText(value) {
  if (typeof value === "string" || typeof value === "number") {
    const text = plainText(value);
    return text || MISSING;
  }
  if (Array.isArray(value)) {
    const text = value.map(causeText).filter((item) => item !== MISSING).join(", ");
    return text || MISSING;
  }
  if (value && typeof value === "object") {
    if (Array.isArray(value.causes)) return causeText(value.causes);
    return causeText(value.cause ?? value.reason ?? value.name);
  }
  return MISSING;
}

function lastMiss(data, now) {
  const cache = data && typeof data.prompt_cache === "object" ? data.prompt_cache : null;
  if (!cache) return null;
  const timestamp = finiteNumber(cache.last_miss_at);
  if (timestamp == null) return null;
  const age = now - timestamp * 1000;
  if (age < 0 || age > TEN_MINUTES_MS) return null;
  return `miss ${causeText(cache.last_miss_cause)}`;
}

function colorize(text, code, enabled) {
  return enabled ? `\u001b[${code}m${text}\u001b[0m` : text;
}

export function formatStatusLine(data, now = Date.now(), options = {}) {
  const safeData = data && typeof data === "object" ? data : {};
  const context = contextText(safeData);
  const state = cacheState(safeData, now);
  const hit = hitText(safeData);
  const miss = lastMiss(safeData, now);
  const useColor = process.env.NO_COLOR === undefined && options.color !== false;

  const parts = [
    colorize(modelName(safeData), "36", useColor),
    colorize(context === MISSING ? `ctx ${MISSING}` : `ctx ${context}%`, "34", useColor),
    colorize(state.text, state.kind === "warm" ? "32" : state.kind === "cold" ? "33" : "90", useColor),
    colorize(hit === MISSING ? `hit ${MISSING}` : `hit ${hit}%`, "35", useColor)
  ];

  if (miss) parts.push(colorize(miss, "90", useColor));

  const contextValue = finiteNumber(safeData.context_window?.used_percentage);
  if (state.kind === "cold" && contextValue != null && contextValue >= 40) {
    parts.push(colorize("cache cold: /compact adds no cache cost", "90", useColor));
  } else if (state.kind === "warm" && contextValue != null && contextValue >= 70) {
    parts.push(colorize("consider /compact", "90", useColor));
  }

  return parts.join(" · ");
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  let input = "";
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (chunk) => {
    input += chunk;
  });
  process.stdin.on("end", () => {
    let data = {};
    try {
      data = JSON.parse(input);
    } catch {
      data = {};
    }
    try {
      process.stdout.write(`${formatStatusLine(data)}\n`);
    } catch {
      process.stdout.write(`${formatStatusLine({})}\n`);
    }
  });
  process.stdout.on("error", () => {});
}
