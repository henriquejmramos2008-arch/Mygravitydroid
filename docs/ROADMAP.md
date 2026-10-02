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

## 0.3 — Project folder context
- [x] Choose a project folder with Android's Storage Access Framework.
- [x] Browse detected source/text files and explicitly select up to 8.
- [x] Limit project context to 64 KB; exclude hidden and likely secret files.
- [x] Bump app version to 0.3.0 and verify the APK build.

## 0.4 — Larger project context
- [x] Increase selection to 40 files and combined context to 256 KB.
- [x] Scan larger project trees (up to 500 matching files / 4,000 visited entries).
- [x] Explain that provider/model context limits may require a smaller selection.
- [x] Bump app version to 0.4.0 and verify the APK build.

## 0.5 — Three local AI roles
- [x] Configure separate endpoints and model names for fast/general, coder, and planner/router.
- [x] Add Auto, Rápido, and Programar modes.
- [x] Route coding requests through the planner and coder sequentially.
- [x] Bump app version to 0.5.0 and verify the APK build.

## 0.5 — Three local AI roles
- [x] Configure separate endpoints and model IDs for general, coding, and planner/router roles.
- [x] Add Auto, Rápido, and Programar modes.
- [x] Route code tasks through the planner then coder one at a time.
- [x] Bump version to 0.5.0 and verify the APK.

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
