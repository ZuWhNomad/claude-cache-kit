import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { formatStatusLine } from "../plugins/cache-kit/statusline/statusline.mjs";

const now = 1_700_000_000_000;
const plain = (fixture) => formatStatusLine(fixture, now, { color: false });

test("no prompt_cache yet", () => {
  assert.equal(
    plain({ model: { display_name: "Claude" }, context_window: { used_percentage: 43 } }),
    "Claude · ctx 43% · — · hit —"
  );
});

test("color is enabled by default and disabled by NO_COLOR", () => {
  const previous = process.env.NO_COLOR;
  try {
    delete process.env.NO_COLOR;
    assert.match(
      formatStatusLine({ model: { display_name: "Claude" } }, now),
      /\u001b\[36mClaude\u001b\[0m/
    );
    process.env.NO_COLOR = "1";
    assert.equal(
      formatStatusLine({ model: { display_name: "Claude" } }, now),
      "Claude · ctx — · — · hit —"
    );
  } finally {
    if (previous === undefined) delete process.env.NO_COLOR;
    else process.env.NO_COLOR = previous;
  }
});

test("warm with three minutes left and a recent miss cause", () => {
  assert.equal(
    plain({
      model: { display_name: "Claude" },
      context_window: { used_percentage: 43 },
      prompt_cache: {
        warm: true,
        expires_at: now / 1000 + 180,
        hit_ratio: 0.97,
        last_miss_at: now / 1000 - 60,
        last_miss_cause: { causes: ["model_switch"] }
      }
    }),
    "Claude · ctx 43% · warm 3:00 left · hit 97% · miss model_switch"
  );
});

test("cold at 55 percent suggests compacting", () => {
  assert.equal(
    plain({
      model: { id: "claude" },
      context_window: { used_percentage: 55 },
      prompt_cache: { warm: false, hit_ratio: 0.5 }
    }),
    "claude · ctx 55% · cold · hit 50% · cache cold: /compact adds no cache cost"
  );
});

test("warm at 80 percent has no compact hint", () => {
  assert.equal(
    plain({
      model: { display_name: "Claude" },
      context_window: { used_percentage: 80 },
      prompt_cache: { warm: true, expires_at: now / 1000 + 30, hit_ratio: 1 }
    }),
    "Claude · ctx 80% · warm 0:30 left · hit 100%"
  );
});

test("miss causes older than ten minutes are omitted", () => {
  assert.equal(
    plain({
      model: { display_name: "Claude" },
      context_window: { used_percentage: 20 },
      prompt_cache: {
        warm: false,
        hit_ratio: 0.8,
        last_miss_at: now / 1000 - 601,
        last_miss_cause: { causes: ["idle"] }
      }
    }),
    "Claude · ctx 20% · cold · hit 80%"
  );
});

test("missing fields degrade to em dashes", () => {
  assert.equal(plain({}), "— · ctx — · — · hit —");
});

test("garbage stdin never throws and exits successfully", () => {
  const result = spawnSync(
    process.execPath,
    ["plugins/cache-kit/statusline/statusline.mjs"],
    { input: "not json", encoding: "utf8", env: { ...process.env, NO_COLOR: "1" } }
  );
  assert.equal(result.status, 0);
  assert.equal(result.stderr, "");
  assert.equal(result.stdout, "— · ctx — · — · hit —\n");
});
