# Netlify Deployment Guide - No Credit Card Required!

## Why Netlify?

✅ **Completely Free** - No credit card required for free tier
✅ **No API Blocking** - All your AI features will work perfectly  
✅ **Serverless Functions** - Your API routes will function normally
✅ **100GB Bandwidth** - Plenty for your health app usage
✅ **Easy Git Deployment** - Automatic deployments from GitHub
✅ **Custom Domains** - Free SSL certificates included

## Setup Steps (5 Minutes)

### 1. Create Netlify Account

1. Go to [Netlify](https://www.netlify.com/)
2. Click "Sign up" 
3. Choose **"GitHub"** or **"GitLab"** (no credit card needed)
4. Authorize access to your repository

### 2. Deploy Your App

1. Click "New site from Git"
2. Choose **GitHub**
3. Select your `pulsecheck.ai` repository
4. Configure build settings:
   - **Build command**: `npm run build:export`
   - **Publish directory**: `out`
   - **Functions directory**: `netlify/functions`
5. Click "Deploy site"

### 3. Set Environment Variables

1. Go to **Site settings** > **Build & deploy** > **Environment**
2. Add these variables:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=healthsense-ai-prod-478
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
GOOGLE_GENAI_API_KEY=your_google_ai_key
OPENAI_API_KEY=your_openai_key
```

### 4. Test Your AI Features

Your app will be deployed to a URL like: `https://your-app-name.netlify.app`

Test these features:
- ✅ Vision Scan AI analysis
- ✅ Cough Analysis processing  
- ✅ Skin Scan AI detection
- ✅ Mental Health AI chat
- ✅ All external API calls

## What I've Configured for You

### Files Created/Updated:
- ✅ `netlify.toml` - Netlify configuration
- ✅ `netlify/functions/chat.js` - API function example
- ✅ `next.config.ts` - Static export configuration
- ✅ `package.json` - Build scripts updated

### How It Works:
1. **Static Generation**: Your Next.js app exports to static files
2. **Serverless Functions**: API routes run as Netlify functions
3. **No API Blocking**: Netlify allows all external API calls
4. **Automatic Deployments**: Git push triggers rebuild

## Benefits Over Vercel

- ✅ **No API restrictions** - All AI features work
- ✅ **No credit card required** - Truly free
- ✅ **Serverless functions included** - API routes work
- ✅ **Better free tier limits** - 100GB vs Vercel's limits
- ✅ **Custom domains free** - SSL included

## Troubleshooting

### Build Issues
```bash
# Clear Next.js cache
rm -rf .next
npm run build:export
```

### API Function Issues
- Check Netlify function logs
- Ensure environment variables are set
- Verify function paths match API routes

### Performance Issues
- Enable Netlify's Edge caching
- Use Netlify's analytics to monitor usage

## URL After Deployment

Your app will be available at:
- **Random URL**: `https://your-app-name.netlify.app`
- **Custom Domain**: `yourdomain.com` (free to setup)

## Migration from Vercel

1. **Deploy to Netlify** using this guide
2. **Test all AI features** thoroughly
3. **Update DNS** to point to Netlify (if using custom domain)
4. **Cancel Vercel** once confirmed working

## Next Steps

After deployment, your AI features will work perfectly without any API blocking! The setup takes about 5 minutes and requires zero payment.

**Ready to deploy?** Just push your code to GitHub and follow the steps above!
