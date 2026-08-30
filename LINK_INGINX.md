SSH into your VPS:
ssh user@<VPS_IP>

# Create the config file (paste the content I created in deployment/host_nginx.conf)
sudo nano /etc/nginx/sites-available/investment-v2

# (Paste the content from the file: deployment/host_nginx.conf in your local project)

# Enable the site
sudo ln -s /etc/nginx/sites-available/investment-v2 /etc/nginx/sites-enabled/

# Disable default site (if it exists)
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# View logs enginx
sudo tail -n 20 /var/log/nginx/error.log

# Find the conflicting file: Run this to see all enabled sites:
ls -l /etc/nginx/sites-enabled/

# Disable the old config: Remove the symlink for the old/conflicting file (replace default with the actual name you found):
sudo rm /etc/nginx/sites-enabled/default
# OR 
sudo rm /etc/nginx/sites-enabled/crowdspot
# Ensure ONLY investment-v2 is enabled:

sudo ln -s /etc/nginx/sites-available/investment-v2 /etc/nginx/sites-enabled/
# (Skip if already linked)
# Restart Nginx:
sudo nginx -t
sudo systemctl restart nginx

# Both folders are important, but they work together:

# sites-available (Storage): This is where you create and store your configuration files (like investment-v2).
# sites-enabled (Activation): This is where you create a link (shortcut) to the files in sites-available that you want to enable. Nginx only reads the configs inside this folder.