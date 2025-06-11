# MirrorMe Frontend

A beautiful, modern React TypeScript frontend for the MirrorMe digital identity reflection platform.

## 🚀 Features

- **Modern UI/UX**: Built with React, TypeScript, and Tailwind CSS
- **Authentication**: Complete login/register flow with JWT tokens
- **Dashboard**: Interactive persona analysis and insights
- **Privacy-First**: Transparent data handling and user controls
- **Responsive**: Works beautifully on desktop and mobile
- **Real-time**: Live updates and seamless API integration

## 🛠️ Tech Stack

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API communication
- **Context API** for state management

## 📦 Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

## 🔧 Configuration

The frontend connects to the MirrorMe API at `http://localhost:8001` by default. You can modify this in `src/services/api.ts`.

## 🎨 Design System

### Colors

- **Primary**: Blue gradient (`primary-500` to `primary-700`)
- **Mirror**: Neutral grays (`mirror-50` to `mirror-900`)
- **Accents**: Green, purple, and blue for different features

### Components

- **Glass Cards**: Semi-transparent cards with backdrop blur
- **Buttons**: Primary and secondary button styles
- **Forms**: Consistent input styling with focus states
- **Animations**: Smooth transitions and loading states

## 📱 Pages

### Landing Page (`/`)

- Hero section with MirrorMe branding
- Feature highlights
- Call-to-action buttons

### Authentication

- **Login** (`/login`): User sign-in
- **Register** (`/register`): New user registration

### Dashboard (`/dashboard`)

- User profile and persona insights
- AI analysis results
- Data management controls

## 🔐 Authentication Flow

1. User registers or logs in
2. JWT token stored in localStorage
3. Token automatically added to API requests
4. Protected routes redirect to login if not authenticated
5. Public routes redirect to dashboard if authenticated

## 🎯 Key Features

### Persona Analysis

- AI-generated personality insights
- Topic and interest categorization
- Confidence scoring
- Visual data representation

### Privacy Controls

- Data export functionality
- Clear privacy messaging
- User-controlled data sharing

### User Experience

- Loading states and error handling
- Responsive design
- Smooth animations
- Intuitive navigation

## 🚀 Development

```bash
# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build

# Lint code
npm run lint
```

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── Login.tsx       # Login page
│   ├── Register.tsx    # Registration page
│   └── Dashboard.tsx   # Main dashboard
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication state
├── services/           # API services
│   └── api.ts         # Backend API integration
├── App.tsx            # Main app component
├── index.tsx          # App entry point
└── index.css          # Global styles
```

## 🌐 API Integration

The frontend integrates with the MirrorMe FastAPI backend:

- **Authentication**: Login, register, logout
- **Persona**: Get profile, analyze behavior
- **Behavior**: Log activities, export data
- **Health**: API status checks

## 🎨 Styling

Built with Tailwind CSS featuring:

- Custom color palette
- Glass morphism effects
- Smooth animations
- Responsive breakpoints
- Dark mode ready

## 📱 Responsive Design

- **Mobile**: Optimized for touch interfaces
- **Tablet**: Adaptive layouts
- **Desktop**: Full feature experience

## 🔒 Security

- JWT token management
- Automatic token refresh
- Secure API communication
- Input validation
- XSS protection

## 🚀 Deployment

```bash
# Build for production
npm run build

# Serve static files
npx serve -s build
```

The build folder contains optimized static files ready for deployment to any web server or CDN.

---

Built with ❤️ for privacy-conscious digital identity reflection.
