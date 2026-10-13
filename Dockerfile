# ---------- Gozzy Payroll — Render-ready PHP image ----------
FROM php:8.2-apache

# Install any PHP extensions you might need later.
# We do NOT install pdo_mysql — no database here.
RUN docker-php-ext-install pdo

# Enable Apache rewrite + headers
RUN a2enmod rewrite headers

# Copy the whole app into the Apache document root
COPY . /var/www/html/
WORKDIR /var/www/html

# Make Apache listen on Render's $PORT (default 10000) instead of 80
RUN sed -i 's/Listen 80/Listen ${PORT}/' /etc/apache2/ports.conf && \
    sed -i 's/:80/:${PORT}/' /etc/apache2/sites-available/000-default.conf && \
    echo 'PassEnv PORT' >> /etc/apache2/apache2.conf

# Use Apache's environment-aware entrypoint so $PORT is substituted at runtime
CMD sed -i "s/Listen \${PORT}/Listen ${PORT}/" /etc/apache2/ports.conf && \
    sed -i "s/:\\\${PORT}/:${PORT}/" /etc/apache2/sites-available/000-default.conf && \
    apache2-foreground
