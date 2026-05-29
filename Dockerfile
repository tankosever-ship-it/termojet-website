FROM node:22-alpine AS builder

WORKDIR /app

# install frontend deps + build
COPY package*.json ./
RUN npm ci

COPY . .
RUN VITE_BASE_URL=/ npm run build:prod

# --- runtime ---
FROM node:22-alpine

WORKDIR /app

# install backend deps
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --omit=dev

# copy build artifacts
COPY --from=builder /app/dist ./dist
COPY backend ./backend

# persistent dirs
RUN mkdir -p backend/data backend/uploads

EXPOSE 3000
ENV NODE_ENV=production

CMD ["node", "backend/server.js"]
