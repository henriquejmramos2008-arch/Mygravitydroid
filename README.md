# MyGravityDroid

An Android-first AI coding assistant, built so the project can be edited from GitHub on a phone and built with GitHub Actions.

## First version

- Native Android app in Kotlin and Jetpack Compose.
- OpenAI-compatible chat API settings for hosted providers and local servers.
- A coding assistant chat interface with a project-focused system prompt.
- GitHub Actions builds a debug APK and attaches it to each workflow run.

This first version is chat-only. It does not yet browse, edit, or run project files, and it does not execute terminal commands. Those capabilities are planned as explicit, reviewable steps.

## Edit and build from an Android phone

1. Open this repository in GitHub.
2. Edit Kotlin or configuration files with the pencil button, or open the repository in github.dev.
3. Commit changes to `main`.
4. Open **Actions** and select **Build Android APK**.
5. Download the `MyGravityDroid-debug` artifact from a successful run.

## Configure a model

In the app, open **Settings** and enter an OpenAI-compatible API base URL, model name, and (if required) API key. Example base URL: `https://api.openai.com/v1`. For a local llama.cpp server, use a reachable URL such as `http://192.168.1.20:8080/v1`; the phone and server must be able to reach each other.

API keys are held only in app memory for the current session and are not stored in this repository. Do not commit keys or credentials. For remote providers, prefer HTTPS. HTTP is enabled to support local development servers.

## Toolchain

JDK 17, Gradle 9.6.0, Android Gradle Plugin 9.4.0, Kotlin 2.4.10 Compose compiler, Android API 37.
