---
description: Set up the cache-kit statusline and optionally configure prompt-cache settings.
---

Set up the cache-kit statusline and optionally apply prompt-cache settings for the user.

1. Detect the user's settings file at `~/.claude/settings.json`. If it does not exist, treat it as an empty JSON object and explain that the file will be created.
2. Try to resolve `${CLAUDE_PLUGIN_ROOT}`. Use it only if it resolves to an existing directory containing `statusline/statusline.mjs`. If it does not, search `~/.claude/plugins/` for the installed `cache-kit` plugin, prefer the highest version, and identify the exact plugin root and `statusline/statusline.mjs` path found. Show the path you found to the user before copying. If neither lookup finds the script, stop and explain the missing path rather than guessing.
3. Copy the found `statusline/statusline.mjs` to `~/.claude/cache-kit/statusline.mjs`. Create the destination directory if needed. The copied file keeps the statusline path stable across plugin updates.
4. Read the existing settings without discarding unrelated keys. If `statusLine` already exists, show its current value and do not overwrite it without asking the user first.
5. Prepare the exact JSON diff for the proposed changes. The statusline entry is:

   ```json
   "statusLine": {
     "type": "command",
     "command": "node ~/.claude/cache-kit/statusline.mjs"
   }
   ```

   In the actual proposal, replace `~` with the absolute path resolved from the user's home directory; do not leave `~` or a placeholder in the file that will be written.
6. Ask the user to confirm the displayed diff before writing any settings change. Apply the statusline change only after confirmation.
7. Offer these optional presets separately, and apply each only if the user chooses it:

   - `"promptCacheTtl": "1h"`: this only helps API-key users with idle gaps longer than 5 minutes, and 1-hour cache writes cost more. Users on Claude subscriptions already get a 1-hour cache.
   - `"env": { "CLAUDE_AUTOCOMPACT_PCT_OVERRIDE": "70" }`: compact earlier to keep each turn's input smaller; this trades earlier summarisation for cheaper turns. Merge this key into an existing `env` object rather than replacing unrelated variables.

Show the complete JSON diff including each selected preset, ask for confirmation, and only then write it. Never overwrite an existing `statusLine` silently.
