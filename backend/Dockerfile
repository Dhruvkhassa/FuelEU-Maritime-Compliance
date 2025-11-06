FROM node:18-alpine AS builder
WORKDIR /app

# Install deps
COPY package*.json ./
RUN npm ci --production=false --silent

# Copy sources and build
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app

# Production deps
COPY package*.json ./
RUN npm ci --production --silent

# Copy build output and prisma client
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY prisma ./prisma

ENV NODE_ENV=production
EXPOSE 3001

CMD ["node", "dist/infrastructure/server/index.js"]
