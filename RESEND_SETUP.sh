#!/bin/bash

# Resend API Key Setup Script
# Run this script to easily add your Resend API key

echo "=========================================="
echo "  Resend Email Service Setup"
echo "=========================================="
echo ""
echo "This script will help you configure Resend email service."
echo ""
echo "Step 1: Get your Resend API Key"
echo "  1. Go to https://resend.com"
echo "  2. Sign up (free: 100 emails/day)"
echo "  3. Go to Dashboard → API Keys"
echo "  4. Create new API key (starts with 're_')"
echo ""
read -p "Enter your Resend API key: " api_key

if [ -z "$api_key" ]; then
    echo "❌ No API key provided. Exiting..."
    exit 1
fi

echo ""
echo "Updating backend .env file..."

# Backup existing .env
cp /app/backend/.env /app/backend/.env.backup

# Update the RESEND_API_KEY in .env
sed -i "s/RESEND_API_KEY=.*/RESEND_API_KEY=$api_key/" /app/backend/.env

echo "✅ API key updated in /app/backend/.env"
echo ""
echo "Current configuration:"
grep "RESEND_API_KEY" /app/backend/.env
grep "SENDER_EMAIL" /app/backend/.env
grep "ADMIN_EMAIL" /app/backend/.env

echo ""
echo "Restarting backend service..."
sudo supervisorctl restart backend

sleep 3

echo ""
echo "✅ Setup complete!"
echo ""
echo "Testing email configuration..."
tail -10 /var/log/supervisor/backend.out.log | grep -i "resend\|email"

echo ""
echo "=========================================="
echo "  Next Steps:"
echo "=========================================="
echo "1. Go to https://sanjaya-support.preview.emergentagent.com/get-started"
echo "2. Submit a test form"
echo "3. Check your email inbox!"
echo ""
echo "If emails don't arrive:"
echo "- Check Resend dashboard for delivery status"
echo "- Verify your email in Resend (for testing mode)"
echo "- Check backend logs: tail -f /var/log/supervisor/backend.out.log"
echo ""
