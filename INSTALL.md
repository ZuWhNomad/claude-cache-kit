# Agent installation instructions

Follow these instructions when a user says: “install claude-cache-kit from https://github.com/ZuWhNomad/claude-cache-kit”. You are the Claude Code agent performing the installation.

1. Resolve the user's Claude configuration directory as `~/.claude`. Resolve the user's home directory to an absolute path before writing the settings command.
2. Download `plugins/cache-kit/statusline/statusline.mjs` from the raw repository URL [`https://raw.githubusercontent.com/ZuWhNomad/claude-cache-kit/main/plugins/cache-kit/statusline/statusline.mjs`](https://raw.githubusercontent.com/ZuWhNomad/claude-cache-kit/main/plugins/cache-kit/statusline/statusline.mjs). If the user has a local clone, copy the same file from that clone instead. Save it as `~/.claude/cache-kit/statusline.mjs`, creating the destination directory if necessary.
3. If `~/.claude/settings.json` exists, copy it to `~/.claude/settings.json.bak-cache-kit` before changing it. Do not overwrite an existing backup; tell the user that the existing backup is being preserved. If the settings file does not exist, start from an empty JSON object and create it only after confirmation.
4. Read the settings and prepare a merge that preserves every existing key except the three cache-kit keys being set:

   ```json
   {
     "statusLine": {
       "type": "command",
       "command": "node <absolute path to>/.claude/cache-kit/statusline.mjs"
     },
     "autoCompactWindow": 70,
     "promptCacheTtl": "1h"
   }
   ```

   Replace the placeholder with the user's actual absolute home path. Explain that `promptCacheTtl: "1h"` is explicit for API-key users and already matches the main-conversation subscription default; the longer TTL can cost more on short bursts that never idle past five minutes. Do not add or modify `subagentPromptCacheTtl`.
5. Show the exact JSON diff, including any existing values that will be replaced, and ask the user once whether to apply it. Do not write the merged settings until the user confirms.
6. After confirmation, write the merged settings and tell the user to restart Claude Code. Explain that the statusline should show `ctx N%` immediately; after the first reply it should also show cache state and hit ratio, and it may show a recent miss cause. When the cache is cold and context is at least 40%, it should say `cache cold: /compact adds no cache cost`.

## Uninstall

If the user wants to uninstall cache-kit, either restore `~/.claude/settings.json.bak-cache-kit` over `~/.claude/settings.json`, or remove only the three cache-kit keys (`statusLine`, `autoCompactWindow`, and `promptCacheTtl`) while preserving unrelated settings. Then remove the `~/.claude/cache-kit/` folder. Do not remove unrelated Claude configuration.
