# YTMP3

A modern, fast, and self-hosted YouTube to MP3 converter web application. Built with Node.js, Express, `yt-dlp`, and `ffmpeg`, featuring embedded cover art and original audio metadata.

![Node.js](https://img.shields.io/badge/Node.js-20%2B-green.svg)
![yt-dlp](https://img.shields.io/badge/yt--dlp-latest-red.svg)
![ffmpeg](https://img.shields.io/badge/ffmpeg-supported-blue.svg)
![License](https://img.shields.io/badge/license-MIT-purple.svg)

---

## Features

- **High-Quality Audio:** Extracts high-bitrate audio (VBR 0 / 320 kbps equivalent).
- **Embedded Cover Art:** Automatically fetches the video's thumbnail and embeds it directly into the MP3 file tags.
- **ID3 Metadata:** Tags the audio with original title and artist information.
- **Sleek Dark UI:** Responsive and modern interface with loading indicator and auto-suggested download filenames.
- **Cloud & Docker Ready:** Includes `Dockerfile` and `render.yaml` for 1-click cloud deployments.
- **Auto Cleanup:** Automatically purges converted files older than 30 minutes to conserve disk space.
- **Health Checks:** Built-in `/health` endpoint for uptime monitoring and cloud container liveness probes.

---

## Quick Start (Local)

### Prerequisites

Ensure the following tools are installed and accessible in your system `PATH`:

1. [Node.js](https://nodejs.org/) (v18+)
2. [yt-dlp](https://github.com/yt-dlp/yt-dlp)
3. [ffmpeg](https://ffmpeg.org/download.html)

### Installation

```bash
# Clone the repository
git clone https://github.com/Hypergenius12/ytmp3.git
cd ytmp3

# Install dependencies
npm install

# Start the server
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your web browser.

For development with live-reloading:
```bash
npm run dev
```

---

## Running with Docker

Run anywhere without needing to manually install `ffmpeg` or `yt-dlp`:

```bash
# Build the Docker image
docker build -t ytmp3 .

# Run container on port 3000
docker run -p 3000:3000 ytmp3
```

Navigate to `http://localhost:3000`.

---

## Deploying Online

Because converting YouTube audio requires `yt-dlp` and `ffmpeg`, standard Node.js serverless functions (e.g., standard Vercel serverless) will fail due to missing binary dependencies and timeouts. Instead, use a container-capable platform:

### 1. Render (Recommended & Free Tier Available)
1. Fork or push this repository to your GitHub account.
2. In [Render Dashboard](https://dashboard.render.com/), click **New +** -> **Web Service**.
3. Select your `ytmp3` repository.
4. Render will detect the `Dockerfile` automatically (or you can use the included `render.yaml` Blueprint).
5. Deploy!

### 2. Railway
1. Go to [Railway.app](https://railway.app/).
2. Click **New Project** -> **Deploy from GitHub repo**.
3. Select `ytmp3`. Railway detects the `Dockerfile` and builds it automatically.

### 3. Fly.io
```bash
fly launch
fly deploy
```

---

## API Reference

### Health Check
- **Endpoint:** `GET /health`
- **Response:**
  ```json
  {
    "status": "healthy",
    "uptime": 124.5
  }
  ```

### Convert Video
- **Endpoint:** `POST /api/convert`
- **Headers:** `Content-Type: application/json`
- **Body:**
  ```json
  {
    "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "title": "Rick Astley - Never Gonna Give You Up (Official Music Video)",
    "download": "/downloads/a1b2c3d4e5f67890.mp3"
  }
  ```

---

## Disclaimer

This software is provided for personal, educational, and backup purposes. Please adhere to YouTube's Terms of Service and only convert content that you own or have explicit permission to use.

---

## License

MIT
