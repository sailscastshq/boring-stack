FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci && \
    npm cache clean --force

FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache tini

COPY --from=builder /app/node_modules ./node_modules
COPY . .

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["npm", "start"]
