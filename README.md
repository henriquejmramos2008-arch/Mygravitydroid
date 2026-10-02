# MyGravityDroid

An Android-first AI coding assistant, built so the project can be edited from GitHub on a phone and built with GitHub Actions.

## v0.4.0 — larger project context

- Native Android chat in Kotlin and Jetpack Compose.
- Choose a project folder and select up to 40 code/text files (256 KB total) as chat context.
- Keep the single-file attachment option for quick questions (16 KB maximum).
- OpenAI-compatible model settings for hosted providers and local servers.
- API keys stay in app memory for the current session.
- GitHub Actions builds and publishes a debug APK artifact for each push to `main`.

The app can read only the files you explicitly select and include them in requests to your configured model. The combined context limit is 256 KB, including a single-file attachment. Model context limits vary; if a request is too large, select fewer or smaller files. Only files you explicitly select are read. The app does not edit or overwrite project files or run commands. Review suggested code yourself before applying it.

## Edit and build from an Android phone

1. Open this repository in GitHub.
2. Edit Kotlin or configuration files with the pencil button, or open the repository in github.dev.
3. Commit changes to `main`.
4. Open **Actions** and select **Build Android APK**.
5. Download the `MyGravityDroid-debug` artifact from the latest successful run.

## Configure a model

In the app, open **Definições** and enter an OpenAI-compatible API base URL, model name, and (if required) API key. Example base URL: `https://api.openai.com/v1`. For a local llama.cpp server, use a reachable URL such as `http://192.168.1.20:8080/v1`; the phone and server must be able to reach each other.

Never put API keys in this repository or source code. For remote providers, use HTTPS. HTTP is enabled for local development servers.

## Toolchain

JDK 17, Gradle 8.13, Android Gradle Plugin 8.13.2, Kotlin 2.2.21, Android API 36.
