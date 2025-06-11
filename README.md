# 🪞 MirrorMe - Digital Identity Reflection

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-green.svg)](https://fastapi.tiangolo.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-blue.svg)](https://www.typescriptlang.org/)

> Privacy-first digital persona analysis platform that creates a unified mirror of your online identity.

## ✨ Features

- 🔒 **Privacy-First**: All data processing happens locally or with user consent
- 🧠 **AI-Powered Analysis**: Advanced behavioral pattern recognition
- 🌐 **Cross-Platform**: Web app, Chrome extension, and mobile support
- 📊 **Real-Time Insights**: Live dashboard with perception analytics
- 🎯 **Personalized Recommendations**: Tailored digital identity optimization
- 🔄 **Data Portability**: Export your digital persona data anytime

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm
- Python 3.8+
- Google Gemini API key ([Get one free](https://makersuite.google.com/app/apikey))

### Development Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/mirrorme.git
   cd mirrorme
   ```

2. **Setup Backend**

   ```bash
   cd backend
   pip install -r requirements.txt
   cp .env.example .env
   # Edit .env with your Gemini API key
   ```

3. **Setup Frontend**

   ```bash
   cd frontend
   npm install
   ```

4. **Start Development Servers**

   ```bash
   # From project root
   ./start-mirrorme.bat  # Windows
   # or
   ./start-mirrorme.sh   # Linux/Mac
   ```

5. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8001
   - API Docs: http://localhost:8001/docs

## 📁 Project Structure

```
mirrorme/
├── backend/          # FastAPI backend
│   ├── main.py       # API entry point
│   ├── models.py     # Database models
│   ├── routers/      # API endpoints
│   └── ai_engine.py  # AI analysis engine
├── frontend/         # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   └── contexts/
│   └── public/
├── extension/        # Chrome extension
│   ├── manifest.json
│   ├── popup/
│   └── background.js
├── mobile-app/       # React Native app (coming soon)
└── docs/            # Documentation
```

## 🔧 Configuration

### Environment Variables

**Backend (.env)**

```env
GEMINI_API_KEY=your_gemini_api_key_here
SECRET_KEY=your_jwt_secret_key
DATABASE_URL=sqlite:///./mirrorme.db
ALLOWED_ORIGINS=http://localhost:3000,chrome-extension://
```

**Frontend (.env)**

```env
REACT_APP_API_URL=http://localhost:8001
```

## 🚀 Deployment

### Production Deployment

1. **Backend (Railway)**

   ```bash
   npm install -g @railway/cli
   railway login
   cd backend
   railway new mirrorme-backend
   railway up
   ```

2. **Frontend (Vercel)**

   ```bash
   npm install -g vercel
   cd frontend
   vercel --prod
   ```

3. **Chrome Extension**
   - Package: `zip -r mirrorme-extension.zip extension/`
   - Submit to Chrome Web Store

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed instructions.

## 🛠️ Tech Stack

### Frontend

- **React 19** with TypeScript
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **React Router** for navigation
- **Axios** for API communication

### Backend

- **FastAPI** with Python
- **SQLAlchemy** ORM
- **Pydantic** for data validation
- **JWT** authentication
- **Google Gemini AI** integration

### Extension

- **Manifest V3** Chrome extension
- **JavaScript** content scripts
- **HTML/CSS** popup interface

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔒 Privacy & Security

- All sensitive data is encrypted
- No personal data is stored without consent
- Users maintain full control of their data
- GDPR compliant data handling
- Local-first processing when possible

## 📞 Support

- 📧 Email: support@mirrorme.app
- 💬 Discord: [Join our community](https://discord.gg/mirrorme)
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/mirrorme/issues)
- 📖 Docs: [Documentation](https://docs.mirrorme.app)

## 🗺️ Roadmap

- [ ] Mobile app release
- [ ] Advanced AI models integration
- [ ] Team collaboration features
- [ ] API for third-party integrations
- [ ] Enterprise dashboard
- [ ] Multi-language support

---

<div align="center">
  <b>Built with ❤️ for digital privacy and self-awareness</b>
</div>
