# Use a base image with a web server installed (e.g., nginx)
FROM nginx:latest

# Copy the custom Nginx configuration
COPY nginx-config/default.conf /etc/nginx/conf.d/default.conf

# Copy your webpage files to the appropriate location in the container
COPY webpage/ /usr/share/nginx/html

# Expose port 80 (default for HTTP)
EXPOSE 80
