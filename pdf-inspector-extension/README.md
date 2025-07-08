# Prompt Inspector Extension

This Chrome extension intercepts PDF file uploads (e.g., to ChatGPT), sends them to a backend API, and alerts the user if secrets are detected.

## Features
- Detects PDF uploads on GenAI sites (currently: OpenAI Chat).
- Sends files to backend for inspection.
- Displays popup alerts if secrets are found.

## Project Structure
extension/

├── manifest.json

├── popup.html

├── popup.js

├── background.js

├── content.js

├── style.css

├── utils.js

└── icons/


## Dev Setup
1. Load unpacked extension from Chrome Extensions (`chrome://extensions/`).
2. Enable Developer Mode.
3. Click **Load unpacked** and select the `extension/` folder.

## TODO
- Add options UI for API key config (optional).
- Handle non-PDF uploads.
- Allow file type filtering and whitelist domains.
