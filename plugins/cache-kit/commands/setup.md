---
description: Set up the cache-kit statusline and default prompt-cache and auto-compaction settings.
---

Set up the cache-kit statusline and apply the cache-kit defaults for the user.

1. Detect the user's settings file at `~/.claude/settings.json`. If it does not exist, treat it as an empty JSON object and explain that the file will be created.
2. Try to resolve `${CLAUDE_PLUGIN_ROOT}`. Use it only if it resolves to an existing directory containing `statusline/statusline.mjs`. If it does not, search `~/.claude/plugins/` for the installed `cache-kit` plugin, prefer the highest version, and identify the exact plugin root and `statusline/statusline.mjs` path found. Show the path you found to the user before copying. If neither lookup finds the script, stop and explain the missing path rather than guessing.
3. Copy the found `statusline/statusline.mjs` to `~/.claude/cache-kit/statusline.mjs`. Create the destination directory if needed. The copied file keeps the statusline path stable across plugin updates.
4. Read the existing settings without discarding unrelated keys. If `statusLine` already exists, show its current value in the diff and explain that this proposal replaces it.
5. Prepare the exact JSON diff for the proposed changes. By default, propose all three settings below:

   ```json
   {
     "statusLine": {
       "type": "command",
       "command": "node ~/.claude/cache-kit/statusline.mjs"
     },
     "env": { "CLAUDE_AUTOCOMPACT_PCT_OVERRIDE": "70" },
     "promptCacheTtl": "1h"
   }
   ```

   In the actual proposal, replace `~` with the absolute path resolved from the user's home directory; do not leave `~` or a placeholder in the file that will be written. Explain in one line that `promptCacheTtl: "1h"` is already the main-conversation subscription default, keeps a one-hour window for API-key users, and can cost more on short bursts that never idle past five minutes. Merge `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` into any existing `env` object; it triggers auto-compaction at 70% of the auto-compact window and can only lower the threshold. Do not add or modify `subagentPromptCacheTtl`. If the existing settings contain `"autoCompactWindow": 70` (written by cache-kit 0.1.0, which misread that key: it is a token count, so 70 was clamped to 100000 tokens), remove that key in the same diff.
6. Show the complete JSON diff and ask the user once to confirm applying all three defaults. Apply the settings only after that confirmation. Preserve every unrelated key and never overwrite an existing `statusLine` silently.
