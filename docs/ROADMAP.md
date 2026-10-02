# Roadmap

## 0.1 — Chat foundation

- [x] Native Android chat screen.
- [x] OpenAI-compatible endpoint, model and session-only API key settings.
- [x] GitHub Actions debug APK build.
- [ ] Verify the first CI build on GitHub Actions and fix any build errors.

## Next: project workspace

- Let the user choose a project folder with Android's Storage Access Framework.
- Show selected files and let the user attach a file to a chat.
- Keep file changes as a visible diff that the user reviews and accepts.
- Save only approved changes; never silently overwrite files.

## Later: controlled agent tools

- Add explicit user approval before running each command.
- Show command, working directory, output and cancellation controls.
- Keep the workspace scoped to a folder chosen by the user.
- Add model routing and local server connection profiles.
