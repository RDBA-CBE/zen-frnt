#!/bin/bash

# Pull latest changes from Git
echo "Pulling latest changes from Git..."
git pull

# Stop all PM2 processes
echo "Stopping all PM2 processes..."
pm2 stop all

# Build the project
echo "Building the project..."
npm run build

# Restart all PM2 processes
echo "Restarting all PM2 processes..."
pm2 restart all

echo "Deployment completed successfully!"
