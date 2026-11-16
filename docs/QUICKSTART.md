# Recreate the demo

## 1. Open the folder

Download and extract the starter ZIP. In Obsidian choose **Open folder as vault** and select `starter-vault`. Start at `Home.md`.

Open that same folder in Claude Code or another folder-aware coding agent. Use the local project environment and review the file permissions requested. A selected folder alone is not a security sandbox. Accounts and model access are separate from this kit.

## 2. Build from the plan

Send this in Claude Code:

```text
Read build-signup.md and signup-plan.md. Follow the workflow to create signup.html in this folder. Report which notes you used, what you built, and which checks you actually performed.
```

Open the generated `signup.html` in a browser. Check: one email field, Join waitlist, rejection of empty/invalid email, and local confirmation for a valid email. The form should not send or store data.

## 3. Change the decision, then change the page

In `signup-plan.md`, change **Join waitlist** to **Notify me** in both the current decision and success check. Add your reason to the decision log. Save it.

Wait for Claude to finish. Open a fresh Codex session in the **same local folder**, then send:

```text
Read signup-plan.md and signup.html. Update only signup.html to follow the current plan. Keep one required email field and a local confirmation. Do not add dependencies, remote assets, network requests or persistent storage. Report the source files you read and checks you actually performed.
```

Reload that exact page. Verify Notify me, email validation and local confirmation. If your tool works through attachments instead, attach both current files and save the returned HTML back into the same folder.

## 4. Check a fresh session

```text
Read signup-plan.md and signup.html. What does the button currently say, and why was it changed? Cite the file and section you used. Say if the files disagree. Do not edit anything.
```

This checks whether the session uses saved context. It is not a test that another product has no memory.

## 5. Optional: ask through Telegram

Configure your own OpenClaw installation using its current [official documentation](https://docs.openclaw.ai/). Connect a supported model/runtime, grant the intended project access, then set up the [Telegram channel](https://docs.openclaw.ai/channels/telegram). Configure access for your own account.

Handle the BotFather token privately. A token controls the bot; a numeric Telegram user ID identifies the permitted sender. Neither belongs in your public repo or on the projector.

Ask your configured bot:

```text
What does the signup button currently say? Check signup-plan.md and signup.html and tell me which files you used. Do not edit anything.
```

A channel connection does not itself grant file access. If the assistant cannot read the files, configure that access first rather than treating a plausible reply as proof.

To test writing separately:

```text
Read signup-plan.md. Write a short next-step.md in this demo folder with one unfinished next action. Do not change any other file. Tell me which file you saved.
```

Open the actual saved note in Obsidian. A chat promise is not evidence of a file write.

## Reset for another practice run

Use a fresh copy of the downloaded starter folder. It intentionally contains no generated signup.html, next-step.md, account setup or chat history. You do not need to delete your real vault or reset your tools.

The hosted slides contain illustrations and prepared examples. They do not connect to the speaker’s Mac, execute a model request or send Telegram messages. Perform the real demo using your own configured tools.
