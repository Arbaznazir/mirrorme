# 🚀 MirrorMe Deployment Guide

## 🎯 Complete Deployment Strategy

### 1. 🚂 Backend Deployment (Railway)

#### Setup Railway Account

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway new mirrorme-backend
cd backend
railway link
```

#### Configure Environment Variables

```bash
# Set production environment variables in Railway dashboard:
DATABASE_URL=postgresql://user:pass@host:port/db  # Railway provides this
SECRET_KEY=your-super-secure-production-key-here
GEMINI_API_KEY=AIzaSyAopfZwaPlSZhT5zxAoXU9qRtYSoOTnWq0
ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app,chrome-extension://
ENVIRONMENT=production
```

#### Deploy Backend

```bash
# Add Railway configuration
echo "web: uvicorn main:app --host 0.0.0.0 --port $PORT" > Procfile

# Deploy
railway up

# Get your backend URL (e.g., https://mirrorme-backend.railway.app)
railway status
```

### 2. ⚡ Frontend Deployment (Vercel)

#### Setup Vercel Account

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login
```

#### Configure Frontend for Production

```bash
cd frontend

# Update API base URL for production
# Edit src/services/api.ts:
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://mirrorme-backend.railway.app';
```

#### Deploy Frontend

```bash
# Set environment variable
echo "REACT_APP_API_URL=https://your-railway-backend-url.railway.app" > .env.production

# Deploy to Vercel
vercel --prod

# Get your frontend URL (e.g., https://mirrorme.vercel.app)
```

### 3. 🧩 Chrome Extension Publishing

#### Prepare Extension for Production

```bash
cd extension

# Update manifest.json for production
# Replace localhost URLs with production URLs
```

#### Package and Submit

```bash
# Create production build
zip -r mirrorme-extension.zip . -x "*.git*" "node_modules/*" "*.md"

# Submit to Chrome Web Store:
# 1. Go to https://chrome.google.com/webstore/devconsole
# 2. Pay $5 one-time developer fee
# 3. Upload mirrorme-extension.zip
# 4. Fill out store listing
# 5. Submit for review (1-2 weeks)
```

### 4. 🔒 Security Configuration

#### Database Security (Railway)

```bash
# Railway automatically provides:
✅ SSL/TLS encryption
✅ Automatic backups
✅ Network isolation
✅ Environment variable encryption
```

#### CORS & Security Headers

```python
# backend/main.py - Add security middleware
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["mirrorme-backend.railway.app", "mirrorme.vercel.app"]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://mirrorme.vercel.app",
        "chrome-extension://*"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)
```

### 5. 🏗️ Domain Setup (Optional)

#### Custom Domain

```bash
# Buy domain (e.g., mirrorme.app)
# In Vercel: Add custom domain
# In Railway: Add custom domain
# Configure DNS:

# Frontend: mirrorme.app → Vercel
# Backend: api.mirrorme.app → Railway
```

### 6. 📊 Monitoring & Analytics

#### Add Basic Analytics

```bash
# Frontend: Add Vercel Analytics
npm install @vercel/analytics

# Backend: Add basic logging
pip install structlog
```

## 🎯 Deployment Checklist

- [ ] Railway backend deployed with PostgreSQL
- [ ] Vercel frontend deployed with production API URL
- [ ] Chrome extension packaged and submitted
- [ ] Environment variables secured
- [ ] CORS properly configured
- [ ] SSL/HTTPS enabled everywhere
- [ ] Database backups enabled
- [ ] Error monitoring setup
- [ ] Privacy policy deployed
- [ ] Terms of service deployed

## 🔗 Production URLs Structure

```
Frontend:     https://mirrorme.vercel.app
Backend API:  https://mirrorme-backend.railway.app
Chrome Store: https://chrome.google.com/webstore/detail/mirrorme/[extension-id]
```

## 💰 Estimated Costs

```
Railway (Backend):     $5-20/month (depends on usage)
Vercel (Frontend):     Free (hobby plan sufficient)
Chrome Web Store:      $5 one-time fee
Domain (optional):     $10-15/year
Total Monthly:         $5-20 + domain
```
