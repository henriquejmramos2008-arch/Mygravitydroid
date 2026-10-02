# Roadmap

## 0.1 — Chat foundation

- [x] Native Android chat screen.
- [x] OpenAI-compatible endpoint and model settings.
- [x] Session-only API key entry.
- [x] GitHub Actions debug APK build.

## 0.2 — Project file context

- [x] Attach one text file up to 16 KB.
- [x] Include its contents in the model request while showing only the filename in chat.
- [x] Keep the original file unchanged; suggestions require manual review.
- [x] Bump app version to 0.2.0 and verify the APK build.

## Next — Reviewable project edits

- Let the user choose a project folder with Android's Storage Access Framework.
- Ask the model for an edit proposal and display a before/after diff.
- Save a change only after the user reviews and approves it.
- Never silently overwrite files.

## Later — Controlled agent tools

- Add explicit user approval before running each command.
- Show command, working directory, output and cancellation controls.
- Keep the workspace scoped to a folder chosen by the user.
- Add model routing and local server connection profiles.
