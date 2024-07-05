FROM node:18-alpine

WORKDIR /app
COPY angular.json karma.conf.js package*.json tsconfig*.json ./

RUN npm install
RUN npm install @coreui/angular @coreui/icons-angular @coreui/coreui

COPY . .

EXPOSE 80

CMD ["npm", "start"]
