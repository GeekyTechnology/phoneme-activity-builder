# Install dependencies
FROM node:22-alpine AS dependencies

WORKDIR /app

RUN apk add --no-cache python3 make g++ libstdc++

ENV npm_config_nodedir=/usr/local

COPY package.json package-lock.json ./

RUN npm ci


# Build the application
FROM node:22-alpine AS builder

WORKDIR /app

ENV DATABASE_URL="file:./dev.db"
ENV npm_config_nodedir=/usr/local

RUN apk add --no-cache python3 make g++ libstdc++

COPY --from=dependencies /app/node_modules ./node_modules

COPY . .

RUN npx prisma generate

RUN npm run build


# Run the application
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV DATABASE_URL="file:./dev.db"

RUN apk add --no-cache libstdc++

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/app ./app
COPY --from=builder /app/components ./components
COPY --from=builder /app/lib ./lib
COPY --from=builder /app/generated ./generated
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/dev.db ./dev.db

EXPOSE 3000

CMD ["npm", "start"]