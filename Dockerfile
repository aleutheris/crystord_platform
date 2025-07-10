# --- Stage 1: Build the Angular app for production ---
FROM node:22-slim AS prod-builder

WORKDIR /app

COPY package*.json ./
COPY src ./src
COPY angular.json ./
COPY karma.conf.js ./
COPY tsconfig* ./

RUN npm install -g @angular/cli
RUN npm install

RUN ng build --configuration=production

# --- Stage 2: Build the Angular app for development (hot reload) ---
FROM node:22-slim AS dev

WORKDIR /app

COPY package*.json ./
COPY src ./src
COPY angular.json ./
COPY karma.conf.js ./
COPY tsconfig* ./

RUN npm install -g @angular/cli
RUN npm install

EXPOSE 4201

CMD ["ng", "serve", "--host", "0.0.0.0"]

# --- Stage 3: Serve the built app with a lightweight Node image (production) ---
FROM node:22-slim AS prod

WORKDIR /app

COPY --from=prod-builder /app/dist/crystord/browser ./dist

RUN npm install -g serve

EXPOSE 4201

CMD ["serve", "-s", "dist", "-l", "4201"]
