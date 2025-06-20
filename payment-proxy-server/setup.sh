#!/bin/bash

# Install dependencies
npm install

# Install PM2 globally if not already installed
if ! command -v pm2 &> /dev/null
then
    echo "PM2 not found. Installing PM2 globally..."
    npm install -g pm2
fi

echo ""
echo "To start the payment-proxy-server with PM2:"
echo "  pm2 start index.js --name payment-proxy"
echo "  pm2 save"
echo "  pm2 startup"
echo ""
echo "To check logs:"
echo "  pm2 logs payment-proxy"
echo ""
echo "To stop:"
echo "  pm2 stop payment-proxy"
echo ""
echo "Setup complete." 