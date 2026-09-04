# tests/

One file per flow to verify: `tests/test-<name>.md`, copied from
`../templates/test-template.md`.

Describes exactly how the agent should test the flow after implementing or
updating a feature — steps, expected results, and which automated checks
(`tsc`, `eslint`, etc.) to run for whichever app (web root or `mobile-app/`)
was touched. The agent runs this after its own change; a human verifies
again afterward.
