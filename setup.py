#!/usr/bin/env python3
"""
MirrorMe Setup Script
Initializes the database and creates necessary files for development.
"""

import os
import sys
import sqlite3
from pathlib import Path


def create_database():
    """Create SQLite database and tables."""
    print("Creating database...")

    # Add backend directory to Python path
    backend_path = os.path.join(os.getcwd(), 'backend')
    sys.path.insert(0, backend_path)

    # Import and create tables
    try:
        from database import engine, Base
        from models import User, PersonaProfile, BehaviorLog, DataExport

        # Create all tables
        Base.metadata.create_all(bind=engine)
        print("Database tables created successfully!")

    except Exception as e:
        print(f"Database creation failed: {e}")
        return False

    finally:
        # Remove backend path from sys.path
        if backend_path in sys.path:
            sys.path.remove(backend_path)

    return True


def create_extension_icons():
    """Create placeholder icon files for the extension."""
    print("Creating extension icons...")

    icon_dir = Path("extension/icons")
    icon_dir.mkdir(exist_ok=True)

    # Create simple SVG icons (placeholder)
    icon_sizes = [16, 32, 48, 128]

    for size in icon_sizes:
        icon_content = f'''<svg width="{size}" height="{size}" viewBox="0 0 {size} {size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="{size}" height="{size}" rx="{size//8}" fill="url(#grad)"/>
  <text x="50%" y="50%" text-anchor="middle" dy="0.35em" fill="white" font-size="{size//2}" font-family="Arial">M</text>
</svg>'''

        with open(f"extension/icons/icon{size}.png", "w", encoding='utf-8') as f:
            f.write("# Placeholder - Replace with actual PNG icons\n")
            f.write(f"# Size: {size}x{size}\n")
            f.write("# Use the SVG below as reference:\n")
            f.write(icon_content)

    print("Placeholder icons created!")


def create_env_file():
    """Create .env file from template."""
    print("⚙️  Creating environment file...")

    env_path = Path("backend/.env")
    env_example_path = Path("backend/.env.example")

    if not env_path.exists() and env_example_path.exists():
        # Copy example to .env
        with open(env_example_path, 'r') as f:
            content = f.read()

        with open(env_path, 'w') as f:
            f.write(content)

        print("✅ .env file created from template")
        print("📝 Please update the .env file with your actual configuration")
    else:
        print("ℹ️  .env file already exists or template not found")


def install_dependencies():
    """Install Python dependencies."""
    print("📦 Installing Python dependencies...")

    try:
        import subprocess
        result = subprocess.run([
            sys.executable, "-m", "pip", "install", "-r", "backend/requirements.txt"
        ], capture_output=True, text=True)

        if result.returncode == 0:
            print("✅ Python dependencies installed successfully!")
        else:
            print(f"❌ Failed to install dependencies: {result.stderr}")
            return False

    except Exception as e:
        print(f"❌ Error installing dependencies: {e}")
        return False

    return True


def create_mobile_app_structure():
    """Create basic mobile app structure."""
    print("📱 Creating mobile app structure...")

    mobile_dir = Path("mobile-app")
    mobile_dir.mkdir(exist_ok=True)

    # Create package.json
    package_json = {
        "name": "mirrorme-mobile",
        "version": "1.0.0",
        "description": "MirrorMe Mobile PWA",
        "main": "index.html",
        "scripts": {
            "dev": "vite",
            "build": "vite build",
            "preview": "vite preview"
        },
        "dependencies": {
            "react": "^18.2.0",
            "react-dom": "^18.2.0"
        },
        "devDependencies": {
            "@vitejs/plugin-react": "^4.0.0",
            "vite": "^4.3.0",
            "tailwindcss": "^3.3.0"
        }
    }

    import json
    with open(mobile_dir / "package.json", "w") as f:
        json.dump(package_json, f, indent=2)

    # Create basic index.html
    index_html = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MirrorMe Mobile</title>
    <link rel="manifest" href="/manifest.json">
    <meta name="theme-color" content="#667eea">
</head>
<body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
</body>
</html>'''

    with open(mobile_dir / "index.html", "w") as f:
        f.write(index_html)

    print("✅ Mobile app structure created!")


def main():
    """Main setup function."""
    print("Setting up MirrorMe...")
    print("=" * 50)

    # Check if we're in the right directory
    if not Path("README.md").exists():
        print("Please run this script from the MirrorMe root directory")
        sys.exit(1)

    success = True

    # Install dependencies
    if not install_dependencies():
        success = False

    # Create environment file
    create_env_file()

    # Create database
    if not create_database():
        success = False

    # Create extension icons
    create_extension_icons()

    # Create mobile app structure
    create_mobile_app_structure()

    print("\n" + "=" * 50)

    if success:
        print("MirrorMe setup completed successfully!")
        print("\nNext steps:")
        print("1. Update backend/.env with your configuration")
        print("2. Start the backend: cd backend && uvicorn main:app --reload")
        print("3. Load the extension in Chrome (Developer mode)")
        print("4. Start browsing to collect data!")
        print("\nAPI Documentation: http://localhost:8000/docs")
    else:
        print("Setup completed with some errors. Please check the output above.")


if __name__ == "__main__":
    main()
