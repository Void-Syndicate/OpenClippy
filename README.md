# OpenClippy 📎

A floating desktop Clippy assistant powered by [OpenClaw](https://github.com/openclaw/openclaw). Retro Windows 98 aesthetic meets modern AI.

![Electron](https://img.shields.io/badge/Electron-28+-blue) ![License](https://img.shields.io/badge/license-MIT-green)

## What is this?

OpenClippy brings back the classic Microsoft Office Clippy assistant as a transparent, always-on-top desktop companion. It connects to any OpenAI-compatible API (OpenClaw, Ollama, OpenRouter, etc.) and streams responses in a retro Windows 98 chat window.

## Features

- 📎 **Classic Clippy** — Transparent frameless window with animated Clippy sprite
- 💬 **Streaming Chat** — Real-time token-by-token responses via SSE
- 🖥️ **Windows 98 UI** — Authentic retro styling via [98.css](https://jdan.github.io/98.css/)
- 🖱️ **Drag & Drop** — Reposition Clippy anywhere on screen
- 💡 **Idle Suggestions** — Clippy pops up with random tips after 60s of inactivity
- 🔧 **System Tray** — Show/Hide, Clear Chat, Quit from tray icon
- 🎯 **Click-Through** — Transparent areas pass clicks to windows behind

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy the example config and add your API token:
   ```bash
   cp config.example.json config.json
   ```
   Edit `config.json`:
   ```json
   {
     "apiUrl": "http://localhost:18789/v1/chat/completions",
     "token": "YOUR_API_TOKEN_HERE",
     "model": "anthropic/claude-opus-4-6"
   }
   ```
   Works with any OpenAI-compatible endpoint (OpenClaw, Ollama, LM Studio, OpenRouter, etc.)

3. Run:
   ```bash
   npm start
   ```

## Usage

| Action | What happens |
|--------|-------------|
| **Click Clippy** | Open/close chat window |
| **Drag Clippy** | Reposition on screen |
| **Right-click Clippy** | Context menu (Clear Chat, Sound, Always on Top, Quit) |
| **System tray** | Show/Hide, Clear Chat, Quit |

## Architecture

```
┌─────────────────────────────────────┐
│  Electron (transparent, frameless)  │
│  ┌─────────────┐ ┌───────────────┐  │
│  │  Clippy      │ │ Chat Window   │  │
│  │  Sprite      │ │ (98.css)      │  │
│  │  (animated)  │ │               │  │
│  └─────────────┘ └───────────────┘  │
└──────────────┬──────────────────────┘
               ▼
    OpenAI-compatible API
    POST /v1/chat/completions (SSE)
```

## Configuration

| Field | Description | Default |
|-------|-------------|---------|
| `apiUrl` | Chat completions endpoint | `http://localhost:18789/v1/chat/completions` |
| `token` | Bearer token for auth | _(required)_ |
| `model` | Model identifier | `anthropic/claude-opus-4-6` |

## License

MIT
