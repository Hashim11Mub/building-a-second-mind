# Building a Second Mind

**Making AI Tools Work Together** · Audience starter kit

One small project, several tools, and saved context you can inspect. Start with a Markdown decision, build a signup page with Claude Code, revise it with Codex, then optionally ask about it through OpenClaw and Telegram.

**[Open the slides](https://building-a-second-mind.vercel.app/)** · **[Audience start page](https://building-a-second-mind.vercel.app/start)** · **[Download starter vault](https://building-a-second-mind.vercel.app/assets/second-mind-starter.zip)**

## Start here

1. [Follow the quickstart](docs/QUICKSTART.md).
2. Open [starter-vault](starter-vault) as a folder in Obsidian and your coding agent.
3. Build, inspect, change one decision and check the actual result.

The ZIP contains the same starter vault and quickstart. It contains no credentials or generated project output. No Obsidian plugins, npm packages or custom MCP server are needed for the local file demo.

## What each tool does

| Tool | Role in the demo |
| --- | --- |
| Obsidian | Read, edit and link Markdown in a local folder. |
| Claude Code | Read the saved plan and build a local prototype. |
| Codex | Read the current files and revise the same prototype. |
| OpenClaw | Connect a configured assistant/runtime to workspace tools and optional channels. |
| Telegram | Another interface to your configured assistant. |

[Model, harness, loop, tools, API and MCP explained](docs/CONCEPTS.md).

Shared files provide explicit context. They do not automatically synchronise native chat histories or guarantee that the right note was retrieved. Check the source and the output.

## Repository contents

- `public/`: interactive slides, audience page and labelled prepared examples.
- `starter-vault/`: a clean, linked Obsidian starter with two demo instruction files and concept notes.
- `docs/`: exact prompts, checks, reset steps and key concepts.
- `vercel.json`: static deployment configuration.

The web presentation is a walkthrough. It does not run Claude/Codex, expose a local file server or connect to a Telegram bot. Real builds, file edits and messaging happen in your own tools with your own account access. The prototype form sends and stores no submissions.

## Run the slides locally

With Python 3 installed, run from this repository:

```sh
python3 -m http.server 4173 --directory public
```

Open http://localhost:4173. Use ← / → to navigate, F for full screen, and the visible Motion and Replay controls. Open `/start.html` for the audience kit. With Node.js installed, `npm run check` checks scripts, public links and publication boundaries; no package installation is needed.

For browser layout checks, run `npm install`, `npx playwright install chromium`, then `npm run check:layout`. This checks every slide at eight screen sizes, including 4K, ultrawide and phone layouts, plus revealed answers and full-screen mode. The slide canvas scales its type and illustrations together; phones use a scrollable vertical layout.

## Deploy

Import this repository into Vercel. Use the **Other** framework preset; output directory is `public` and no build command is required. The included configuration sets this up. Keep credentials outside the repository.

## Further reading

- [Obsidian help](https://help.obsidian.md/)
- [Claude Code documentation](https://code.claude.com/docs/en/overview)
- [Codex documentation](https://developers.openai.com/codex/)
- [OpenClaw documentation](https://docs.openclaw.ai/)
- [MCP introduction](https://modelcontextprotocol.io/docs/getting-started/intro)
- [Cole Medin’s second-brain starter](https://github.com/coleam00/second-brain-starter), a source of architecture inspiration.

Product features and authentication flows change. Follow current official documentation for setup. This is an independent educational demo; no product sponsorship is implied.

## License

Original code and starter notes are available under the MIT license. Product names and marks belong to their respective owners.
