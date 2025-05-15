FROM node:18-alpine AS base

# 安装依赖
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN npm install -g pnpm && pnpm install

# 构建应用
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 生产环境
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

# 复制必要文件
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 安装 PostgreSQL 客户端工具
RUN apk add --no-cache postgresql-client

EXPOSE 3009
ENV PORT 3009

CMD ["node", "server.js"]