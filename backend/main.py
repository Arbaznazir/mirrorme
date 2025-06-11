from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from config import settings
from routers import auth, behavior, persona

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="MirrorMe API",
    description="Privacy-first digital persona analysis API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(behavior.router)
app.include_router(persona.router)


@app.get("/")
def read_root():
    """Root endpoint with API information."""
    return {
        "message": "🪞 MirrorMe API - Digital Identity Reflection",
        "version": "1.0.0",
        "docs": "/docs",
        "privacy": "Local-first, user-controlled data",
        "status": "active"
    }


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "environment": settings.environment,
        "database": "connected"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
