# Nexus Android Lab server (experimental)
Single-device proof-of-concept using Vercel Functions and a **private Vercel Blob** store.
Requires `BLOB_READ_WRITE_TOKEN`, `DEVICE_TOKEN`, `OPERATOR_TOKEN` configured as encrypted environment variables. No secrets in Git.
Requires an accessible production URL; preview deployment protection may block Android polling.
API:
- GET /health (public, no credentials)
- GET /device/next (device token)
- POST /device/result (device token)
- POST /operator/enqueue (operator token)
- GET /operator/results (operator token)
Commands allowlist: status, home, back, tap, swipe.
Known limitations: job polling can repeat before result is written; no claim/lease atomicity; no device enrollment flow; no ChatGPT tool integration; no screenshots; no APK installs; no remote terminal. Do not use with sensitive data.
