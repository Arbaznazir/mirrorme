# 🚀 MirrorMe Deployment Guide

This guide covers deploying MirrorMe from development to production.

## 📋 Prerequisites

- Python 3.8+
- Node.js 16+
- Chrome browser (for extension testing)
- PostgreSQL (for production) or SQLite (for development)

## 🛠️ Development Setup

### 1. Clone and Setup

```bash
git clone <repository-url>
cd mirror-me
python setup.py
```

### 2. Configure Environment

Edit `backend/.env`:

```env
# Database (SQLite for development)
DATABASE_URL=sqlite:///./mirrorme.db

# JWT Secret (generate a secure key for production)
SECRET_KEY=your-super-secret-jwt-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# OpenAI API (optional, for AI-powered insights)
OPENAI_API_KEY=your-openai-api-key-here

# CORS Origins
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,chrome-extension://

# Environment
ENVIRONMENT=development
```

### 3. Start Development Server

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API will be available at: http://localhost:8000
Documentation: http://localhost:8000/docs

### 4. Load Chrome Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `extension` folder
5. The MirrorMe extension should now be active

## 🌐 Production Deployment

### Backend Deployment (Fly.io)

1. **Install Fly CLI**

   ```bash
   # Install flyctl
   curl -L https://fly.io/install.sh | sh
   ```

2. **Create Fly App**

   ```bash
   cd backend
   fly launch
   ```

3. **Set Environment Variables**

   ```bash
   fly secrets set SECRET_KEY="your-production-secret-key"
   fly secrets set DATABASE_URL="postgresql://user:pass@host:port/dbname"
   fly secrets set OPENAI_API_KEY="your-openai-key"
   fly secrets set ENVIRONMENT="production"
   ```

4. **Deploy**
   ```bash
   fly deploy
   ```

### Database Setup (PostgreSQL)

For production, use PostgreSQL:

```sql
-- Create database
CREATE DATABASE mirrorme_prod;

-- Create user
CREATE USER mirrorme_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE mirrorme_prod TO mirrorme_user;
```

Update your `.env`:

```env
DATABASE_URL=postgresql://mirrorme_user:secure_password@localhost:5432/mirrorme_prod
```

### Extension Distribution

#### Chrome Web Store

1. **Prepare Extension Package**

   ```bash
   cd extension
   zip -r mirrorme-extension.zip . -x "*.git*" "node_modules/*"
   ```

2. **Upload to Chrome Web Store**
   - Go to [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
   - Create new item
   - Upload the zip file
   - Fill in store listing details
   - Submit for review

#### Self-Hosted Distribution

For enterprise or beta testing:

```bash
# Create signed extension package
cd extension
# Package extension with Chrome's packaging tools
```

## 🔒 Security Considerations

### Backend Security

1. **Environment Variables**

   - Never commit `.env` files
   - Use strong, unique secrets
   - Rotate keys regularly

2. **Database Security**

   - Use connection pooling
   - Enable SSL for database connections
   - Regular backups

3. **API Security**
   - Rate limiting (implement with Redis)
   - Input validation
   - CORS configuration
   - HTTPS only in production

### Extension Security

1. **Content Security Policy**

   - Restrict external resources
   - Use nonce for inline scripts

2. **Permissions**

   - Request minimal permissions
   - Explain permission usage to users

3. **Data Handling**
   - Encrypt sensitive data
   - Local storage limits
   - Clear data on uninstall

## 📊 Monitoring & Analytics

### Backend Monitoring

```python
# Add to main.py
import logging
from fastapi import Request
import time

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time

    logger.info(
        f"{request.method} {request.url} - "
        f"Status: {response.status_code} - "
        f"Time: {process_time:.4f}s"
    )
    return response
```

### Error Tracking

Consider integrating:

- Sentry for error tracking
- DataDog for performance monitoring
- LogRocket for user session replay

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy MirrorMe

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: "3.9"
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
      - name: Run tests
        run: |
          cd backend
          pytest

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Fly.io
        uses: superfly/flyctl-actions/setup-flyctl@master
      - run: |
          cd backend
          flyctl deploy --remote-only
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

## 📱 Mobile PWA Deployment

### Build PWA

```bash
cd mobile-app
npm install
npm run build
```

### Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

### PWA Configuration

Ensure `manifest.json` is properly configured:

```json
{
  "name": "MirrorMe Mobile",
  "short_name": "MirrorMe",
  "description": "Digital Identity Reflection",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#667eea",
  "theme_color": "#667eea",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

## 🧪 Testing

### Backend Tests

```bash
cd backend
pytest tests/ -v
```

### Extension Testing

1. **Manual Testing**

   - Load extension in Chrome
   - Test all user flows
   - Check data collection
   - Verify sync functionality

2. **Automated Testing**
   ```bash
   # Install Puppeteer for extension testing
   npm install puppeteer
   ```

### Load Testing

```bash
# Install artillery
npm install -g artillery

# Run load tests
artillery run load-test.yml
```

## 📈 Scaling Considerations

### Database Scaling

1. **Read Replicas**

   - Separate read/write operations
   - Use read replicas for analytics

2. **Partitioning**
   - Partition behavior logs by date
   - Archive old data

### API Scaling

1. **Horizontal Scaling**

   - Multiple API instances
   - Load balancer (nginx/HAProxy)

2. **Caching**
   - Redis for session storage
   - CDN for static assets

### Extension Scaling

1. **Background Sync**

   - Batch API calls
   - Retry mechanisms
   - Offline support

2. **Data Management**
   - Local storage cleanup
   - Compression for large datasets

## 🔧 Maintenance

### Regular Tasks

1. **Database Maintenance**

   ```sql
   -- Clean old behavior logs (older than 1 year)
   DELETE FROM behavior_logs
   WHERE timestamp < NOW() - INTERVAL '1 year';

   -- Vacuum and analyze
   VACUUM ANALYZE;
   ```

2. **Log Rotation**

   ```bash
   # Setup logrotate for application logs
   sudo nano /etc/logrotate.d/mirrorme
   ```

3. **Security Updates**
   ```bash
   # Update dependencies regularly
   pip-audit  # Check for security vulnerabilities
   npm audit  # Check Node.js dependencies
   ```

### Backup Strategy

1. **Database Backups**

   ```bash
   # Daily automated backups
   pg_dump mirrorme_prod > backup_$(date +%Y%m%d).sql
   ```

2. **Configuration Backups**
   - Store configs in version control
   - Backup environment variables securely

## 📞 Support & Troubleshooting

### Common Issues

1. **Extension Not Loading**

   - Check manifest.json syntax
   - Verify permissions
   - Check Chrome console for errors

2. **API Connection Issues**

   - Verify CORS settings
   - Check network connectivity
   - Validate API endpoints

3. **Database Connection Issues**
   - Check connection string
   - Verify database is running
   - Check firewall settings

### Getting Help

- Check the [GitHub Issues](https://github.com/your-repo/issues)
- Review API documentation at `/docs`
- Check browser console for errors
- Enable debug logging in development

---

**Remember**: Always test deployments in a staging environment before production!
