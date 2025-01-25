FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install -g @angular/cli --unsafe-perm
RUN npm install

COPY . .

EXPOSE 4201

CMD ["npm", "start"]
