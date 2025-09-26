#!/bin/bash

# Add all required environment variables to Vercel

echo "Adding environment variables to Vercel..."

# Read from .env file
source .env

# Add DRIVE_ID
echo "$VITE_GDRIVE_ID" | vercel env add DRIVE_ID production

# Add all folder IDs
echo "$VITE_GDRIVE_ANALYTICS_FOLDER_ID" | vercel env add DRIVE_FOLDER_ANALYTICS_ID production
echo "$VITE_GDRIVE_MERCHANT_FOLDER_ID" | vercel env add DRIVE_FOLDER_MERCHANT_ID production
echo "$VITE_GDRIVE_REWARDS_FOLDER_ID" | vercel env add DRIVE_FOLDER_REWARDS_ID production
echo "$VITE_GDRIVE_NEWS_FOLDER_ID" | vercel env add DRIVE_FOLDER_NEWS_ID production
echo "$VITE_GDRIVE_LOCALIZATION_FOLDER_ID" | vercel env add DRIVE_FOLDER_LOCALIZATION_ID production
echo "$VITE_GDRIVE_SDK_FOLDER_ID" | vercel env add DRIVE_FOLDER_SDK_ID production
echo "$VITE_GDRIVE_PERSONALIZATION_FOLDER_ID" | vercel env add DRIVE_FOLDER_PERSONALIZATION_ID production
echo "$VITE_GDRIVE_LIVEOPS_FOLDER_ID" | vercel env add DRIVE_FOLDER_LIVEOPS_ID production
echo "$VITE_GDRIVE_UIBUILDER_FOLDER_ID" | vercel env add DRIVE_FOLDER_UIBUILDER_ID production
echo "$VITE_GDRIVE_WEBSHOP_FOLDER_ID" | vercel env add DRIVE_FOLDER_WEBSHOP_ID production
echo "$VITE_GDRIVE_LOYALTY_FOLDER_ID" | vercel env add DRIVE_FOLDER_LOYALTY_ID production

# Add Service Account JSON
echo "$GOOGLE_SERVICE_ACCOUNT_JSON" | vercel env add GOOGLE_SERVICE_ACCOUNT_JSON production

echo "Done! All environment variables added to Vercel."
