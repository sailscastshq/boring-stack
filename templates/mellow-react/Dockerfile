FROM node:22-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends tini curl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN rm -rf node_modules && npm ci && npm cache clean --force

COPY . .

HEALTHCHECK CMD curl -f http://localhost:${PORT:-1337}/health || exit 1

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["npm", "start"]
