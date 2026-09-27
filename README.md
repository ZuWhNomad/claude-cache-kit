# claude-cache-kit

In Claude Code, say: Install claude-cache-kit by following https://github.com/ZuWhNomad/claude-cache-kit/blob/main/INSTALL.md

cache-kit is a Claude Code plugin for prompt-cache hygiene. It provides a local statusline showing model, context usage, cache state, hit ratio, and recent cache-miss causes, plus guidance for keeping request prefixes stable.

## Install as a plugin

```text
/plugin marketplace add ZuWhNomad/claude-cache-kit
/plugin install cache-kit@claude-cache-kit
/cache-kit:setup
```

The setup command copies the statusline to a stable user path, proposes `statusLine`, `env.CLAUDE_AUTOCOMPACT_PCT_OVERRIDE: "70"`, and `promptCacheTtl: "1h"`, shows the exact diff, and asks once before changing settings.

## Verify it works

After running `/cache-kit:setup`, the statusline should show `ctx N%` immediately. The cache state, hit ratio, and recent miss fields appear after Claude Code receives its first reply.

This requires Claude Code >= 2.1.251 for the cache fields and >= 2.1.260 for the last-miss cause. When the cache is cold, `/compact` adds no extra cache cost; it still reads the context once, but the next turn would pay that read anyway.

## Requirements

- Claude Code >= 2.1.251 for cache fields and >= 2.1.260 for the last-miss cause.
- Node.js >= 18 on `PATH` for the statusline command.

## Why

An unchanged request prefix is billed at about one-tenth of the input price. A changed prefix turns the remainder into a cache miss, and an idle session's cache expires after roughly 5 minutes for API keys or 1 hour for Claude subscriptions.

## What it can't do

Claude Code has no idle- or TTL-triggered compaction setting or hook output. The statusline can tell you when compacting adds no extra cache cost, but compaction still summarises the whole conversation; there is no compact-to-40% control. Setup sets `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=70`, which makes automatic compaction trigger at 70% of the auto-compact window instead of the default (it can only lower the threshold). The status line's `ctx %` is measured against the full context window, so it is not the same number as the compaction trigger.

**Fix for 0.1.0 installs:** 0.1.0 wrote `"autoCompactWindow": 70`. That key is a token count (100000–1000000), so 70 was clamped to 100000 tokens and compaction ran far too early. Re-run the install (or `/cache-kit:setup`); it removes the key.

## Subagents and the 1-hour cache

Subagents and workflow agents use a 5-minute cache by default, even on subscriptions (`subagentPromptCacheTtl`). cache-kit leaves that alone on purpose: in a measured 14 days of real sessions, subagents already hit the cache 97% of the time, and 1-hour writes cost 2× base input vs 1.25× for 5-minute ones, so a global 1 h would have cost far more than it saved. Use it per agent instead, for agent types that sit idle more than 5 minutes between requests (long builds, slow tools):

```yaml
---
name: my-slow-agent
experimental:
  cacheTtl: 1h
---
```

Or set `"subagentPromptCacheTtl": "1h"` globally only if your subagents regularly idle past 5 minutes. The statusline and settings changes run locally; no data leaves the machine.

## License

MIT. See [LICENSE](LICENSE).
