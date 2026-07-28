# Life-Admin Copilot — Native Android Automated Companion App

Native Kotlin Android app companion layer providing auto-capture for SMS bills, WhatsApp notification listeners, persistent foreground service, and tap-to-speak voice assistant.

## Features
- **SMS Auto-Capture**: Listens for incoming bill/reminder SMS via BroadcastReceiver.
- **Notification Capture**: Monitored WhatsApp and messaging package notifications via NotificationListenerService.
- **Persistent Foreground Service**: Keeps auto-capture active seamlessly on Android 8.0+.
- **Tap-To-Speak Voice Assistant**: Connects with backend `/api/assistant/route` for intent routing and TTS playback.

## Backend Connection
Set your backend API base URL in `ApiService.kt` (e.g. `http://10.0.2.2:3000` for Android emulator or your deployed backend URL).
