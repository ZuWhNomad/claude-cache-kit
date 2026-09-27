# cache-kit

cache-kit is a Claude Code plugin for prompt-cache hygiene. It provides a local statusline showing model, context usage, cache state, hit ratio, and recent cache-miss causes, plus guidance for keeping request prefixes stable.

## Install

```sh
claude plugin marketplace add owner/repo
claude plugin install cache-kit@cache-kit
```

Run `/cache-kit:setup` in Claude Code to copy the statusline to a stable user path, review the exact settings diff, and optionally choose the two prompt-cache presets. The command asks for confirmation before changing settings.

## Verify it works

After running `/cache-kit:setup`, the statusline should show `ctx N%` immediately. The cache state, hit ratio, and recent miss fields appear after Claude Code receives its first reply.

This requires Claude Code >= 2.1.251 for the cache fields and >= 2.1.260 for the last-miss cause. When the cache is cold, `/compact` adds no extra cache cost; it still reads the context once, but the next turn would pay that read anyway.

## Requirements

- Claude Code >= 2.1.251 for cache fields and >= 2.1.260 for the last-miss cause.
- Node.js >= 18 on `PATH` for the statusline command.

## Why

An unchanged request prefix is billed at about one-tenth of the input price. A changed prefix turns the remainder into a cache miss, and an idle session's cache expires after roughly 5 minutes for API keys or 1 hour for Claude subscriptions.

## What it does not do

cache-kit does not control auto-compaction beyond optionally setting `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE`; `autoCompactWindow` has an undocumented format and is not changed. It does not send statusline data or settings anywhere: the statusline runs locally and the plugin contains no network service.

## License

MIT. See [LICENSE](LICENSE).
