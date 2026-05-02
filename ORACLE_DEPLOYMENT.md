# Oracle Cloud + Coolify Deployment Guide

## Why Oracle Cloud + Coolify?

✅ **Completely Free**: 2 ARM-based VMs (4 cores, 24GB RAM total, 200GB storage)
✅ **No API Blocking**: Full server control - all your AI features will work
✅ **Next.js Compatible**: Works with any version of Next.js
✅ **Easy Management**: Coolify provides a beautiful UI for deployments
✅ **Better Performance**: Dedicated resources vs shared serverless

## Setup Steps

### 1. Create Oracle Cloud Account

1. Go to [Oracle Cloud](https://www.oracle.com/cloud/free/)
2. Sign up for free tier (requires credit card but no charges)
3. Create a new project or use default

### 2. Create Compute Instance

1. Go to Oracle Cloud Console > Compute > Instances
2. Click "Create Instance"
3. Configure:
   - **Name**: pulsecheck-ai
   - **Compartment**: Choose your compartment
   - **Availability Domain**: Any available
   - **Instance Type**: Virtual Machine
   - **Shape**: VM.Standard.A1.Flex (ARM-based)
   - **CPU**: 2 cores (you can use up to 4 for free)
   - **Memory**: 12GB (you can use up to 24GB for free)
   - **Boot Volume**: 50GB (you can use up to 200GB for free)
   - **Image**: Ubuntu 22.04 or Oracle Linux 8
   - **SSH Key**: Add your SSH public key
4. Click "Create Instance"

### 3. Install Coolify

Once your instance is running:

```bash
# SSH into your instance
ssh ubuntu@your-instance-ip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install Coolify
curl -fsSL https://coolify.io/install.sh | sudo bash
```

### 4. Configure Coolify

1. Access Coolify at `http://your-instance-ip:8000`
2. Create an admin account
3. Add your GitHub repository
4. Configure environment variables:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `GOOGLE_GENAI_API_KEY`
   - `OPENAI_API_KEY`
   - And other required env vars

### 5. Deploy Application

1. In Coolify, click "New Application"
2. Choose "Docker Compose"
3. Select your repository
4. Use the provided `docker-compose.yml`
5. Click "Deploy"

## Environment Variables Required

Add these in Coolify application settings:

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

## Benefits Over Vercel

- **No API Blocking**: All your AI features will work perfectly
- **Free Resources**: Much more generous than Vercel's free tier
- **Full Control**: Install any dependencies or services
- **Better Performance**: Dedicated resources vs shared
- **Cost Predictable**: Completely free for your usage level

## URL After Deployment

Your app will be available at: `http://your-instance-ip:3000`

## Troubleshooting

### Build Issues
- Check Coolify logs for build errors
- Ensure all environment variables are set
- Verify Docker container can access external APIs

### Performance Issues
- Monitor resource usage in Oracle Cloud Console
- Scale up CPU/memory if needed (still within free tier)

### Security
- Set up firewall rules to only allow necessary ports
- Use HTTPS with Let's Encrypt (Coolify can auto-configure)

## Migration from Vercel

1. Update your DNS to point to Oracle Cloud instance
2. Test all AI features to ensure they work
3. Monitor performance and resource usage
4. Cancel Vercel deployment once confirmed working

This setup will give you complete freedom to run your AI-powered health app without any API restrictions!
