# Use Node.js Debian-slim image
FROM node:20-slim

# Install ffmpeg, python3, curl, and ca-certificates
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      ffmpeg \
      python3 \
      curl \
      ca-certificates && \
    curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && \
    chmod a+rx /usr/local/bin/yt-dlp && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies first (better Docker caching)
COPY package*.json ./
RUN npm ci --only=production

# Copy application files
COPY . .

# Ensure downloads directory exists
RUN mkdir -p downloads

# Set environment defaults
ENV PORT=3000
ENV NODE_ENV=production

EXPOSE 3000

# Start server
CMD ["node", "server.js"]
