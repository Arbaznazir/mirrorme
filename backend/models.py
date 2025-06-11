from sqlalchemy import Column, Integer, String, DateTime, Text, JSON, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    personas = relationship("PersonaProfile", back_populates="user")
    behavior_logs = relationship("BehaviorLog", back_populates="user")


class PersonaProfile(Base):
    __tablename__ = "persona_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Core persona data (metadata only, not raw logs)
    # ["technology", "health", "finance"]
    top_topics = Column(JSON, default=list)
    # {"positive": 0.7, "neutral": 0.2, "negative": 0.1}
    emotional_tone = Column(JSON, default=dict)
    interest_map = Column(JSON, default=dict)  # Network graph of interests
    # Detected biases and growth patterns
    bias_score = Column(JSON, default=dict)

    # AI-generated insights
    persona_summary = Column(Text, nullable=True)  # Natural language summary
    # ["curious", "analytical", "health-conscious"]
    personality_traits = Column(JSON, default=list)

    # Metadata
    last_analysis = Column(DateTime(timezone=True), nullable=True)
    data_points_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="personas")


class BehaviorLog(Base):
    __tablename__ = "behavior_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Source information
    source = Column(String, nullable=False)  # "extension", "mobile_app"
    device_id = Column(String, nullable=True)  # Anonymous device identifier

    # Behavior metadata (NOT raw data)
    # "search", "visit", "tweet_view", "youtube_video_watch", etc.
    behavior_type = Column(String, nullable=False)
    category = Column(String, nullable=True)  # "technology", "health", etc.
    keywords = Column(JSON, default=list)  # Extracted keywords only

    # Enhanced content analysis
    # Limited content for analysis (280 chars for tweets)
    content = Column(String, nullable=True)
    # "positive", "neutral", "negative"
    sentiment = Column(String, nullable=True)
    # "left", "right", "neutral"
    political_tilt = Column(String, nullable=True)
    confidence = Column(JSON, nullable=True)  # Confidence score for analysis

    # Platform-specific metadata
    author = Column(String, nullable=True)  # Tweet author, channel name, etc.
    video_id = Column(String, nullable=True)  # YouTube video ID
    channel = Column(String, nullable=True)  # YouTube channel name

    # Temporal data
    session_duration = Column(Integer, nullable=True)  # In seconds
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    # Privacy flags
    is_sensitive = Column(Boolean, default=False)  # User can mark as sensitive
    include_in_analysis = Column(Boolean, default=True)  # User can exclude

    # Relationships
    user = relationship("User", back_populates="behavior_logs")


class DataExport(Base):
    __tablename__ = "data_exports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # "full", "persona_only", "metadata_only"
    export_type = Column(String, nullable=False)
    file_path = Column(String, nullable=True)  # Encrypted file location
    expires_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
