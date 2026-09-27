---
name: cache-hygiene
description: Explain Claude Code prompt-cache costs, cache hits and misses, context growth, compaction timing, cache-breaking changes, or prompt-cache settings.
---

Prompt-cache hygiene guidance:

- Keep the request prefix stable. Unchanged prefixes can be served from cache; a changed prefix makes the later portion a miss.
- Cache-breaking mid-session changes include `/model`, effort changes (except Opus 5.5 and Fable 5.1), fast mode toggles, connecting or disconnecting MCP servers, enabling or disabling plugins that add MCP servers, and Claude Code upgrades.
- Cache-safe changes include editing files, permission mode, output style, skills and commands, subagents, and `/rewind`. Editing `CLAUDE.md` takes effect after `/clear` or a restart.
- When the cache is cold, `/compact` adds no extra cache cost. Prefer it before continuing a large context rather than compacting mid-flow after rebuilding a warm cache.
- Batch MCP and model changes at session start. After a long idle gap, expect a miss because the cache may have expired.
- If `ANTHROPIC_BASE_URL` points at a gateway, caching works only when it forwards `cache_control` unchanged. A gateway that strips it can make the whole history uncached on every turn.
