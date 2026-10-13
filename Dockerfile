FROM php:8.2-apache

# Install PDO MySQL extension
RUN docker-php-ext-install pdo pdo_mysql

# Copy your application code into the webroot
COPY . /var/www/html/

# Set the working directory
WORKDIR /var/www/html

# Apache serves on port 80 by default, but Render will provide a PORT env var.
# You need to configure Apache to listen on that port.
# This command replaces the default port 80 with Render's $PORT.
CMD sed -i "s/80/\${PORT}/g" /etc/apache2/ports.conf /etc/apache2/sites-available/000-default.conf && apache2-foreground
