# claude-cache-kit

In Claude Code, say: Install claude-cache-kit by following https://github.com/ZuWhNomad/claude-cache-kit/blob/main/INSTALL.md

cache-kit is a Claude Code plugin for prompt-cache hygiene. It provides a local statusline showing model, context usage, cache state, hit ratio, and recent cache-miss causes, plus guidance for keeping request prefixes stable.

## Install as a plugin

```text
/plugin marketplace add ZuWhNomad/claude-cache-kit
/plugin install cache-kit@claude-cache-kit
/cache-kit:setup
```

The setup command copies the statusline to a stable user path, proposes `statusLine`, `autoCompactWindow: 70`, and `promptCacheTtl: "1h"`, shows the exact diff, and asks once before changing settings.

## Verify it works

After running `/cache-kit:setup`, the statusline should show `ctx N%` immediately. The cache state, hit ratio, and recent miss fields appear after Claude Code receives its first reply.

This requires Claude Code >= 2.1.251 for the cache fields and >= 2.1.260 for the last-miss cause. When the cache is cold, `/compact` adds no extra cache cost; it still reads the context once, but the next turn would pay that read anyway.

## Requirements

- Claude Code >= 2.1.251 for cache fields and >= 2.1.260 for the last-miss cause.
- Node.js >= 18 on `PATH` for the statusline command.

## Why

An unchanged request prefix is billed at about one-tenth of the input price. A changed prefix turns the remainder into a cache miss, and an idle session's cache expires after roughly 5 minutes for API keys or 1 hour for Claude subscriptions.

## What it can't do

Claude Code has no idle- or TTL-triggered compaction setting or hook output. The statusline can tell you when compacting adds no extra cache cost, but compaction still summarises the whole conversation; there is no compact-to-40% control. Setup sets `autoCompactWindow` to 70%, which triggers automatic compaction at 70% context fullness.

The optional `subagentPromptCacheTtl` setting is not changed by cache-kit. A longer subagent TTL can cost more on short bursts of work that never idle past five minutes. The statusline and settings changes run locally; no data leaves the machine.

## License

MIT. See [LICENSE](LICENSE).
