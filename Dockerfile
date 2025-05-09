FROM node:22-slim

WORKDIR /app

COPY package*.json ./

RUN npm install -g @angular/cli --unsafe-perm
RUN npm install

COPY src ./src
COPY angular.json ./
COPY karma.conf.js ./
COPY tsconfig* ./

EXPOSE 4201

CMD ["npm", "start"]
