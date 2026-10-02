# MyGravityDroid

An Android-first AI coding assistant, built so the project can be edited from GitHub on a phone and built with GitHub Actions.

## v0.2.0 — project file context

- Native Android chat in Kotlin and Jetpack Compose.
- Attach one text source file (up to 16 KB) to a chat for analysis and coding suggestions.
- OpenAI-compatible model settings for hosted providers and local servers.
- API keys stay in app memory for the current session.
- GitHub Actions builds and publishes a debug APK artifact for each push to `main`.

The app can read the text file you choose and include it in the request to your configured model. It does not edit or overwrite the original file, run commands, or scan other files yet. Review suggested code yourself before applying it.

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
