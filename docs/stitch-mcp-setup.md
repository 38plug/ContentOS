# Google Stitch MCP setup (ContentOS)

Stitch is a **remote** MCP server (`https://stitch.googleapis.com/mcp`). It is not an npm package you run locally — Cursor connects to Google’s endpoint with your API key.

## 1. Create a Stitch API key

1. Open [Stitch Settings](https://stitch.withgoogle.com/settings) (or [labs.google/stitch](https://labs.google/stitch) → Settings).
2. Under **API Keys**, create a key and copy it.
3. Do **not** paste the key into chat or commit it to git.

## 2. Cursor Desktop (this repo)

1. Copy the example config:

```bash
cp .cursor/mcp.json.example .cursor/mcp.json
```

2. Replace `YOUR_STITCH_API_KEY` in `.cursor/mcp.json` with your key.
3. Restart Cursor (or reload MCP servers).
4. **Settings → Features → MCP** — confirm `stitch` is connected (green).
5. In Agent mode, try: “List my Stitch projects.”

`.cursor/mcp.json` is gitignored. The committed template is `.cursor/mcp.json.example`.

## 3. Cursor Cloud Agents

Project MCP files alone may not attach to a cloud run. Add Stitch on the Cloud Agents environment:

1. Open [Cloud Agents environments](https://cursor.com/dashboard/cloud-agents/environments).
2. Edit the environment used for ContentOS.
3. Add an MCP server pointing at `https://stitch.googleapis.com/mcp` with header `X-Goog-Api-Key: <your key>` (or the dashboard’s secret binding for that header).
4. Start a new agent on that environment so tools are discovered.

## 4. Optional: Stitch design skills

Skills that help agents write Stitch-friendly `DESIGN.md` prompts:

```bash
npx skills add google-labs-code/stitch-skills
```

Or the Cursor plugin:

```bash
npx plugins add google-labs-code/stitch-skills --scope workspace --target cursor
```

These skills expect the Stitch MCP server to already be configured.

## Network

Allow outbound access to:

- `stitch.googleapis.com`
- `storage.googleapis.com` (exports / screenshots)
- `accounts.google.com` (if using OAuth instead of an API key)
