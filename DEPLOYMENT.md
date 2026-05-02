# Firebase Deployment Guide for PulseCheck AI

## Migration from Vercel to Firebase

This guide will help you deploy your PulseCheck AI application to Firebase Hosting with Cloud Functions, which will solve the API blocking issues you experienced on Vercel.

## Prerequisites

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

## Deployment Steps

### 1. Install Dependencies

```bash
# Install main project dependencies
npm install

# Install Firebase Functions dependencies
cd functions
npm install
cd ..
```

### 2. Test Locally

```bash
# Start Firebase emulators
npm run firebase:serve

# Or test the Next.js app locally
npm run dev
```

### 3. Deploy to Firebase

```bash
# Build and deploy everything
npm run build:firebase

# Or deploy step by step:
npm run build
npm run firebase:deploy
```

## Configuration

### Environment Variables

Make sure to set these environment variables in your Firebase project:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `healthsense-ai-prod-478`
3. Go to Project Settings > Functions
4. Add these environment variables:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=healthsense-ai-prod-478
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

GOOGLE_GENAI_API_KEY=your_google_ai_key
OPENAI_API_KEY=your_openai_key
```

## Benefits of Firebase Hosting

✅ **No API Blocking**: All your AI API calls will work without restrictions
✅ **Free Tier**: Generous free limits for development and moderate traffic
✅ **Firebase Integration**: Seamless with your existing Auth and Firestore
✅ **Global CDN**: Fast performance worldwide
✅ **Serverless Functions**: Your API routes run as Cloud Functions

## Troubleshooting

### Build Issues
```bash
# Clear Next.js cache
rm -rf .next
npm run build

# Clear Firebase cache
firebase deploy --only functions --force
```

### Function Timeout
- Check Firebase console for function logs
- Increase timeout in `firebase.json` if needed

### Environment Variables
- Ensure all required environment variables are set in Firebase console
- Restart functions after updating variables

## URLs After Deployment

- **Hosting**: https://healthsense-ai-prod-478.web.app
- **Functions**: https://us-central1-healthsense-ai-prod-478.cloudfunctions.net
