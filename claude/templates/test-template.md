# Test: <name>

## Flow to verify
<What user flow or feature this test covers — link the `features/<name>.md`
or `updates/<name>.md` it corresponds to.>

## Pre-conditions
<e.g. web dev server running (`npm run dev`), backend API running (`npm run
server`), mobile app pointed at the right `EXPO_PUBLIC_API_URL`, specific
seed data or login state needed.>

## Steps
1. ...
2. ...
3. ...

## Expected result
<What should happen at each key step, and what the end state should look
like.>

## Automated checks the agent should run
- `npx tsc --noEmit -p tsconfig.json` (web app, and `mobile-app/` if touched)
- `npx eslint <changed files>`
- <any other repo-specific check — a script, a migration dry run, etc.>

## Manual verification (human)
<What the human should look at after the agent reports the automated checks
passed — e.g. reload the web app, or reload the mobile app on-device.>
