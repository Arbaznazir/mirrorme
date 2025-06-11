@echo off
echo 🚀 Setting up MirrorMe for GitHub...
echo.

REM Initialize git repository
echo Initializing Git repository...
git init

REM Add all files (respecting .gitignore)
echo Adding files to Git...
git add .

REM Create initial commit
echo Creating initial commit...
git commit -m "🎉 Initial commit: MirrorMe v1.0.0 - Privacy-first digital persona platform"

echo.
echo ✅ Git repository initialized successfully!
echo.
echo 📋 Next steps:
echo 1. Create a new repository on GitHub.com
echo 2. Copy the repository URL
echo 3. Run: git remote add origin YOUR_REPO_URL
echo 4. Run: git branch -M main
echo 5. Run: git push -u origin main
echo.
echo 🔗 GitHub Repository URL format:
echo https://github.com/YOUR_USERNAME/mirrorme.git
echo.
pause 