const express = require("express");
const path = require("path");
const fs = require("fs");
const { execFile } = require("child_process");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;

const DOWNLOADS = process.env.DOWNLOADS_DIR || path.join(__dirname, "downloads");
fs.mkdirSync(DOWNLOADS, { recursive: true });

// Auto-cleanup files older than 30 minutes every 15 minutes
const CLEANUP_INTERVAL_MS = 15 * 60 * 1000;
const FILE_MAX_AGE_MS = 30 * 60 * 1000;

function cleanupOldFiles() {
  fs.readdir(DOWNLOADS, (err, files) => {
    if (err) return;
    const now = Date.now();
    for (const file of files) {
      if (file === ".gitkeep") continue;
      const filePath = path.join(DOWNLOADS, file);
      fs.stat(filePath, (err, stats) => {
        if (!err && now - stats.mtimeMs > FILE_MAX_AGE_MS) {
          fs.unlink(filePath, () => {});
        }
      });
    }
  });
}
const cleanupTimer = setInterval(cleanupOldFiles, CLEANUP_INTERVAL_MS);
if (cleanupTimer.unref) {
  cleanupTimer.unref();
}

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/downloads", express.static(DOWNLOADS));

// Health check endpoint for cloud hosting / monitoring
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy", uptime: process.uptime() });
});

// Prevent favicon 404
app.get("/favicon.ico", (req, res) => {
  res.status(204).end();
});

app.post("/api/convert", (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({
      error: "No YouTube URL provided."
    });
  }

  if (!/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//i.test(url)) {
    return res.status(400).json({
      error: "That doesn't look like a valid YouTube URL."
    });
  }

  const id = crypto.randomBytes(8).toString("hex");
  const outputTemplate = path.join(DOWNLOADS, `${id}.%(ext)s`);

  const args = [
    url,
    "--no-playlist",
    "-x",
    "--audio-format", "mp3",
    "--audio-quality", "0",
    "--write-thumbnail",
    "--convert-thumbnails", "jpg",
    "--embed-thumbnail",
    "--add-metadata",
    "-o", outputTemplate,
    "--print", "after_move:title"
  ];

  console.log(`\nStarting conversion for: ${url} (ID: ${id})`);

  execFile(
    "yt-dlp",
    args,
    {
      timeout: 10 * 60 * 1000,
      windowsHide: true,
      maxBuffer: 10 * 1024 * 1024
    },
    (error, stdout, stderr) => {
      if (error) {
        console.error("\nYT-DLP ERROR:", error);
        if (stderr) console.error("\nSTDERR:", stderr);

        return res.status(500).json({
          error: stderr?.trim() || error.message || "yt-dlp conversion failed."
        });
      }

      const mp3 = path.join(DOWNLOADS, `${id}.mp3`);

      if (!fs.existsSync(mp3)) {
        console.error("MP3 was not created at:", mp3);
        return res.status(500).json({
          error: "yt-dlp finished but no MP3 file was created."
        });
      }

      // Extract video title from stdout if available
      const stdoutLines = (stdout || "")
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean);
      const title = stdoutLines.length > 0 ? stdoutLines[stdoutLines.length - 1] : undefined;

      console.log(`Conversion succeeded: ${title || id}.mp3`);

      res.json({
        success: true,
        title: title || "audio",
        download: `/downloads/${id}.mp3`
      });
    }
  );
});

const server = app.listen(PORT, () => {
  console.log(`\nYTMP3 server running at: http://localhost:${PORT}`);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received, closing server...");
  server.close(() => process.exit(0));
});