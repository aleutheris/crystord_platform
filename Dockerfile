FROM nginx:latest

COPY nginx-config/default.conf /etc/nginx/conf.d/default.conf

RUN mkdir -p /webpage

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
