# Build stage
FROM node:23-slim AS builder
WORKDIR /app

# Install system dependencies
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Install pnpm
RUN npm install -g pnpm

# Copy only what's needed to install
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma

# Install dependencies
RUN pnpm install

# Copy the rest of the app
COPY . .

# Build Prisma client
RUN pnpm exec prisma generate

# Build Next.js app
RUN pnpm run build

# Production image
FROM node:23-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# 👇 Install pnpm here too!
RUN npm install -g pnpm

# Copy built app from builder
COPY --from=builder /app ./

EXPOSE 3000
CMD ["pnpm", "run", "start"]