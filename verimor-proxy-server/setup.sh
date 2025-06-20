#!/bin/bash

# Make sure script stops on error
set -e

echo "Setting up Verimor Proxy Server..."

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "npm is not installed. Please install Node.js and npm first."
    exit 1
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Check if .env exists
if [ ! -f .env ]; then
    echo "Creating .env file from example..."
    cp .env.example .env
    echo "Please edit the .env file with your actual configuration!"
fi

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "PM2 is not installed. Installing globally..."
    npm install -g pm2
fi

# Prompt user for confirmation
read -p "Do you want to start the server with PM2? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Start the application with PM2
    echo "Starting Verimor Proxy Server with PM2..."
    pm2 start index.js --name verimor-proxy
    
    # Setup PM2 to start on system reboot
    echo "Setting up PM2 to start on system reboot..."
    pm2 save
    
    # Provide instructions to the user
    echo ""
    echo "======================================================================================"
    echo "The Verimor Proxy Server is now running with PM2"
    echo ""
    echo "To monitor the server: pm2 monit"
    echo "To view logs: pm2 logs verimor-proxy"
    echo "To restart the server: pm2 restart verimor-proxy"
    echo "To stop the server: pm2 stop verimor-proxy"
    echo "======================================================================================"
else
    echo ""
    echo "======================================================================================"
    echo "Setup complete. You can start the server with:"
    echo "npm run dev  # For development"
    echo "pm2 start index.js --name verimor-proxy  # For production"
    echo "======================================================================================"
fi 