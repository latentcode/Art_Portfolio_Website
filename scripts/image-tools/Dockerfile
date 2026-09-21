FROM node:22-bookworm-slim

WORKDIR /tool

RUN apt-get update \
    && apt-get install --yes --no-install-recommends ffmpeg \
    && rm -rf /var/lib/apt/lists/*

COPY package.json ./
RUN npm install --omit=dev --no-audit --no-fund

COPY optimize-images.mjs ./
COPY optimize-animation.sh ./
RUN chmod +x /tool/optimize-animation.sh
