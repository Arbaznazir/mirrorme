# 🪞 MirrorMe Complete Setup Guide

## Overview

MirrorMe is a privacy-first digital identity reflection platform that uses AI to analyze your browsing behavior and create personalized insights. Here's how to get everything working:

## 🚀 Quick Start

### 1. Start the Application

```bash
# Run this from the MirrorMe project root directory
.\start-mirrorme.bat
```

This will automatically start:

- **Backend API** on http://localhost:8001
- **Frontend Dashboard** on http://localhost:3000

## 🔧 Complete Setup

### 2. Set Up AI Analysis (Optional but Recommended)

#### Get OpenAI API Key:

1. Go to https://platform.openai.com/api-keys
2. Create an account or sign in
3. Generate a new API key
4. Copy the key (starts with `sk-...`)

#### Configure the API Key:

Create a `.env` file in the `backend/` folder:

```bash
# backend/.env
OPENAI_API_KEY=sk-your-actual-api-key-here
```

**Without OpenAI**: The system will work with basic analysis using fallback algorithms.

### 3. Install Browser Extension

#### For Chrome/Edge:

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `extension/` folder from your MirrorMe directory
5. The MirrorMe extension should now appear in your browser

#### For Firefox:

1. Go to `about:debugging`
2. Click "This Firefox"
3. Click "Load Temporary Add-on"
4. Select `extension/manifest.json`

### 4. Create Your Account

1. Open http://localhost:3000
2. Click "Create Account"
3. Fill in your details and register
4. Login to access your dashboard

## 📊 How It Works

### Data Collection

- **Browser Extension**: Collects browsing patterns, search queries, time spent on sites
- **Privacy-First**: All data stays on your local machine
- **Selective**: You control what data is analyzed

### AI Analysis

- **Pattern Recognition**: Identifies your interests and topics
- **Sentiment Analysis**: Understands your emotional engagement
- **Personality Traits**: Extracts behavioral patterns
- **Natural Language**: Generates human-readable insights

### Learning Process

1. **Extension collects** anonymized browsing metadata
2. **Backend processes** and stores behavior logs
3. **AI engine analyzes** patterns and generates insights
4. **Dashboard displays** your digital persona reflection

## 🎯 Using MirrorMe

### Dashboard Features:

- **Analyze Persona**: Generate AI insights from your behavior
- **Log Sample Data**: Add test behavior for demonstration
- **Export Data**: Download your complete data set
- **Privacy Controls**: Manage what data is included

### Extension Features:

- **Automatic Tracking**: Passive behavior collection
- **Privacy Toggle**: Enable/disable tracking
- **Manual Logging**: Add specific behaviors
- **Sync Status**: See connection to your account

## 🔒 Privacy & Security

### Data Storage:

- **Local SQLite Database**: All data stored on your machine
- **No Cloud Sync**: Data never leaves your device
- **User Controlled**: Delete data anytime

### What's Collected:

- ✅ Website categories and topics
- ✅ Search keywords (anonymized)
- ✅ Time spent patterns
- ✅ General browsing behavior

### What's NOT Collected:

- ❌ Personal information or passwords
- ❌ Specific URLs or page content
- ❌ Private/incognito browsing
- ❌ Financial or sensitive data

## 🛠️ Troubleshooting

### Backend Issues:

```bash
# If backend won't start:
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8001
```

### Frontend Issues:

```bash
# If frontend won't start:
cd frontend
npm install
npm start
```

### Extension Issues:

- Check that backend is running on port 8001
- Verify extension permissions in browser settings
- Look for errors in browser developer console

### AI Analysis Not Working:

- Verify OpenAI API key in `.env` file
- Check API key has credits/usage available
- System will use fallback analysis without OpenAI

## 📈 Getting Better Results

### For Better AI Analysis:

1. **Use the extension** for at least a few days
2. **Browse diverse content** to show varied interests
3. **Log sample behaviors** to seed the analysis
4. **Run analysis regularly** to see evolution

### Sample Behaviors to Log:

- Search for topics you're interested in
- Visit educational content
- Explore hobby-related sites
- Read news in areas you care about

## 🔄 Development

### File Structure:

```
MirrorMe/
├── backend/          # FastAPI server
├── frontend/         # React dashboard
├── extension/        # Browser extension
├── start-mirrorme.bat # Quick startup script
└── SETUP_GUIDE.md   # This file
```

### Key Components:

- **Backend API**: Authentication, behavior logging, AI analysis
- **Frontend Dashboard**: User interface and data visualization
- **Browser Extension**: Data collection and user interaction
- **AI Engine**: OpenAI-powered persona analysis
- **Database**: SQLite for local data storage

## 🎉 You're Ready!

Once everything is set up:

1. **Start the servers** with `start-mirrorme.bat`
2. **Install the extension** in your browser
3. **Create an account** at http://localhost:3000
4. **Browse normally** - the extension will collect data
5. **Analyze your persona** from the dashboard
6. **Explore your digital reflection**!

---

**Need Help?** Check the browser console and terminal output for error messages.
