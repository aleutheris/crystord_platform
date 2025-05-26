# --- Stage 1: Build the Angular app ---
FROM node:22-slim AS builder

WORKDIR /app

COPY package*.json ./
COPY src ./src
COPY angular.json ./
COPY karma.conf.js ./
COPY tsconfig* ./

RUN npm install -g @angular/cli
RUN npm install

RUN ng build --configuration=production

# --- Stage 2: Serve the built app with a lightweight Node image ---
FROM node:22-slim

WORKDIR /app

COPY --from=builder /app/dist/crystord/browser ./dist

RUN npm install -g serve

EXPOSE 4201

CMD ["serve", "-s", "dist", "-l", "4201"]
