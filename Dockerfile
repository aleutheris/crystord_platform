FROM nginx:latest

COPY nginx-config/default.conf /etc/nginx/conf.d/default.conf

COPY webpage/ /usr/share/nginx/html

EXPOSE 80
