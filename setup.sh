#!/bin/bash
# Exit on error
set -e

echo "=== Starting TrueForm VPS Setup ==="

# 0. Authorize SSH Key for GitHub Actions Auto-deploy
echo "Setting up SSH key authorization..."
mkdir -p /root/.ssh
chmod 700 /root/.ssh
echo "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQC95rEEifHZD41grsVbOGJn0ysB3+aHChbb3niNI0EmLL6496FyqCai4KNYGaKemhTSxRqi92o11qXzRUhYsXzowFIvkMNo9EvvIIXSTA38VyWoiJkn+Ia+eousGh+TnbwD5SpJMeTLPdrGZmrBUyBcEAQZ/w4/K2k/S1kqdih+US0XZkzHSx+/BN0AEpCBzBzmzTsPzZGkpuN9mQwE+WilxWuu3X+10Vd+Lvacge2/EdDzQOKGvGv4D6OdZdS75RcLTxh0RpX9HhGNHAR9ezFIfKlWOEYHH29YWzCk+GXmtuJcnv/WcMUET2MIzviyjYwUID4hEFETqAWA77u8X8RX9AihHP7GE6XzsNW+MCztzlvQlHRIgHpbzjZkUiwgTmeazzRfv74ULWcSkaCuaawS4U7C6/EHLjnEYFw9M2C0/HvPaKzGnfJTYM72uUipir7qAalb+cguGgog4WSuZpwJtFLwgAiQCgYLTZnQFTNy7jGlRc9YQ03P0iosKayX0hh0bjtXTEp3+pjb3LEPG3KzGymjkUIzYbuhf/HLFR6OLRzJksBnWdYW4SC2VIgVbta4VFjZYz5H5LXHYxr9rp+Vvvri6Vn04S5gJ+rvjqE2HXDqoaMrPEf/4XQJUlp9WUvD39Ok6zMhIMrcf6cYRF8sQn1qAOn6SfnJZ7xWRWe6NQ== ТЕХНОРАЙ@DESKTOP-NT3PSRK" >> /root/.ssh/authorized_keys
chmod 600 /root/.ssh/authorized_keys
uniq /root/.ssh/authorized_keys > /root/.ssh/authorized_keys.tmp && mv /root/.ssh/authorized_keys.tmp /root/.ssh/authorized_keys


# 1. Update system & Install requirements
echo "Updating apt repositories..."
apt-get update -y

echo "Installing Nginx, Git, Curl, Certbot..."
apt-get install -y curl git build-essential nginx certbot python3-certbot-nginx

# 2. Install Node.js v20
if ! command -v node &> /dev/null; then
    echo "Installing Node.js v20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
else
    echo "Node.js is already installed: $(node -v)"
fi

# 3. Install PM2
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    npm install -g pm2
else
    echo "PM2 is already installed: $(pm2 -v)"
fi

# 4. Clone repository
mkdir -p /var/www
if [ -d "/var/www/trueform/.git" ]; then
    echo "Directory /var/www/trueform already exists, pulling latest changes..."
    cd /var/www/trueform
    git pull origin main
else
    echo "Cloning repository..."
    rm -rf /var/www/trueform
    git clone https://github.com/Sashatsyhanov14/trueform.git /var/www/trueform
    cd /var/www/trueform
fi

# 5. Create .env file
echo "Checking .env configuration..."
if [ ! -f "/var/www/trueform/.env" ]; then
    echo "============================================="
    echo "Please paste the content of your .env file."
    echo "Press Enter, then Ctrl+D to save."
    echo "============================================="
    cat > /var/www/trueform/.env
    echo ".env file created."
else
    echo ".env file already exists."
fi

# 6. Install dependencies and build Next.js app
echo "Installing project dependencies..."
npm install

echo "Building Next.js application..."
npm run build

# 7. Start application via PM2
echo "Starting application with PM2..."
pm2 delete trueform || true
pm2 start npm --name "trueform" -- start
pm2 save

# 8. Configure Nginx
echo "Configuring Nginx..."
cat << 'EOF' > /etc/nginx/sites-available/trueform
server {
    listen 80;
    server_name trueformai.ru www.trueformai.ru;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Enable site
rm -f /etc/nginx/sites-enabled/default || true
ln -sf /etc/nginx/sites-available/trueform /etc/nginx/sites-enabled/trueform

# Test & Restart Nginx
nginx -t
systemctl restart nginx

echo "=== Setup completed successfully! ==="
echo "To secure your site with HTTPS, run: sudo certbot --nginx -d trueformai.ru -d www.trueformai.ru"
