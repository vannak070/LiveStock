# features/

One file per new feature: `features/<name>.md`, copied from
`../templates/feature-template.md`.

Include text description, images/mockups, Jira link, Figma link, the API
functions/endpoints involved, and the base-code paths the feature touches
— say whether it belongs to the web app or `mobile-app/`, since they're
separate projects with separate `package.json`/`tsconfig.json`. The agent
implements the feature from this file — the more complete it is, the less
back-and-forth needed.

After the agent's output, a human reviews it: fix small things by hand, or
write a follow-up file in `../updates/` for anything bigger. Then run the
matching file in `../tests/`.
