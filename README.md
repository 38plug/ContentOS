# ContentOS

Editorial content tracker + YouTube clipping suite (Shorts / Reels / TikTok).

## Open the running app (Cloud Agent)

1. Open the agent **desktop / live preview**: [Try Live](https://cursor.com/agents/bc-12396b51-81cd-5abf-bb41-35a9298c5bb3)
2. On the login screen, click **Open a private studio** (creates a unique account in this browser).
3. You’ll land in Studio with seeded posts and a sample clip.

Do not expect a public `localhost` URL on your laptop — the preview runs inside the agent environment.

## Local develop (this repo)

```bash
npm install
npm run dev
```

App listens on `0.0.0.0:8080`. Auth is on — use **Open a private studio** or email sign-up.

## Scripts

- `npm run typecheck`
- `npm run build` (includes PGLite WASM copy for preview)
- `npm run preview:restart` — production preview on `:8081`
